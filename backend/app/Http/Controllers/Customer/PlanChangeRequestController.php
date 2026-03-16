<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use Illuminate\Http\Request;

class PlanChangeRequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = $request->user()->planChangeRequests()->with(['currentPlan', 'requestedPlan'])->orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'requested_plan_id' => 'required|exists:plans,id',
            'reason' => 'nullable|string'
        ]);

        $subscription = $request->user()->subscription;

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found.'], 400);
        }

        // Check for pending
        $pending = $request->user()->planChangeRequests()->where('status', 'pending')->exists();
        if ($pending) {
            return response()->json(['message' => 'You already have a pending plan change request.'], 400);
        }

        $currentPlan = $subscription->plan;
        $requestedPlan = \App\Models\Plan::findOrFail($validated['requested_plan_id']);

        $type = $requestedPlan->price > $currentPlan->price ? 'upgrade' : 'downgrade';

        $planChange = PlanChangeRequest::create([
            'user_id' => $request->user()->id,
            'subscription_id' => $subscription->id,
            'current_plan_id' => $currentPlan->id,
            'requested_plan_id' => $requestedPlan->id,
            'type' => $type,
            'status' => 'pending',
            'reason' => $validated['reason'] ?? null
        ]);

        return response()->json(['message' => 'Plan change request submitted successfully.', 'data' => $planChange], 201);
    }
}
