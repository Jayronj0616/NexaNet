<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use App\Models\Subscription;
use App\Support\SendsSystemNotifications;
use Illuminate\Http\Request;

class PlanChangeRequestController extends Controller
{
    use SendsSystemNotifications;

    public function index()
    {
        $requests = PlanChangeRequest::with(['user', 'currentPlan', 'requestedPlan'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($requests);
    }

    public function approve(Request $request, $id)
    {
        $planChange = PlanChangeRequest::with(['user', 'currentPlan', 'requestedPlan'])->findOrFail($id);
        
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
        $planChange->reviewed_at = now();
        $planChange->save();

        if ($planChange->user?->email) {
            $this->sendSystemEmail(
                $planChange->user->email,
                'Plan Change Approved',
                "Hi {$planChange->user->first_name},\n\nYour request to change from {$planChange->currentPlan->name} to {$planChange->requestedPlan->name} has been approved.\nYour subscription has already been updated in your account.",
                $this->frontendUrl('customer/dashboard'),
                'Open Dashboard'
            );
        }

        return response()->json(['message' => 'Plan change approved successfully.', 'request' => $planChange]);
    }

    public function reject(Request $request, $id)
    {
        $planChange = PlanChangeRequest::with(['user', 'currentPlan', 'requestedPlan'])->findOrFail($id);

        if ($planChange->status !== 'pending') {
            return response()->json(['message' => 'Request is already processed.'], 400);
        }

        $planChange->status = 'rejected';
        $planChange->reviewed_by = $request->user()->id;
        $planChange->reviewed_at = now();
        $planChange->save();

        if ($planChange->user?->email) {
            $this->sendSystemEmail(
                $planChange->user->email,
                'Plan Change Update',
                "Hi {$planChange->user->first_name},\n\nYour request to change from {$planChange->currentPlan->name} to {$planChange->requestedPlan->name} was not approved at this time.\nPlease contact support if you need help reviewing the available plans.",
                $this->frontendUrl('customer/dashboard'),
                'Open Dashboard'
            );
        }

        return response()->json(['message' => 'Plan change rejected successfully.', 'request' => $planChange]);
    }
}
