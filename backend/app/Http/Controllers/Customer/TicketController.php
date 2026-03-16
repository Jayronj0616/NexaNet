<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketReply;
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
            'category'    => 'required|in:billing,technical,account,general',
            'priority'    => 'nullable|in:low,medium,high,urgent',
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

        return response()->json(['message' => 'Ticket submitted successfully.', 'ticket' => $ticket], 201);
    }

    public function show(Request $request, $id)
    {
        $ticket = $request->user()->tickets()->with('replies.user')->findOrFail($id);
        return response()->json($ticket);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['message' => 'required|string']);

        $ticket = $request->user()->tickets()->findOrFail($id);

        $reply = TicketReply::create([
            'ticket_id'      => $ticket->id,
            'user_id'        => $request->user()->id,
            'message'        => $request->message,
            'is_staff_reply' => false,
        ]);

        return response()->json(['message' => 'Reply added.', 'reply' => $reply], 201);
    }
}
