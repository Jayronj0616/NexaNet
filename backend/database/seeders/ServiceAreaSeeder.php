<?php

namespace Database\Seeders;

use App\Models\ServiceArea;
use Illuminate\Database\Seeder;

class ServiceAreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['barangay' => 'Barangay Uno',        'city' => 'Quezon City', 'province' => 'Metro Manila', 'zip_code' => '1100', 'is_serviceable' => true],
            ['barangay' => 'Barangay Dos',        'city' => 'Quezon City', 'province' => 'Metro Manila', 'zip_code' => '1101', 'is_serviceable' => true],
            ['barangay' => 'Barangay Tres',       'city' => 'Quezon City', 'province' => 'Metro Manila', 'zip_code' => '1102', 'is_serviceable' => true],
            ['barangay' => 'Barangay Mabini',     'city' => 'Caloocan',    'province' => 'Metro Manila', 'zip_code' => '1400', 'is_serviceable' => true],
            ['barangay' => 'Barangay Rizal',      'city' => 'Caloocan',    'province' => 'Metro Manila', 'zip_code' => '1401', 'is_serviceable' => false],
            ['barangay' => 'Barangay San Jose',   'city' => 'Marikina',    'province' => 'Metro Manila', 'zip_code' => '1800', 'is_serviceable' => true],
            ['barangay' => 'Barangay Concepcion', 'city' => 'Marikina',    'province' => 'Metro Manila', 'zip_code' => '1801', 'is_serviceable' => true],
        ];

        foreach ($areas as $area) {
            ServiceArea::updateOrCreate(
                [
                    'barangay' => $area['barangay'],
                    'city' => $area['city'],
                    'province' => $area['province'],
                ],
                $area,
            );
        }
    }
}
