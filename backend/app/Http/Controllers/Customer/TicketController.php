<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Services\TicketAttachmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = $request->user()->tickets()->latest()->paginate(10);
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject'     => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|in:application,technical,account,general,billing',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'attachments' => 'sometimes|array|max:3',
            'attachments.*' => 'file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx',
        ]);

        $ticket = SupportTicket::create([
            'user_id'       => $request->user()->id,
            'ticket_number' => 'TKT-' . strtoupper(Str::random(8)),
            'subject'       => $request->subject,
            'description'   => $request->description,
            'category'      => $request->category,
            'priority'      => $request->priority ?? 'medium',
            'status'        => 'open',
        ]);

        if ($request->hasFile('attachments')) {
            app(TicketAttachmentService::class)->storeForTicket(
                $ticket,
                $request->file('attachments'),
                $request->user()
            );
            $ticket->load('attachments');
        }

        return response()->json(['message' => 'Ticket submitted successfully.', 'ticket' => $ticket], 201);
    }

    public function show(Request $request, $id)
    {
        $ticket = $request->user()->tickets()->with(['attachments', 'replies.user', 'replies.attachments'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'attachments' => 'sometimes|array|max:3',
            'attachments.*' => 'file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx',
        ]);

        $ticket = $request->user()->tickets()->findOrFail($id);

        $reply = TicketReply::create([
            'ticket_id'      => $ticket->id,
            'user_id'        => $request->user()->id,
            'message'        => $request->message,
            'is_staff_reply' => false,
        ]);

        if ($request->hasFile('attachments')) {
            app(TicketAttachmentService::class)->storeForTicket(
                $ticket,
                $request->file('attachments'),
                $request->user(),
                $reply
            );
        }

        if (in_array($ticket->status, ['resolved', 'closed'], true)) {
            $ticket->status = 'open';
            $ticket->resolved_at = null;
            $ticket->save();
        }

        return response()->json(['message' => 'Reply added.', 'reply' => $reply->load(['user', 'attachments'])], 201);
    }

    public function downloadAttachment(Request $request, $ticketId, $attachmentId)
    {
        $ticket = $request->user()->tickets()->findOrFail($ticketId);
        $attachment = SupportTicketAttachment::where('support_ticket_id', $ticket->id)
            ->findOrFail($attachmentId);

        return app(TicketAttachmentService::class)->download($attachment);
    }
}
