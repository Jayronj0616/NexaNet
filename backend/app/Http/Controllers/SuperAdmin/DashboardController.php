<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Bill;
use App\Models\SupportTicket;
use App\Models\ServiceApplication;
use App\Models\Plan;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'stats' => [
                'total_customers'       => User::where('role', 'customer')->count(),
                'total_staff'           => User::where('role', 'admin')->count(),
                'active_subscriptions'  => Subscription::where('status', 'active')->count(),
                'total_plans'           => Plan::where('is_active', true)->count(),
                'pending_applications'  => ServiceApplication::where('status', 'pending')->count(),
                'unpaid_bills'          => Bill::where('status', 'unpaid')->count(),
                'overdue_bills'         => Bill::where('status', 'overdue')->count(),
                'open_tickets'          => SupportTicket::whereIn('status', ['open', 'in_progress'])->count(),
                'total_revenue'         => Bill::where('status', 'paid')->sum('amount'),
            ],
            'monthly_revenue' => Bill::selectRaw('MONTH(paid_at) as month, YEAR(paid_at) as year, SUM(amount) as total')
                ->where('status', 'paid')
                ->whereYear('paid_at', now()->year)
                ->groupByRaw('YEAR(paid_at), MONTH(paid_at)')
                ->orderByRaw('YEAR(paid_at), MONTH(paid_at)')
                ->get(),
        ]);
    }
}
