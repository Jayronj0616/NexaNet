<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndRoleProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_view_profile_and_logout(): void
    {
        $plan = $this->createPlan();
        $customer = $this->createUser(role: 'customer');

        Subscription::create([
            'user_id' => $customer->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'start_date' => now()->toDateString(),
            'next_billing_date' => now()->addMonth()->toDateString(),
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => $customer->email,
            'password' => 'password',
        ]);

        $login->assertOk()
            ->assertJsonPath('user.email', $customer->email)
            ->assertJsonStructure(['token', 'user']);

        $token = $login->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('email', $customer->email)
            ->assertJsonPath('subscription.plan.name', $plan->name);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertSame(0, $customer->tokens()->count());
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $customer = $this->createUser(role: 'customer', isActive: false);

        $this->postJson('/api/auth/login', [
            'email' => $customer->email,
            'password' => 'password',
        ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Your account has been deactivated. Please contact support.');
    }

    public function test_role_protected_routes_enforce_authentication_and_permissions(): void
    {
        $customer = $this->createUser(role: 'customer');
        $admin = $this->createUser(role: 'admin');

        $this->getJson('/api/admin/tickets')
            ->assertUnauthorized();

        Sanctum::actingAs($customer);
        $this->getJson('/api/admin/tickets')
            ->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized. Insufficient permissions.');

        Sanctum::actingAs($admin);
        $this->getJson('/api/superadmin/plans')
            ->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized. Insufficient permissions.');
    }

    private function createPlan(): Plan
    {
        return Plan::create([
            'name' => 'Secure 50',
            'speed_mbps' => '50',
            'description' => 'Plan for auth coverage',
            'price' => 1299,
            'billing_cycle' => 'monthly',
            'features' => ['Unlimited data'],
            'is_active' => true,
        ]);
    }

    private function createUser(string $role, bool $isActive = true): User
    {
        return User::create([
            'first_name' => ucfirst($role),
            'last_name' => 'Tester',
            'email' => "{$role}.".uniqid().'@example.com',
            'phone' => '09170000000',
            'password' => Hash::make('password'),
            'role' => $role,
            'is_active' => $isActive,
        ]);
    }
}
