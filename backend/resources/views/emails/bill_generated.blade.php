<!DOCTYPE html>
<html>
<head>
    <title>New Bill Generated</title>
</head>
<body>
    <h1>New Bill: {{ $bill->bill_number }}</h1>
    <p>Dear Customer,</p>
    <p>A new bill has been generated for your NexaNet subscription.</p>
    
    <h3>Bill Details:</h3>
    <ul>
        <li>Amount: ₱{{ number_format($bill->amount, 2) }}</li>
        <li>Billing Period: {{ \Carbon\Carbon::parse($bill->billing_period_start)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($bill->billing_period_end)->format('M d, Y') }}</li>
        <li>Due Date: {{ \Carbon\Carbon::parse($bill->due_date)->format('M d, Y') }}</li>
    </ul>
    
    <p>Please pay before the due date to avoid service interruption.</p>
    <p>Thank you!</p>
</body>
</html>
