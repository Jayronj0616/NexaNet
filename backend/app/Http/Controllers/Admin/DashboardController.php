<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use App\Models\Subscription;
use App\Models\Bill;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $stats = [
            'pending_applications'  => ServiceApplication::where('status', 'pending')->count(),
            'active_subscribers'    => Subscription::where('status', 'active')->count(),
            'unpaid_bills'          => Bill::where('status', 'unpaid')->count(),
            'overdue_bills'         => Bill::where('status', 'overdue')->count(),
            'open_tickets'          => SupportTicket::whereIn('status', ['open', 'in_progress'])->count(),
            'total_customers'       => User::where('role', 'customer')->count(),
        ];

        $recentApplications = ServiceApplication::with('plan')
            ->latest()
            ->take(5)
            ->get();

        $recentTickets = SupportTicket::with('user')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats'               => $stats,
            'recent_applications' => $recentApplications,
            'recent_tickets'      => $recentTickets,
        ]);
    }
}
