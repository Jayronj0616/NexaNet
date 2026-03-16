<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('subscription.plan');

        $latestBill = $user->bills()
            ->latest()
            ->first();

        $unreadNotifications = $user->notifications()
            ->where('is_read', false)
            ->count();

        $openTickets = $user->tickets()
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        return response()->json([
            'user'                 => $user,
            'subscription'         => $user->subscription,
            'latest_bill'          => $latestBill,
            'unread_notifications' => $unreadNotifications,
            'open_tickets'         => $openTickets,
        ]);
    }
}
