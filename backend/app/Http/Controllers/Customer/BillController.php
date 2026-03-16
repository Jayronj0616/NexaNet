<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BillController extends Controller
{
    public function index(Request $request)
    {
        $bills = $request->user()
            ->bills()
            ->latest()
            ->paginate(10);

        return response()->json($bills);
    }

    public function show(Request $request, $id)
    {
        $bill = $request->user()->bills()->with('payments')->findOrFail($id);
        return response()->json($bill);
    }
}
