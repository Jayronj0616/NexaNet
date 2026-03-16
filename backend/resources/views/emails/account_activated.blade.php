<!DOCTYPE html>
<html>
<head>
    <title>Account Activated</title>
</head>
<body>
    <h1>Welcome to NexaNet!</h1>
    <p>Dear {{ $user->first_name }},</p>
    <p>Your account is now active and ready to use!</p>
    
    <h3>Your Login Details:</h3>
    <ul>
        <li>Email: {{ $user->email }}</li>
        @if($tempPassword)
        <li>Temporary Password: {{ $tempPassword }}</li>
        @else
        <li>Password: (Your existing password)</li>
        @endif
    </ul>
    
    <p>Please log in to your dashboard to manage your subscription.</p>
    <p>Thank you for choosing NexaNet!</p>
</body>
</html>
