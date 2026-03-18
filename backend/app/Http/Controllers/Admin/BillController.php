<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Subscription;
use App\Support\SendsSystemNotifications;
use Illuminate\Http\Request;

class BillController extends Controller
{
    use SendsSystemNotifications;

    public function index(Request $request)
    {
        $bills = Bill::with('user')->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($bills);
    }

    public function show($id)
    {
        $bill = Bill::with(['user', 'payments'])->findOrFail($id);
        return response()->json($bill);
    }

    public function markPaid($id)
    {
        $bill = Bill::findOrFail($id);
        $bill->status = 'paid';
        $bill->paid_at = now();
        $bill->save();

        return response()->json(['message' => 'Bill marked as paid.', 'bill' => $bill]);
    }

    public function cancel($id)
    {
        $bill = Bill::findOrFail($id);
        $bill->status = 'cancelled';
        $bill->save();

        return response()->json(['message' => 'Bill cancelled.', 'bill' => $bill]);
    }

    public function generate(Request $request)
    {
        // Simple scaffold for generating bills for active subscriptions
        $subscriptions = Subscription::with(['plan', 'user'])->where('status', 'active')->get();
        $generatedCount = 0;

        foreach ($subscriptions as $sub) {
            // Check if bill for this period already exists (basic check)
            $existing = Bill::where('subscription_id', $sub->id)
                ->where('billing_period_start', '>=', now()->startOfMonth())
                ->exists();

            if (!$existing) {
                $bill = Bill::create([
                    'user_id' => $sub->user_id,
                    'subscription_id' => $sub->id,
                    'bill_number' => 'INV-' . strtoupper(uniqid()),
                    'amount' => $sub->plan->price,
                    'billing_period_start' => now()->startOfMonth(),
                    'billing_period_end' => now()->endOfMonth(),
                    'due_date' => now()->addDays(15),
                    'status' => 'unpaid'
                ]);
                $generatedCount++;

                if ($sub->user?->email) {
                    $this->sendSystemEmail(
                        $sub->user->email,
                        'New Bill Generated',
                        "Hi {$sub->user->first_name},\n\nA new bill ({$bill->bill_number}) has been generated for your {$sub->plan->name} subscription.\nAmount due: PHP " . number_format((float) $bill->amount, 2) . "\nDue date: {$bill->due_date?->format('F j, Y')}.",
                        $this->frontendUrl('customer/billing'),
                        'View Billing'
                    );
                }
            }
        }

        return response()->json(['message' => "Successfully generated {$generatedCount} bills."]);
    }
}
