<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Models\Notification;
use App\Mail\TicketUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with('user', 'assignedStaff');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', '%' . $request->search . '%')
                  ->orWhere('subject', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($uq) use ($request) {
                      $uq->where('first_name', 'like', '%' . $request->search . '%')
                         ->orWhere('last_name', 'like', '%' . $request->search . '%')
                         ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function show(SupportTicket $ticket)
    {
        return response()->json($ticket->load('user', 'assignedStaff', 'replies.user'));
    }

    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'status'      => 'required|in:open,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $ticket->update([
            'status'      => $request->status,
            'assigned_to' => $request->assigned_to ?? $ticket->assigned_to,
            'resolved_at' => in_array($request->status, ['resolved', 'closed']) ? now() : null,
        ]);

        // In-app notification
        Notification::create([
            'user_id' => $ticket->user_id,
            'title'   => 'Ticket Status Updated',
            'message' => "Your ticket #{$ticket->ticket_number} is now {$request->status}.",
            'type'    => 'info',
            'link'    => '/customer/tickets',
        ]);

        Mail::to($ticket->user->email)->queue(new TicketUpdated($ticket));

        return response()->json(['message' => 'Ticket status updated.', 'ticket' => $ticket]);
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        $request->validate(['message' => 'required|string']);

        $reply = TicketReply::create([
            'ticket_id'      => $ticket->id,
            'user_id'        => $request->user()->id,
            'message'        => $request->message,
            'is_staff_reply' => true,
        ]);

        // Move to in_progress if still open
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        // In-app notification
        Notification::create([
            'user_id' => $ticket->user_id,
            'title'   => 'New Reply on Your Ticket',
            'message' => "Staff replied to your ticket #{$ticket->ticket_number}.",
            'type'    => 'info',
            'link'    => '/customer/tickets',
        ]);

        return response()->json(['message' => 'Reply sent.', 'reply' => $reply->load('user')], 201);
    }
}
