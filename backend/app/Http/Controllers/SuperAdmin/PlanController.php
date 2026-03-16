<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        return response()->json(Plan::withTrashed()->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'speed_mbps'    => 'required|string|max:50',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,quarterly,annually',
            'features'      => 'nullable|array',
            'is_active'     => 'boolean',
        ]);

        $plan = Plan::create($request->only([
            'name', 'speed_mbps', 'description', 'price',
            'billing_cycle', 'features', 'is_active',
        ]));

        return response()->json(['message' => 'Plan created.', 'plan' => $plan], 201);
    }

    public function show(Plan $plan)
    {
        return response()->json($plan->loadCount('subscriptions'));
    }

    public function update(Request $request, Plan $plan)
    {
        $request->validate([
            'name'          => 'sometimes|string|max:255',
            'speed_mbps'    => 'sometimes|string|max:50',
            'description'   => 'nullable|string',
            'price'         => 'sometimes|numeric|min:0',
            'billing_cycle' => 'sometimes|in:monthly,quarterly,annually',
            'features'      => 'nullable|array',
        ]);

        $plan->update($request->only([
            'name', 'speed_mbps', 'description', 'price',
            'billing_cycle', 'features',
        ]));

        return response()->json(['message' => 'Plan updated.', 'plan' => $plan]);
    }

    public function toggle(Plan $plan)
    {
        $plan->update(['is_active' => !$plan->is_active]);

        return response()->json([
            'message'   => 'Plan status toggled.',
            'is_active' => $plan->is_active,
        ]);
    }

    public function destroy(Plan $plan)
    {
        if ($plan->subscriptions()->where('status', 'active')->exists()) {
            return response()->json([
                'message' => 'Cannot delete a plan with active subscribers. Deactivate it instead.',
            ], 422);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted.']);
    }
}
