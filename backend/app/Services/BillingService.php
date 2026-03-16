<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Subscription;

class BillingService
{
    /**
     * Generate monthly bills for all active subscriptions.
     * Usually run via a scheduled cron job.
     */
    public function generateMonthlyBills()
    {
        $subscriptions = Subscription::with('plan')->where('status', 'active')->get();
        $generatedCount = 0;

        foreach ($subscriptions as $sub) {
            $existing = Bill::where('subscription_id', $sub->id)
                ->where('billing_period_start', '>=', now()->startOfMonth())
                ->exists();

            if (!$existing) {
                Bill::create([
                    'user_id' => $sub->user_id,
                    'subscription_id' => $sub->id,
                    'bill_number' => 'INV-' . strtoupper(uniqid()),
                    'amount' => $sub->plan->price,
                    'billing_period_start' => now()->startOfMonth(),
                    'billing_period_end' => now()->endOfMonth(),
                    'due_date' => now()->addDays(15), 
                    'status' => 'unpaid'
                ]);
                $generatedCount++;
            }
        }

        return $generatedCount;
    }

    /**
     * Mark bills as overdue
     */
    public function markOverdue()
    {
        return Bill::where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->update(['status' => 'overdue']);
    }
}
