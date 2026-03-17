'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, Subscription, Bill } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/ConfirmDialog';

export default function AdminSubscribers() {
    const [subscribers, setSubscribers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] = useState<User | null>(null);
    const [subscriberDetails, setSubscriberDetails] = useState<{ subscription: Subscription | null, bills: Bill[] } | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/subscribers');
            // Assuming paginated response
            setSubscribers(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load subscribers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleView = async (subscriber: User) => {
        setSelectedSubscriber(subscriber);
        setIsViewModalOpen(true);
        setDetailsLoading(true);
        try {
            const response = await api.get(`/admin/subscribers/${subscriber.id}`);
            setSubscriberDetails(response.data);
        } catch (error) {
            console.error("Failed to load subscriber details", error);
            toast('Failed to load details', 'error');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedSubscriber) return;
        
        const action = selectedSubscriber.is_active ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this subscriber?`)) return;

        try {
            await api.put(`/admin/subscribers/${selectedSubscriber.id}/toggle-status`);
            toast(`Subscriber ${action}d successfully`, 'success');
            
            // Update local state
            const updatedStatus = !selectedSubscriber.is_active;
            setSelectedSubscriber({ ...selectedSubscriber, is_active: updatedStatus });
            setSubscribers(subscribers.map(sub => sub.id === selectedSubscriber.id ? { ...sub, is_active: updatedStatus } : sub));
        } catch (error) {
            console.error(`Failed to ${action} subscriber`, error);
            toast(`Failed to ${action} subscriber`, 'error');
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: (row: User) => <span className="font-medium text-gray-900">{row.first_name} {row.last_name}</span>,
        },
        {
            header: 'Email',
            accessor: (row: User) => row.email as string,
        },
        {
            header: 'Phone',
            accessor: (row: User) => (row.phone || '') as string,
        },
        {
            header: 'Status',
            accessor: (row: User) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    row.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Action',
            accessor: (row: User) => (
                <button 
                    onClick={() => handleView(row)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                    View Details
                </button>
            )
        }
    ];

    if (loading && subscribers.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Subscribers Management" 
                description="View and manage all active and inactive network subscribers."
            />

            <div className="mt-8">
                <DataTable
                    data={subscribers}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search subscribers by name, email, or phone..."
                />
            </div>

            <Modal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                title="Subscriber Details"
                maxWidth="2xl"
            >
                {selectedSubscriber && (
                    <div className="space-y-6">
                        {/* Header Info & Actions */}
                        <div className="flex justify-between items-start border-b pb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{selectedSubscriber.first_name} {selectedSubscriber.last_name}</h3>
                                <p className="text-sm text-gray-500">{selectedSubscriber.email} • {selectedSubscriber.phone}</p>
                            </div>
                            <button
                                onClick={handleToggleStatus}
                                className={`px-3 py-1.5 rounded text-sm font-semibold shadow-sm ${
                                    selectedSubscriber.is_active 
                                        ? 'bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-inset ring-red-600/20' 
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-inset ring-green-600/20'
                                }`}
                            >
                                {selectedSubscriber.is_active ? 'Deactivate Account' : 'Activate Account'}
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : subscriberDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Subscription Info */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 bg-gray-50 px-3 py-2 rounded">Current Subscription</h4>
                                    {subscriberDetails.subscription ? (
                                        <dl className="space-y-2 text-sm px-3">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Plan</dt>
                                                <dd className="font-medium">{subscriberDetails.subscription.plan?.name || 'N/A'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Status</dt>
                                                <dd><StatusBadge status={subscriberDetails.subscription.status} /></dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Started</dt>
                                                <dd>{formatDate(subscriberDetails.subscription.start_date)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Next Billing</dt>
                                                <dd>{formatDate(subscriberDetails.subscription.next_billing_date)}</dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <p className="text-sm text-gray-500 px-3">No active subscription found.</p>
                                    )}
                                </div>

                                {/* Recent Bills Quick View */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 bg-gray-50 px-3 py-2 rounded">Recent Bills</h4>
                                    {subscriberDetails.bills && subscriberDetails.bills.length > 0 ? (
                                        <ul className="space-y-3 px-3">
                                            {subscriberDetails.bills.slice(0, 3).map(bill => (
                                                <li key={bill.id} className="flex justify-between text-sm items-center">
                                                    <div>
                                                        <span className="font-medium">{formatDate(bill.billing_period_start)}</span>
                                                        <span className="text-gray-500 ml-2">{formatCurrency(Number(bill.amount))}</span>
                                                    </div>
                                                    <StatusBadge status={bill.status} className="text-xs" />
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 px-3">No billing history.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Could not load details.</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
