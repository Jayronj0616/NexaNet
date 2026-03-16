<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = SupportTicket::with('user')->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($tickets);
    }

    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'replies.user'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->status = $request->status;
        $ticket->save();

        return response()->json(['message' => 'Ticket status updated.', 'ticket' => $ticket]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['message' => 'required|string']);

        $ticket = SupportTicket::findOrFail($id);

        $reply = TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->message,
            'is_staff_reply' => true
        ]);

        // Keep status sync'd or notify user
        if ($ticket->status == 'open') {
            $ticket->status = 'in_progress';
            $ticket->save();
        }

        return response()->json(['message' => 'Reply added.', 'reply' => $reply->load('user')]);
    }
}
