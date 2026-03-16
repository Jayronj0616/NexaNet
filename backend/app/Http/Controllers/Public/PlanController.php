<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::where('is_active', true)->get();
        return response()->json($plans);
    }

    public function show(Plan $plan)
    {
        if (!$plan->is_active) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }
        return response()->json($plan);
    }
}
