<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'company_name',    'value' => 'NexaNet',                    'type' => 'string',  'group' => 'general',  'label' => 'Company Name'],
            ['key' => 'company_email',   'value' => 'support@nexanet.com',         'type' => 'string',  'group' => 'general',  'label' => 'Support Email'],
            ['key' => 'company_phone',   'value' => '+63 900 000 0000',            'type' => 'string',  'group' => 'general',  'label' => 'Support Phone'],
            ['key' => 'company_address', 'value' => 'Quezon City, Metro Manila',   'type' => 'string',  'group' => 'general',  'label' => 'Company Address'],
            ['key' => 'bill_due_days',   'value' => '15',                          'type' => 'integer', 'group' => 'billing',  'label' => 'Bill Due Days'],
            ['key' => 'maintenance_mode','value' => '0',                           'type' => 'boolean', 'group' => 'system',   'label' => 'Maintenance Mode'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
