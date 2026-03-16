<!DOCTYPE html>
<html>
<head>
    <title>Application Rejected</title>
</head>
<body>
    <h1>Application Rejected</h1>
    <p>Dear {{ $application->first_name }},</p>
    <p>Unfortunately, your service application (Reference: {{ $application->reference_number }}) has been rejected for the following reason:</p>
    <blockquote>{{ $application->rejection_reason }}</blockquote>
    <p>If you have any questions, please contact our support team.</p>
</body>
</html>
