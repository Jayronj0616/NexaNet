<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Services\NotificationService;
use App\Services\TicketAttachmentService;
use App\Support\SendsSystemNotifications;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    use SendsSystemNotifications;

    public function index(Request $request)
    {
        $tickets = SupportTicket::with('user')->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($tickets);
    }

    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'attachments', 'replies.user', 'replies.attachments'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        $ticket = SupportTicket::with('user')->findOrFail($id);
        $ticket->status = $request->status;
        $ticket->resolved_at = $request->status === 'resolved' ? now() : null;
        $ticket->save();

        if ($ticket->user?->email) {
            $this->sendSystemEmail(
                $ticket->user->email,
                'Ticket Status Updated',
                "Hi {$ticket->user->first_name},\n\nYour support ticket {$ticket->ticket_number} is now marked as {$ticket->status}.\nYou can review the latest status and any updates in your customer portal.",
                $this->frontendUrl('customer/tickets'),
                'Open Tickets'
            );
        }

        app(NotificationService::class)->notify(
            $ticket->user_id,
            'Ticket Status Updated',
            "Your ticket {$ticket->ticket_number} is now marked as {$ticket->status}.",
            $request->status === 'resolved' ? 'success' : 'info',
            "/customer/tickets?ticket={$ticket->id}"
        );

        return response()->json(['message' => 'Ticket status updated.', 'ticket' => $ticket]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'attachments' => 'sometimes|array|max:3',
            'attachments.*' => 'file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx',
        ]);

        $ticket = SupportTicket::with('user')->findOrFail($id);

        $reply = TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_staff_reply' => true
        ]);

        if ($request->hasFile('attachments')) {
            app(TicketAttachmentService::class)->storeForTicket(
                $ticket,
                $request->file('attachments'),
                $request->user(),
                $reply
            );
        }

        // Keep the thread active once staff responds.
        if (in_array($ticket->status, ['open', 'resolved', 'closed'], true)) {
            $ticket->status = 'in_progress';
            $ticket->resolved_at = null;
            $ticket->assigned_to ??= $request->user()->id;
            $ticket->save();
        }

        if ($ticket->user?->email) {
            $this->sendSystemEmail(
                $ticket->user->email,
                'New Ticket Reply',
                "Hi {$ticket->user->first_name},\n\nOur support team replied to ticket {$ticket->ticket_number}.\nThe latest message is now available in your customer portal.",
                $this->frontendUrl('customer/tickets'),
                'Read Reply'
            );
        }

        app(NotificationService::class)->notify(
            $ticket->user_id,
            'New Support Reply',
            "A new reply was added to ticket {$ticket->ticket_number}.",
            'info',
            "/customer/tickets?ticket={$ticket->id}"
        );

        return response()->json(['message' => 'Reply added.', 'reply' => $reply->load(['user', 'attachments'])], 201);
    }

    public function downloadAttachment($ticketId, $attachmentId)
    {
        $ticket = SupportTicket::findOrFail($ticketId);
        $attachment = SupportTicketAttachment::where('support_ticket_id', $ticket->id)
            ->findOrFail($attachmentId);

        return app(TicketAttachmentService::class)->download($attachment);
    }
}
