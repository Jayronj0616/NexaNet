<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\ServiceApplication;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceApplicationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_submission_and_admin_workflow_record_history(): void
    {
        Mail::fake();

        $plan = $this->createPlan();
        $admin = $this->createAdmin();

        $submission = $this->postJson('/api/public/applications', [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria@example.com',
            'phone' => '09170000000',
            'address' => '123 Sample Street',
            'barangay' => 'Barangay Uno',
            'city' => 'Quezon City',
            'province' => 'Metro Manila',
            'zip_code' => '1101',
            'plan_id' => $plan->id,
        ]);

        $submission->assertCreated()
            ->assertJsonPath('message', 'Application submitted successfully.');

        $referenceNumber = $submission->json('reference_number');
        $application = ServiceApplication::where('reference_number', $referenceNumber)->firstOrFail();

        $this->assertDatabaseHas('service_application_activities', [
            'service_application_id' => $application->id,
            'type' => 'submitted',
            'title' => 'Application submitted',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/applications/{$application->id}/approve")
            ->assertOk()
            ->assertJsonPath('message', 'Application approved.');

        $this->patchJson("/api/admin/applications/{$application->id}/schedule", [
            'technician_name' => 'Tech Flow',
            'installation_date' => '2026-03-25',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Installation scheduled.');

        $trackAfterSchedule = $this->getJson("/api/public/applications/track?reference={$referenceNumber}");
        $trackAfterSchedule->assertOk()
            ->assertJsonPath('status', 'installation_scheduled')
            ->assertJsonPath('status_label', 'For Installation')
            ->assertJsonPath('timeline.2.state', 'current');

        $this->patchJson("/api/admin/applications/{$application->id}/complete-installation")
            ->assertOk()
            ->assertJsonPath('message', 'Installation marked as complete.');

        $this->patchJson("/api/admin/applications/{$application->id}/activate")
            ->assertOk()
            ->assertJsonPath('message', 'Account activated successfully.');

        $application->refresh();

        $this->assertSame('activated', $application->status);
        $this->assertNotNull($application->scheduled_at);
        $this->assertNotNull($application->installation_completed_at);
        $this->assertNotNull($application->activated_at);
        $this->assertNotNull($application->user_id);

        $this->assertDatabaseHas('service_application_activities', [
            'service_application_id' => $application->id,
            'type' => 'approved',
        ]);
        $this->assertDatabaseHas('service_application_activities', [
            'service_application_id' => $application->id,
            'type' => 'installation_scheduled',
        ]);
        $this->assertDatabaseHas('service_application_activities', [
            'service_application_id' => $application->id,
            'type' => 'installation_completed',
        ]);
        $this->assertDatabaseHas('service_application_activities', [
            'service_application_id' => $application->id,
            'type' => 'activated',
        ]);

        $customer = User::findOrFail($application->user_id);
        $this->assertSame('customer', $customer->role);
        $this->assertTrue($customer->is_active);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $customer->id,
            'plan_id' => $plan->id,
            'status' => 'active',
        ]);

        $details = $this->getJson("/api/admin/applications/{$application->id}");
        $details->assertOk()
            ->assertJsonPath('status', 'activated')
            ->assertJsonPath('status_label', 'Activated')
            ->assertJsonPath('timeline.4.state', 'current')
            ->assertJsonPath('activities.0.type', 'activated');
    }

    public function test_admin_can_update_internal_notes_and_view_them_in_details(): void
    {
        Mail::fake();

        $plan = $this->createPlan();
        $admin = $this->createAdmin();
        $application = ServiceApplication::create([
            'reference_number' => 'NXN-NOTETEST',
            'first_name' => 'John',
            'last_name' => 'Notes',
            'email' => 'john.notes@example.com',
            'phone' => '09171111111',
            'address' => '456 Support Street',
            'barangay' => 'Barangay Dos',
            'city' => 'Quezon City',
            'province' => 'Metro Manila',
            'zip_code' => '1102',
            'plan_id' => $plan->id,
            'status' => 'pending',
        ]);

        $application->recordActivity(
            'submitted',
            'Application submitted',
            'The applicant submitted a new service request and is waiting for review.'
        );

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/applications/{$application->id}/notes", [
            'notes' => 'Customer requested a morning installation window.',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Application notes updated.')
            ->assertJsonPath('application.notes', 'Customer requested a morning installation window.');

        $this->assertDatabaseHas('service_applications', [
            'id' => $application->id,
            'notes' => 'Customer requested a morning installation window.',
        ]);

        $this->assertDatabaseHas('service_application_activities', [
            'service_application_id' => $application->id,
            'type' => 'notes_updated',
            'title' => 'Internal notes updated',
        ]);

        $details = $this->getJson("/api/admin/applications/{$application->id}");
        $details->assertOk()
            ->assertJsonPath('notes', 'Customer requested a morning installation window.')
            ->assertJsonPath('activities.0.type', 'notes_updated')
            ->assertJsonPath('activities.0.actor_name', $admin->full_name);
    }

    private function createPlan(): Plan
    {
        return Plan::create([
            'name' => 'Starter 50',
            'speed_mbps' => '50',
            'description' => 'Starter home fiber plan',
            'price' => 1499,
            'billing_cycle' => 'monthly',
            'features' => ['50 Mbps', 'Unlimited data'],
            'is_active' => true,
        ]);
    }

    private function createAdmin(): User
    {
        return User::create([
            'first_name' => 'Admin',
            'last_name' => 'Reviewer',
            'email' => 'reviewer@example.com',
            'phone' => '09172222222',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);
    }
}
