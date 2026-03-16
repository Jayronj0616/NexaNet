<!DOCTYPE html>
<html>
<head>
    <title>Ticket Updated</title>
</head>
<body>
    <h1>Support Ticket #{{ $ticket->ticket_number }} Updated</h1>
    <p>Dear Customer,</p>
    <p>There has been an update to your support ticket regarding: <strong>{{ $ticket->category }}</strong>.</p>
    <p>Current Status: <strong>{{ ucfirst($ticket->status) }}</strong></p>
    
    <p>Please log in to your dashboard to view the full details and replies.</p>
    <p>Thank you!</p>
</body>
</html>
