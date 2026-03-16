<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Subscription;
use App\Models\Notification;
use App\Mail\BillGenerated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BillController extends Controller
{
    public function index(Request $request)
    {
        $query = Bill::with('user', 'subscription.plan');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            })->orWhere('bill_number', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function show(Bill $bill)
    {
        return response()->json($bill->load('user', 'subscription.plan', 'payments'));
    }

    public function generate(Request $request)
    {
        $subscriptions = Subscription::where('status', 'active')
            ->with('user', 'plan')
            ->get();

        if ($subscriptions->isEmpty()) {
            return response()->json(['message' => 'No active subscribers found.'], 422);
        }

        $generated = 0;
        $skipped   = 0;
        $periodStart = now()->startOfMonth();
        $periodEnd   = now()->endOfMonth();

        foreach ($subscriptions as $subscription) {
            // Skip if a bill already exists for this period
            $exists = Bill::where('subscription_id', $subscription->id)
                ->where('billing_period_start', $periodStart->toDateString())
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            $bill = Bill::create([
                'user_id'              => $subscription->user_id,
                'subscription_id'      => $subscription->id,
                'bill_number'          => 'BILL-' . strtoupper(Str::random(10)),
                'amount'               => $subscription->plan->price,
                'billing_period_start' => $periodStart->toDateString(),
                'billing_period_end'   => $periodEnd->toDateString(),
                'due_date'             => now()->addDays(15)->toDateString(),
                'status'               => 'unpaid',
            ]);

            // Update next billing date
            $subscription->update(['next_billing_date' => now()->addMonth()]);

            // In-app notification
            Notification::create([
                'user_id' => $subscription->user_id,
                'title'   => 'New Bill Generated',
                'message' => "Your bill of ₱{$bill->amount} is due on {$bill->due_date}.",
                'type'    => 'info',
                'link'    => '/customer/billing',
            ]);

            Mail::to($subscription->user->email)->queue(new BillGenerated($bill));

            $generated++;
        }

        return response()->json([
            'message'   => "Bill generation complete.",
            'generated' => $generated,
            'skipped'   => $skipped,
        ]);
    }

    public function markPaid(Request $request, Bill $bill)
    {
        if ($bill->status === 'paid') {
            return response()->json(['message' => 'Bill is already paid.'], 422);
        }

        $bill->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json(['message' => 'Bill marked as paid.', 'bill' => $bill]);
    }

    public function cancel(Request $request, Bill $bill)
    {
        if ($bill->status === 'paid') {
            return response()->json(['message' => 'Cannot cancel a paid bill.'], 422);
        }

        $bill->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Bill cancelled.', 'bill' => $bill]);
    }
}
