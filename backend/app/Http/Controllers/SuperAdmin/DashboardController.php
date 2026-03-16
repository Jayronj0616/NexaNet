<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Plan;
use App\Models\Bill;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalCustomers = User::where('role', 'customer')->count();
        $totalStaff = User::whereIn('role', ['admin', 'superadmin'])->count();
        $activePlans = Plan::where('is_active', true)->count();
        $ytdRevenue = Bill::where('status', 'paid')
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        return response()->json([
            'total_customers' => $totalCustomers,
            'total_staff' => $totalStaff,
            'active_plans' => $activePlans,
            'ytd_revenue' => $ytdRevenue
        ]);
    }
}
