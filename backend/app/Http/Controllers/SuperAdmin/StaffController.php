<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index()
    {
        $staff = User::whereIn('role', ['admin', 'superadmin'])->orderBy('created_at', 'desc')->get();
        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string',
            'role' => 'required|in:admin,superadmin',
            'password' => 'required|string|min:8|confirmed',
            'is_active' => 'boolean'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        return response()->json(['message' => 'Staff created successfully.', 'staff' => $user], 201);
    }

    public function show($id)
    {
        $staff = User::whereIn('role', ['admin', 'superadmin'])->findOrFail($id);
        return response()->json($staff);
    }

    public function update(Request $request, $id)
    {
        $staff = User::whereIn('role', ['admin', 'superadmin'])->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $staff->id,
            'phone' => 'nullable|string',
            'role' => 'required|in:admin,superadmin',
            'password' => 'nullable|string|min:8|confirmed',
            'is_active' => 'boolean'
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $staff->update($validated);
        return response()->json(['message' => 'Staff updated successfully.', 'staff' => $staff]);
    }

    public function destroy($id)
    {
        $staff = User::whereIn('role', ['admin', 'superadmin'])->findOrFail($id);
        $staff->delete();
        return response()->json(['message' => 'Staff deleted successfully.']);
    }
}
