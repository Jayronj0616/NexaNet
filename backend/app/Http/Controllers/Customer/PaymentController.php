<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use App\Support\SendsSystemNotifications;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use SendsSystemNotifications;

    /**
     * Scaffold: initiate a payment.
     * TODO: Replace stub with actual Stripe or PayMongo SDK call.
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'bill_id' => 'required|exists:bills,id',
            'method'  => 'required|in:stripe,paymongo',
        ]);

        $bill = $request->user()->bills()->findOrFail($request->bill_id);

        if ($bill->status === 'paid') {
            return response()->json(['message' => 'This bill is already paid.'], 422);
        }

        if ($bill->status === 'cancelled') {
            return response()->json(['message' => 'Cancelled bills cannot be paid.'], 422);
        }

        // Sandbox payment flow for local/demo use.
        // Replace this block with real Stripe or PayMongo session creation.
        $payment = Payment::create([
            'user_id'               => $request->user()->id,
            'bill_id'               => $bill->id,
            'amount'                => $bill->amount,
            'method'                => $request->method,
            'status'                => 'success',
            'transaction_reference' => 'SBX-' . strtoupper(uniqid()),
            'gateway_response'      => [
                'mode' => 'sandbox',
                'message' => 'Sandbox payment completed locally. Configure a real gateway for production.',
            ],
            'paid_at'               => now(),
        ]);

        $bill->status = 'paid';
        $bill->paid_at = now();
        $bill->save();

        $this->sendSystemEmail(
            $request->user()->email,
            'Payment Received',
            "Hi {$request->user()->first_name},\n\nWe received your payment for bill {$bill->bill_number}.\nAmount paid: PHP " . number_format((float) $bill->amount, 2) . ".\nYour account has been updated successfully.",
            $this->frontendUrl('customer/billing'),
            'View Billing'
        );

        return response()->json([
            'message'      => 'Sandbox payment recorded successfully.',
            'payment'     => $payment,
            'checkout_url' => null, // Return a real checkout URL once a gateway is integrated.
        ]);
    }

    /**
     * Scaffold: handle payment webhook from Stripe/PayMongo.
     * TODO: Verify webhook signature and update bill/payment status.
     */
    public function webhook(Request $request)
    {
        // TODO: Verify webhook signature
        // TODO: Extract event type and payment reference
        // TODO: Update Payment and Bill status accordingly
        // TODO: Trigger email notification on successful payment

        return response()->json(['message' => 'Webhook received (stub).']);
    }

    public function index(Request $request)
    {
        $payments = Payment::where('user_id', $request->user()->id)
            ->with('bill')
            ->latest()
            ->paginate(10);

        return response()->json($payments);
    }
}
