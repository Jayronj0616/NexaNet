<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ServiceApplicationController extends Controller
{
    public function index()
    {
        $applications = ServiceApplication::with('plan')->orderBy('created_at', 'desc')->get();
        return response()->json($applications);
    }

    public function show($id)
    {
        $application = ServiceApplication::with('plan')->findOrFail($id);
        return response()->json($application);
    }

    public function approve(Request $request, $id)
    {
        $application = ServiceApplication::findOrFail($id);
        $application->status = 'approved';
        $application->reviewed_by = $request->user()->id;
        $application->save();

        return response()->json(['message' => 'Application approved.']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);
        
        $application = ServiceApplication::findOrFail($id);
        $application->status = 'rejected';
        $application->rejection_reason = $request->reason;
        $application->reviewed_by = $request->user()->id;
        $application->save();

        return response()->json(['message' => 'Application rejected.']);
    }

    public function schedule(Request $request, $id)
    {
        $request->validate([
            'technician_name' => 'required|string',
            'installation_date' => 'required|date'
        ]);

        $application = ServiceApplication::findOrFail($id);
        $application->status = 'installation_scheduled';
        $application->technician_name = $request->technician_name;
        $application->installation_date = $request->installation_date;
        $application->save();

        return response()->json(['message' => 'Installation scheduled.']);
    }

    public function completeInstallation($id)
    {
        $application = ServiceApplication::findOrFail($id);
        $application->status = 'installation_complete';
        $application->save();

        return response()->json(['message' => 'Installation marked as complete.']);
    }

    public function activate($id)
    {
        $application = ServiceApplication::with('plan')->findOrFail($id);
        
        if ($application->status !== 'installation_complete') {
            return response()->json(['message' => 'Installation must be complete before activation.'], 400);
        }

        // Create User
        $user = User::create([
            'first_name' => $application->first_name,
            'last_name' => $application->last_name,
            'email' => $application->email,
            'phone' => $application->phone,
            'address' => $application->address,
            'barangay' => $application->barangay,
            'city' => $application->city,
            'province' => $application->province,
            'password' => Hash::make(Str::random(10)), // Will need reset link sent via email
            'role' => 'customer',
            'is_active' => true
        ]);

        // Create Subscription
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $application->plan_id,
            'status' => 'active',
            'start_date' => now(),
            'next_billing_date' => now()->addMonth()
        ]);

        $application->status = 'activated';
        $application->save();

        // TODO: Trigger Welcome/Activation Mail

        return response()->json(['message' => 'Account activated successfully.', 'user' => $user]);
    }
}
