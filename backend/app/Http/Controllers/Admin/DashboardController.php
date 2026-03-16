<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ServiceApplication;
use App\Models\SupportTicket;
use App\Models\Bill;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalSubscribers = User::where('role', 'customer')->count();
        $activeSubscribers = User::where('role', 'customer')->where('is_active', true)->count();
        $pendingApps = ServiceApplication::where('status', 'pending')->count();
        $openTickets = SupportTicket::whereIn('status', ['open', 'in_progress'])->count();
        $monthlyRevenue = Bill::where('status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');
        
        $recentApps = ServiceApplication::orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'total_subscribers' => $totalSubscribers,
            'active_subscribers' => $activeSubscribers,
            'pending_applications' => $pendingApps,
            'open_tickets' => $openTickets,
            'monthly_revenue' => $monthlyRevenue,
            'recent_applications' => $recentApps
        ]);
    }
}
