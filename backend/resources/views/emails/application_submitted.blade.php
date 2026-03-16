<!DOCTYPE html>
<html>
<head>
    <title>Application Submitted</title>
</head>
<body>
    <h1>Application Received!</h1>
    <p>Dear {{ $application->first_name }},</p>
    <p>We have successfully received your service application (Reference: {{ $application->reference_number }}). We will review it shortly.</p>
    <p>Thank you for choosing NexaNet!</p>
</body>
</html>
