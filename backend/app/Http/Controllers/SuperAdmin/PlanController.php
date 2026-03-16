<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('price', 'asc')->get();
        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'speed_mbps' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,quarterly,annually',
            'features' => 'required|array',
            'is_active' => 'boolean'
        ]);

        $plan = Plan::create($validated);
        return response()->json(['message' => 'Plan created successfully.', 'plan' => $plan], 201);
    }

    public function show($id)
    {
        $plan = Plan::findOrFail($id);
        return response()->json($plan);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'speed_mbps' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,quarterly,annually',
            'features' => 'required|array',
            'is_active' => 'boolean'
        ]);

        $plan->update($validated);
        return response()->json(['message' => 'Plan updated successfully.', 'plan' => $plan]);
    }

    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();
        return response()->json(['message' => 'Plan deleted successfully.']);
    }
}
