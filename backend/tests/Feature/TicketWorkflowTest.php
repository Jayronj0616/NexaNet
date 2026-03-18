<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_and_admin_can_complete_ticket_workflow_with_notifications(): void
    {
        Mail::fake();
        Storage::fake('local');

        $customer = $this->createUser('customer');
        $admin = $this->createUser('admin');

        Sanctum::actingAs($customer);

        $createResponse = $this->post('/api/customer/tickets', [
            'subject' => 'Installation concern',
            'description' => 'I need an update on my pending installation appointment.',
            'category' => 'application',
            'priority' => 'high',
            'attachments' => [UploadedFile::fake()->create('proof.png', 32, 'image/png')],
        ], [
            'Accept' => 'application/json',
        ]);

        $createResponse->assertCreated()
            ->assertJsonPath('message', 'Ticket submitted successfully.')
            ->assertJsonPath('ticket.status', 'open');

        $ticketId = $createResponse->json('ticket.id');

        $this->getJson("/api/customer/tickets/{$ticketId}")
            ->assertOk()
            ->assertJsonPath('subject', 'Installation concern')
            ->assertJsonPath('status', 'open')
            ->assertJsonCount(1, 'attachments');

        Sanctum::actingAs($admin);

        $replyResponse = $this->post("/api/admin/tickets/{$ticketId}/replies", [
            'message' => 'Our technician will confirm the schedule this afternoon.',
            'attachments' => [UploadedFile::fake()->create('schedule.pdf', 64, 'application/pdf')],
        ], [
            'Accept' => 'application/json',
        ]);

        $replyResponse->assertCreated()
            ->assertJsonPath('message', 'Reply added.');

        $statusResponse = $this->patchJson("/api/admin/tickets/{$ticketId}/status", [
            'status' => 'resolved',
        ]);

        $statusResponse->assertOk()
            ->assertJsonPath('message', 'Ticket status updated.')
            ->assertJsonPath('ticket.status', 'resolved');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'title' => 'New Support Reply',
            'link' => "/customer/tickets?ticket={$ticketId}",
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'title' => 'Ticket Status Updated',
            'type' => 'success',
            'link' => "/customer/tickets?ticket={$ticketId}",
        ]);

        Sanctum::actingAs($customer);

        $threadBeforeFollowUp = $this->getJson("/api/customer/tickets/{$ticketId}");
        $threadBeforeFollowUp->assertOk()
            ->assertJsonCount(1, 'attachments')
            ->assertJsonCount(1, 'replies.0.attachments');

        $ticketAttachmentId = $threadBeforeFollowUp->json('attachments.0.id');

        $this->get("/api/customer/tickets/{$ticketId}/attachments/{$ticketAttachmentId}")
            ->assertOk();

        $followUpResponse = $this->postJson("/api/customer/tickets/{$ticketId}/replies", [
            'message' => 'Thank you. Please keep me posted if the schedule changes.',
        ]);

        $followUpResponse->assertCreated()
            ->assertJsonPath('message', 'Reply added.');

        $ticket = SupportTicket::findOrFail($ticketId);
        $this->assertSame('open', $ticket->status);
        $this->assertNull($ticket->resolved_at);

        $thread = $this->getJson("/api/customer/tickets/{$ticketId}");
        $thread->assertOk()
            ->assertJsonCount(2, 'replies');
    }

    public function test_customer_cannot_view_other_customers_ticket(): void
    {
        $owner = $this->createUser('customer');
        $otherCustomer = $this->createUser('customer');

        $ticket = SupportTicket::create([
            'ticket_number' => 'TKT-LOCKED1',
            'user_id' => $owner->id,
            'subject' => 'Private inquiry',
            'description' => 'Only the owner should be able to read this.',
            'category' => 'general',
            'priority' => 'medium',
            'status' => 'open',
        ]);

        Sanctum::actingAs($otherCustomer);

        $this->getJson("/api/customer/tickets/{$ticket->id}")
            ->assertNotFound();
    }

    private function createUser(string $role): User
    {
        return User::create([
            'first_name' => ucfirst($role),
            'last_name' => 'Agent',
            'email' => "{$role}.".uniqid().'@example.com',
            'phone' => '09171112222',
            'password' => Hash::make('password'),
            'role' => $role,
            'is_active' => true,
        ]);
    }
}
