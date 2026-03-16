<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = User::whereIn('role', ['admin', 'superadmin']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'phone'      => 'nullable|string|max:20',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => 'required|in:admin,superadmin',
        ]);

        $staff = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'password'   => Hash::make($request->password),
            'role'       => $request->role,
            'is_active'  => true,
        ]);

        return response()->json(['message' => 'Staff account created.', 'staff' => $staff], 201);
    }

    public function show(User $user)
    {
        if (!in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json(['message' => 'User is not a staff member.'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $user->id,
            'phone'      => 'nullable|string|max:20',
            'password'   => 'nullable|string|min:8|confirmed',
            'role'       => 'sometimes|in:admin,superadmin',
        ]);

        $data = $request->only(['first_name', 'last_name', 'email', 'phone', 'role']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Staff account updated.', 'staff' => $user]);
    }

    public function toggleStatus(User $user)
    {
        if (!in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json(['message' => 'User is not a staff member.'], 404);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => 'Staff status updated.',
            'is_active' => $user->is_active,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Staff account deleted.']);
    }
}
