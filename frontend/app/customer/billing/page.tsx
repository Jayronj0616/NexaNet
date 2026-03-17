'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bill } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentModal } from '@/components/customer/PaymentModal';

export default function CustomerBilling() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasUnpaid, setHasUnpaid] = useState(false);
    
    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customer/bills');
            const fetchedBills = response.data.data || response.data;
            setBills(fetchedBills);
            setHasUnpaid(fetchedBills.some((b: Bill) => b.status === 'unpaid' || b.status === 'overdue'));
        } catch (error) {
            console.error("Failed to load bills", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handlePayClick = (bill: Bill) => {
        setSelectedBill(bill);
        setIsPaymentModalOpen(true);
    };

    const columns = [
        {
            header: 'Bill Number',
            accessor: 'bill_number',
            className: 'font-medium text-gray-900'
        },
        {
            header: 'Period',
            accessor: (row: Bill) => `${formatDate(row.billing_period_start)} - ${formatDate(row.billing_period_end)}`
        },
        {
            header: 'Amount',
            accessor: (row: Bill) => fontBoldCurrency(row.amount)
        },
        {
            header: 'Due Date',
            accessor: (row: Bill) => formatDate(row.due_date)
        },
        {
            header: 'Status',
            accessor: (row: Bill) => <StatusBadge status={row.status} />
        },
        {
            header: 'Action',
            accessor: (row: Bill) => (
                <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Download</button>
                    {(row.status === 'unpaid' || row.status === 'overdue') && (
                        <button 
                            onClick={() => handlePayClick(row)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500 font-semibold shadow-sm"
                        >
                            Pay Now
                        </button>
                    )}
                </div>
            )
        }
    ];

    const fontBoldCurrency = (amount: string | number) => <span className="font-semibold">{formatCurrency(amount)}</span>;

    if (loading && bills.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Billing History" 
                description="View and manage your monthly statements."
            />

            {hasUnpaid && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {/* Icon */}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                You have unpaid or overdue bills. Please settle them to prevent service interruption.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <DataTable
                    data={bills}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search bills..."
                />
            </div>

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                bill={selectedBill}
                onPaymentSuccess={() => {
                    fetchBills(); // Refresh list after mock payment
                }}
            />
        </div>
    );
}
