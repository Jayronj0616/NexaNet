<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use App\Models\Subscription;
use Illuminate\Http\Request;

class PlanChangeRequestController extends Controller
{
    public function index()
    {
        $requests = PlanChangeRequest::with(['user', 'currentPlan', 'requestedPlan'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($requests);
    }

    public function approve(Request $request, $id)
    {
        $planChange = PlanChangeRequest::findOrFail($id);
        
        if ($planChange->status !== 'pending') {
            return response()->json(['message' => 'Request is already processed.'], 400);
        }

        // Apply plan change
        $subscription = Subscription::findOrFail($planChange->subscription_id);
        $subscription->plan_id = $planChange->requested_plan_id;
        $subscription->save();

        // Update request status
        $planChange->status = 'approved';
        $planChange->reviewed_by = $request->user()->id;
        $planChange->save();

        return response()->json(['message' => 'Plan change approved successfully.', 'request' => $planChange]);
    }

    public function reject(Request $request, $id)
    {
        $planChange = PlanChangeRequest::findOrFail($id);

        if ($planChange->status !== 'pending') {
            return response()->json(['message' => 'Request is already processed.'], 400);
        }

        $planChange->status = 'rejected';
        $planChange->reviewed_by = $request->user()->id;
        $planChange->save();

        return response()->json(['message' => 'Plan change rejected successfully.', 'request' => $planChange]);
    }
}
