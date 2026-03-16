<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanChangeRequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = PlanChangeRequest::where('user_id', $request->user()->id)
            ->with(['currentPlan', 'requestedPlan'])
            ->latest()
            ->paginate(10);

        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $request->validate([
            'requested_plan_id' => 'required|exists:plans,id',
            'reason'            => 'nullable|string|max:1000',
        ]);

        $user         = $request->user();
        $subscription = $user->subscriptions()->where('status', 'active')->latest()->first();

        if (!$subscription) {
            return response()->json(['message' => 'You do not have an active subscription.'], 422);
        }

        // Block duplicate pending requests
        $existing = PlanChangeRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending plan change request.'], 422);
        }

        $currentPlan   = $subscription->plan;
        $requestedPlan = Plan::findOrFail($request->requested_plan_id);

        if ($currentPlan->id === $requestedPlan->id) {
            return response()->json(['message' => 'You are already on this plan.'], 422);
        }

        $type = $requestedPlan->price > $currentPlan->price ? 'upgrade' : 'downgrade';

        $planChangeRequest = PlanChangeRequest::create([
            'user_id'           => $user->id,
            'subscription_id'   => $subscription->id,
            'current_plan_id'   => $currentPlan->id,
            'requested_plan_id' => $requestedPlan->id,
            'type'              => $type,
            'status'            => 'pending',
            'reason'            => $request->reason,
        ]);

        return response()->json([
            'message' => 'Plan change request submitted successfully.',
            'request' => $planChangeRequest->load(['currentPlan', 'requestedPlan']),
        ], 201);
    }
}
