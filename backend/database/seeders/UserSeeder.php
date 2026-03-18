<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        User::updateOrCreate(
            ['email' => 'superadmin@nexanet.com'],
            [
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'phone'      => '09000000001',
                'password'   => Hash::make('password'),
                'role'       => 'superadmin',
                'is_active'  => true,
            ],
        );

        // Admin / Staff
        User::updateOrCreate(
            ['email' => 'admin@nexanet.com'],
            [
                'first_name' => 'Staff',
                'last_name'  => 'One',
                'phone'      => '09000000002',
                'password'   => Hash::make('password'),
                'role'       => 'admin',
                'is_active'  => true,
            ],
        );

        // Test Customer
        User::updateOrCreate(
            ['email' => 'customer@nexanet.com'],
            [
                'first_name' => 'Juan',
                'last_name'  => 'Dela Cruz',
                'phone'      => '09000000003',
                'address'    => '123 Sampaguita St.',
                'barangay'   => 'Barangay Uno',
                'city'       => 'Quezon City',
                'province'   => 'Metro Manila',
                'password'   => Hash::make('password'),
                'role'       => 'customer',
                'is_active'  => true,
            ],
        );
    }
}
