<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ServiceArea;
use Illuminate\Http\Request;

class ServiceAreaController extends Controller
{
    public function index()
    {
        return response()->json(ServiceArea::all());
    }

    public function check(Request $request)
    {
        $request->validate([
            'barangay' => 'required|string',
            'city'     => 'required|string',
        ]);

        $area = ServiceArea::where('barangay', 'like', '%' . $request->barangay . '%')
            ->where('city', 'like', '%' . $request->city . '%')
            ->first();

        if (!$area) {
            return response()->json([
                'serviceable' => false,
                'message'     => 'Sorry, your area is not yet covered. We\'ll notify you when service becomes available.',
            ]);
        }

        return response()->json([
            'serviceable' => $area->is_serviceable,
            'area'        => $area,
            'message'     => $area->is_serviceable
                ? 'Great news! Your area is covered by NexaNet.'
                : 'Your area is in our expansion plan but not yet serviceable.',
        ]);
    }
}
