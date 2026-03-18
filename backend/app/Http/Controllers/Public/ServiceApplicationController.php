<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use App\Support\SendsSystemNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceApplicationController extends Controller
{
    use SendsSystemNotifications;

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email',
            'phone'      => 'required|string|max:20',
            'address'    => 'required|string',
            'barangay'   => 'required|string',
            'city'       => 'required|string',
            'province'   => 'required|string',
            'zip_code'   => 'nullable|string|max:10',
            'plan_id'    => 'required|exists:plans,id',
        ]);

        $application = ServiceApplication::create([
            ...$request->only([
                'first_name', 'last_name', 'email', 'phone',
                'address', 'barangay', 'city', 'province', 'zip_code', 'plan_id',
            ]),
            'reference_number' => 'NXN-' . strtoupper(Str::random(8)),
            'status'           => 'pending',
        ])->load('plan');
        $application->recordActivity(
            'submitted',
            'Application submitted',
            'The applicant submitted a new service request and is waiting for review.'
        );

        $this->sendSystemEmail(
            $application->email,
            'Application Submitted',
            "Hi {$application->first_name},\n\nWe received your NexaNet service application for the {$application->plan->name} plan.\nYour reference number is {$application->reference_number}.\n\nYou can track your application status anytime using the link below.",
            $this->frontendUrl("track?reference={$application->reference_number}"),
            'Track Application'
        );

        return response()->json([
            'message'          => 'Application submitted successfully.',
            'reference_number' => $application->reference_number,
            'application'      => $application,
        ], 201);
    }

    public function track(Request $request)
    {
        $request->validate([
            'reference' => 'required_without:email|nullable|string',
            'email'     => 'required_without:reference|nullable|email',
        ]);

        if ($request->reference) {
            $application = ServiceApplication::with('plan')
                ->where('reference_number', $request->reference)
                ->first();

            if (! $application) {
                return response()->json(['message' => 'No application found.'], 404);
            }

            return response()->json($application->append(['status_label', 'status_description', 'timeline']));
        }

        $applications = ServiceApplication::with('plan')
            ->where('email', $request->email)
            ->latest()
            ->get();

        if ($applications->isEmpty()) {
            return response()->json(['message' => 'No application found.'], 404);
        }

        $applications->each->append(['status_label', 'status_description', 'timeline']);

        return response()->json($applications);
    }
}
