<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
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

        // --- PAYMENT GATEWAY STUB ---
        // TODO: Initialize Stripe/PayMongo session here
        // Example (Stripe):
        //   $session = \Stripe\Checkout\Session::create([...]);
        //   return response()->json(['checkout_url' => $session->url]);
        //
        // Example (PayMongo):
        //   $source = PayMongo::createSource([...]);
        //   return response()->json(['checkout_url' => $source->redirect->checkout_url]);
        // ----------------------------

        // Stub response for now
        $payment = Payment::create([
            'user_id'               => $request->user()->id,
            'bill_id'               => $bill->id,
            'amount'                => $bill->amount,
            'method'                => $request->method,
            'status'                => 'pending',
            'transaction_reference' => 'STUB-' . strtoupper(uniqid()),
            'gateway_response'      => ['stub' => true, 'message' => 'Payment gateway not yet integrated.'],
        ]);

        return response()->json([
            'message'     => 'Payment initiated (stub). Gateway not yet integrated.',
            'payment'     => $payment,
            'checkout_url' => null, // TODO: return real checkout URL from gateway
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
