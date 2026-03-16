<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')
            ->with('subscription.plan');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->status) {
            $query->where('is_active', $request->status === 'active');
        }

        $subscribers = $query->latest()->paginate(15);

        return response()->json($subscribers);
    }

    public function show(User $user)
    {
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'User is not a customer.'], 404);
        }

        $user->load([
            'subscriptions.plan',
            'bills' => fn($q) => $q->latest()->take(5),
            'tickets' => fn($q) => $q->latest()->take(5),
        ]);

        return response()->json($user);
    }

    public function toggleStatus(User $user)
    {
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'User is not a customer.'], 404);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => 'Subscriber status updated.',
            'is_active' => $user->is_active,
        ]);
    }
}
