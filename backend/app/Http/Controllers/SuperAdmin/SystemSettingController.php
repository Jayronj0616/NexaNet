<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all();
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            $setting = SystemSetting::where('key', $key)->first();
            
            if ($setting) {
                // Formatting for boolean
                if ($setting->type === 'boolean') {
                    $setting->value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';
                } else {
                    $setting->value = (string) $value;
                }
                $setting->save();
            }
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
