<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceApplicationController extends Controller
{
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
        ]);

        // TODO: Send confirmation email

        return response()->json([
            'message'          => 'Application submitted successfully.',
            'reference_number' => $application->reference_number,
            'application'      => $application->load('plan'),
        ], 201);
    }

    public function track(Request $request)
    {
        $request->validate([
            'reference' => 'required_without:email|nullable|string',
            'email'     => 'required_without:reference|nullable|email',
        ]);

        $query = ServiceApplication::with('plan');

        if ($request->reference) {
            $query->where('reference_number', $request->reference);
        } else {
            $query->where('email', $request->email);
        }

        $applications = $query->get();

        if ($applications->isEmpty()) {
            return response()->json(['message' => 'No application found.'], 404);
        }

        return response()->json($applications);
    }
}
