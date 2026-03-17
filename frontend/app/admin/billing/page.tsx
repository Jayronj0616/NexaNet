'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bill } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/ConfirmDialog';
import { FileText, PlayCircle } from 'lucide-react';

export default function AdminBilling() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/bills');
            setBills(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load bills", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleGenerateBills = async () => {
        if (!window.confirm("Are you sure you want to run the billing cycle? This will generate bills for all active subscribers for the current month.")) return;
        
        setGenerating(true);
        try {
            const response = await api.post('/admin/bills/generate');
            toast(`Successfully generated ${response.data.generated_count} bills`, 'success');
            fetchBills();
        } catch (error: any) {
            console.error("Failed to generate bills", error);
            toast(error.response?.data?.message || 'Failed to generate bills', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkPaid = async (id: number) => {
        if (!window.confirm("Manually mark this bill as paid?")) return;
        
        try {
            await api.put(`/admin/bills/${id}/mark-paid`);
            toast('Bill marked as paid', 'success');
            setBills(bills.map(b => b.id === id ? { ...b, status: 'paid', paid_at: new Date().toISOString() } : b));
        } catch (error) {
            console.error("Failed to update status", error);
            toast('Failed to update status', 'error');
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this bill?")) return;
        
        try {
            await api.put(`/admin/bills/${id}/cancel`);
            toast('Bill cancelled', 'success');
            setBills(bills.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        } catch (error) {
            console.error("Failed to update status", error);
            toast('Failed to update status', 'error');
        }
    };

    const columns = [
        {
            header: 'Bill No.',
            accessor: (row: Bill) => <span className="font-semibold text-gray-900">{row.bill_number}</span>
        },
        {
            header: 'Subscriber',
            accessor: (row: Bill) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Unknown'
        },
        {
            header: 'Period',
            accessor: (row: Bill) => `${formatDate(row.billing_period_start)} - ${formatDate(row.billing_period_end)}`,
            className: 'text-xs'
        },
        {
            header: 'Amount',
            accessor: (row: Bill) => <span className="font-bold">{formatCurrency(Number(row.amount))}</span>
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
            header: 'Actions',
            accessor: (row: Bill) => (
                <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded" title="View Details">
                        <FileText className="h-4 w-4" />
                    </button>
                    {(row.status === 'unpaid' || row.status === 'overdue') && (
                        <>
                            <button onClick={() => handleMarkPaid(row.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 font-medium border border-green-200">
                                Mark Paid
                            </button>
                            <button onClick={() => handleCancel(row.id)} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100 font-medium border border-red-200">
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    if (loading && bills.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Billing & Invoices
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                        Manage subscriber invoices, track payments, and run billing cycles.
                    </p>
                </div>
                <div className="mt-4 flex sm:ml-4 sm:mt-0">
                    <button
                        type="button"
                        onClick={handleGenerateBills}
                        disabled={generating}
                        className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
                    >
                        {generating ? 'Generating...' : (
                            <>
                                <PlayCircle className="h-5 w-5" />
                                Run Billing Cycle (Monthly)
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <DataTable
                    data={bills}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search invoices..."
                />
            </div>
        </div>
    );
}
