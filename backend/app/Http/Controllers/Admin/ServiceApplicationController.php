<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Notification;
use App\Mail\ApplicationApproved;
use App\Mail\ApplicationRejected;
use App\Mail\InstallationScheduled;
use App\Mail\InstallationComplete;
use App\Mail\AccountActivated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ServiceApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceApplication::with('plan');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('reference_number', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function show(ServiceApplication $application)
    {
        return response()->json($application->load('plan', 'reviewer'));
    }

    public function approve(Request $request, ServiceApplication $application)
    {
        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Only pending applications can be approved.'], 422);
        }

        $application->update([
            'status'      => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        Mail::to($application->email)->queue(new ApplicationApproved($application));

        return response()->json(['message' => 'Application approved.', 'application' => $application]);
    }

    public function reject(Request $request, ServiceApplication $application)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Only pending applications can be rejected.'], 422);
        }

        $application->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'reviewed_by'      => $request->user()->id,
            'reviewed_at'      => now(),
        ]);

        Mail::to($application->email)->queue(new ApplicationRejected($application));

        return response()->json(['message' => 'Application rejected.', 'application' => $application]);
    }

    public function schedule(Request $request, ServiceApplication $application)
    {
        $request->validate([
            'technician_name'   => 'required|string|max:255',
            'installation_date' => 'required|date|after_or_equal:today',
        ]);

        if ($application->status !== 'approved') {
            return response()->json(['message' => 'Only approved applications can be scheduled.'], 422);
        }

        $application->update([
            'status'            => 'installation_scheduled',
            'technician_name'   => $request->technician_name,
            'installation_date' => $request->installation_date,
        ]);

        Mail::to($application->email)->queue(new InstallationScheduled($application));

        return response()->json(['message' => 'Installation scheduled.', 'application' => $application]);
    }

    public function completeInstallation(Request $request, ServiceApplication $application)
    {
        if ($application->status !== 'installation_scheduled') {
            return response()->json(['message' => 'Application must be in installation_scheduled status.'], 422);
        }

        $application->update(['status' => 'installation_complete']);

        Mail::to($application->email)->queue(new InstallationComplete($application));

        return response()->json(['message' => 'Installation marked as complete.', 'application' => $application]);
    }

    public function activate(Request $request, ServiceApplication $application)
    {
        if ($application->status !== 'installation_complete') {
            return response()->json(['message' => 'Installation must be complete before activation.'], 422);
        }

        // Check if user already exists (re-activation scenario)
        $user = User::where('email', $application->email)->first();

        if (!$user) {
            $tempPassword = Str::random(10);

            $user = User::create([
                'first_name' => $application->first_name,
                'last_name'  => $application->last_name,
                'email'      => $application->email,
                'phone'      => $application->phone,
                'address'    => $application->address,
                'barangay'   => $application->barangay,
                'city'       => $application->city,
                'province'   => $application->province,
                'password'   => Hash::make($tempPassword),
                'role'       => 'customer',
                'is_active'  => true,
            ]);
        } else {
            $tempPassword = null;
        }

        // Create subscription
        $subscription = Subscription::create([
            'user_id'           => $user->id,
            'plan_id'           => $application->plan_id,
            'status'            => 'active',
            'start_date'        => now(),
            'next_billing_date' => now()->addMonth(),
        ]);

        // Link application to user
        $application->update([
            'status'  => 'activated',
            'user_id' => $user->id,
        ]);

        // In-app notification
        Notification::create([
            'user_id' => $user->id,
            'title'   => 'Account Activated!',
            'message' => 'Your NexaNet account is now active. Welcome aboard!',
            'type'    => 'success',
        ]);

        Mail::to($user->email)->queue(new AccountActivated($user, $application, $tempPassword));

        return response()->json([
            'message'      => 'Account activated successfully.',
            'user'         => $user,
            'subscription' => $subscription->load('plan'),
        ]);
    }
}
