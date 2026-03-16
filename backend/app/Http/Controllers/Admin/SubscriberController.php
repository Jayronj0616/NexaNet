<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = User::where('role', 'customer');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    public function show($id)
    {
        $user = User::with(['subscription.plan', 'bills' => function ($query) {
            $query->orderBy('created_at', 'desc')->take(10);
        }])->findOrFail($id);

        return response()->json($user); // The view model in frontend expects subscription and bills merged loosely, we can return the user directly since relations are loaded.
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        if ($user->subscription) {
            $user->subscription->status = $user->is_active ? 'active' : 'suspended';
            $user->subscription->save();
        }

        return response()->json(['message' => 'Status updated successfully.', 'user' => $user]);
    }
}
