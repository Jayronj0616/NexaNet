<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use App\Models\Subscription;
use App\Models\User;
use App\Support\SendsSystemNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ServiceApplicationController extends Controller
{
    use SendsSystemNotifications;

    public function index()
    {
        $applications = ServiceApplication::with('plan')->orderBy('created_at', 'desc')->get();
        $applications->each->append(['status_label', 'status_description', 'timeline']);

        return response()->json($applications);
    }

    public function show($id)
    {
        $application = ServiceApplication::with(['plan', 'activities.user'])->findOrFail($id);

        return response()->json($application->append(['status_label', 'status_description', 'timeline']));
    }

    public function approve(Request $request, $id)
    {
        $application = ServiceApplication::with('plan')->findOrFail($id);
        $application->status = 'approved';
        $application->reviewed_by = $request->user()->id;
        $application->reviewed_at = now();
        $application->save();
        $application->recordActivity(
            'approved',
            'Application processed',
            'The application was reviewed and approved for installation scheduling.',
            $request->user()
        );

        $this->sendSystemEmail(
            $application->email,
            'Application Approved',
            "Hi {$application->first_name},\n\nYour NexaNet application for the {$application->plan->name} plan has been approved.\nWe will notify you again once your installation schedule is finalized.",
            $this->frontendUrl("track?reference={$application->reference_number}"),
            'Track Application'
        );

        return response()->json(['message' => 'Application approved.']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);
        
        $application = ServiceApplication::with('plan')->findOrFail($id);
        $application->status = 'rejected';
        $application->rejection_reason = $request->reason;
        $application->reviewed_by = $request->user()->id;
        $application->reviewed_at = now();
        $application->save();
        $application->recordActivity(
            'rejected',
            'Application rejected',
            "The application was rejected. Reason: {$application->rejection_reason}",
            $request->user(),
            ['reason' => $application->rejection_reason]
        );

        $this->sendSystemEmail(
            $application->email,
            'Application Update',
            "Hi {$application->first_name},\n\nYour NexaNet application for the {$application->plan->name} plan was not approved at this time.\nReason: {$application->rejection_reason}\n\nYou can submit a new application after updating the required details.",
            $this->frontendUrl('apply'),
            'Submit New Application'
        );

        return response()->json(['message' => 'Application rejected.']);
    }

    public function schedule(Request $request, $id)
    {
        $request->validate([
            'technician_name' => 'required|string',
            'installation_date' => 'required|date'
        ]);

        $application = ServiceApplication::with('plan')->findOrFail($id);
        $application->status = 'installation_scheduled';
        $application->technician_name = $request->technician_name;
        $application->installation_date = $request->installation_date;
        $application->scheduled_at = now();
        $application->save();
        $application->recordActivity(
            'installation_scheduled',
            'Installation scheduled',
            "Installation was assigned to {$application->technician_name} for {$application->installation_date?->format('F j, Y')}.",
            $request->user(),
            [
                'technician_name' => $application->technician_name,
                'installation_date' => $application->installation_date?->toDateString(),
            ]
        );

        $formattedDate = $application->installation_date?->format('F j, Y');

        $this->sendSystemEmail(
            $application->email,
            'Installation Scheduled',
            "Hi {$application->first_name},\n\nYour installation for the {$application->plan->name} plan is scheduled on {$formattedDate}.\nAssigned technician: {$application->technician_name}.\n\nPlease make sure someone is available at the installation address on the scheduled date.",
            $this->frontendUrl("track?reference={$application->reference_number}"),
            'Track Application'
        );

        return response()->json(['message' => 'Installation scheduled.']);
    }

    public function completeInstallation(Request $request, $id)
    {
        $application = ServiceApplication::with('plan')->findOrFail($id);
        $application->status = 'installation_complete';
        $application->installation_completed_at = now();
        $application->save();
        $application->recordActivity(
            'installation_completed',
            'Installation completed',
            'The on-site installation work was marked as complete and the application is ready for activation.',
            $request->user()
        );

        $this->sendSystemEmail(
            $application->email,
            'Installation Completed',
            "Hi {$application->first_name},\n\nYour NexaNet installation for the {$application->plan->name} plan has been marked complete.\nOur team will activate your account shortly and send your login details once it is ready.",
            $this->frontendUrl("track?reference={$application->reference_number}"),
            'Track Application'
        );

        return response()->json(['message' => 'Installation marked as complete.']);
    }

    public function activate(Request $request, $id)
    {
        $application = ServiceApplication::with('plan')->findOrFail($id);
        
        if ($application->status !== 'installation_complete') {
            return response()->json(['message' => 'Installation must be complete before activation.'], 400);
        }

        $temporaryPassword = Str::random(10);

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
            'password' => Hash::make($temporaryPassword),
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
        $application->user_id = $user->id;
        $application->activated_at = now();
        $application->save();
        $application->recordActivity(
            'activated',
            'Account activated',
            "A customer account was created for {$user->email} and the application was marked active.",
            $request->user(),
            ['user_id' => $user->id]
        );

        $this->sendSystemEmail(
            $user->email,
            'Account Activated',
            "Hi {$user->first_name},\n\nYour NexaNet account is now active for the {$application->plan->name} plan.\nYou can sign in with your email address and this temporary password:\n{$temporaryPassword}\n\nFor security, please change your password after your first login.",
            $this->frontendUrl('login'),
            'Open Customer Login'
        );

        return response()->json(['message' => 'Account activated successfully.', 'user' => $user]);
    }

    public function updateNotes(Request $request, $id)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
        ]);

        $application = ServiceApplication::with(['plan', 'activities.user'])->findOrFail($id);
        $notes = filled($validated['notes'] ?? null) ? trim((string) $validated['notes']) : null;

        if ($application->notes === $notes) {
            return response()->json([
                'message' => 'No changes were made to the application notes.',
                'application' => $application->append(['status_label', 'status_description', 'timeline']),
            ]);
        }

        $application->notes = $notes;
        $application->save();
        $application->recordActivity(
            'notes_updated',
            $notes ? 'Internal notes updated' : 'Internal notes cleared',
            $notes
                ? 'The application notes were updated for staff reference.'
                : 'The application notes were cleared.',
            $request->user()
        );
        $application->load(['plan', 'activities.user']);

        return response()->json([
            'message' => $notes ? 'Application notes updated.' : 'Application notes cleared.',
            'application' => $application->append(['status_label', 'status_description', 'timeline']),
        ]);
    }
}
