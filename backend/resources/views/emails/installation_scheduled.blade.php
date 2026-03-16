<!DOCTYPE html>
<html>
<head>
    <title>Installation Scheduled</title>
</head>
<body>
    <h1>Installation Scheduled!</h1>
    <p>Dear {{ $application->first_name }},</p>
    <p>Your installation has been scheduled for {{ $application->installation_date }}. Our technician, {{ $application->technician_name }}, will be handling your setup.</p>
    <p>Thank you for choosing NexaNet!</p>
</body>
</html>
