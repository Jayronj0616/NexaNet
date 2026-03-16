<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'          => 'Basic 25',
                'speed_mbps'    => '25',
                'description'   => 'Perfect for light browsing and streaming.',
                'price'         => 999.00,
                'billing_cycle' => 'monthly',
                'features'      => ['25 Mbps speed', 'Unli data', 'Free installation', 'Email support'],
                'is_active'     => true,
            ],
            [
                'name'          => 'Standard 50',
                'speed_mbps'    => '50',
                'description'   => 'Great for small families and remote work.',
                'price'         => 1499.00,
                'billing_cycle' => 'monthly',
                'features'      => ['50 Mbps speed', 'Unli data', 'Free installation', 'Priority support'],
                'is_active'     => true,
            ],
            [
                'name'          => 'Premium 100',
                'speed_mbps'    => '100',
                'description'   => 'High-speed connection for heavy users and streaming.',
                'price'         => 1999.00,
                'billing_cycle' => 'monthly',
                'features'      => ['100 Mbps speed', 'Unli data', 'Free installation', '24/7 support', 'Static IP'],
                'is_active'     => true,
            ],
            [
                'name'          => 'Business 200',
                'speed_mbps'    => '200',
                'description'   => 'Enterprise-grade connection for businesses.',
                'price'         => 3499.00,
                'billing_cycle' => 'monthly',
                'features'      => ['200 Mbps speed', 'Unli data', 'Free installation', 'Dedicated support', 'Static IP', 'SLA guarantee'],
                'is_active'     => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}
