<!DOCTYPE html>
<html>
<head>
    <title>Application Approved</title>
</head>
<body>
    <h1>Application Approved!</h1>
    <p>Dear {{ $application->first_name }},</p>
    <p>Your service application (Reference: {{ $application->reference_number }}) has been approved. We will contact you soon to schedule the installation.</p>
    <p>Thank you for choosing NexaNet!</p>
</body>
</html>
