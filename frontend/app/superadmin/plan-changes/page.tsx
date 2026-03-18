'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/ConfirmDialog';
import { CheckCircle, XCircle } from 'lucide-react';

export default function SuperAdminPlanChanges() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/superadmin/plan-change-requests');
            setRequests(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load plan change requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        
        setProcessingId(id);
        try {
            await api.patch(`/superadmin/plan-change-requests/${id}/${action}`);
            toast(`Request ${action}d successfully`, 'success');
            fetchRequests(); // Refresh to get updated status and potentially updated subscription details
        } catch (error: any) {
             console.error(`Failed to ${action} request`, error);
             toast(error.response?.data?.message || `Failed to ${action} request`, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const columns = [
        {
            header: 'Customer',
            accessor: (row: any) => row.user ? <span className="font-medium text-gray-900">{row.user.first_name} {row.user.last_name}</span> : 'Unknown'
        },
        {
            header: 'Type',
            accessor: (row: any) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    row.type === 'upgrade' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-orange-50 text-orange-700 ring-orange-600/20'
                }`}>
                    {row.type.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Change Requested',
            accessor: (row: any) => (
                <div className="text-sm">
                    <span className="text-gray-500 line-through mr-2">{row.current_plan?.name}</span>
                    <span className="font-medium text-blue-600">&rarr; {row.requested_plan?.name}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row: any) => <StatusBadge status={row.status} />
        },
        {
            header: 'Requested On',
            accessor: (row: any) => formatDate(row.created_at)
        },
        {
            header: 'Action',
            accessor: (row: any) => {
                if (row.status !== 'pending') return <span className="text-xs text-gray-400 italic">Processed</span>;
                
                return (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleAction(row.id, 'approve')} 
                            disabled={processingId === row.id}
                            className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors disabled:opacity-50"
                            title="Approve"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleAction(row.id, 'reject')} 
                            disabled={processingId === row.id}
                            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50"
                            title="Reject"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                );
            }
        }
    ];

    if (loading && requests.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Plan Change Requests" 
                description="Review and approve customer requests to upgrade or downgrade their internet plans."
            />

            <div className="mt-8">
                <DataTable
                    data={requests}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search requests..."
                />
            </div>
        </div>
    );
}
