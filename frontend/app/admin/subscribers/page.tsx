'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, Subscription } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/ConfirmDialog';

export default function AdminSubscribers() {
    const [subscribers, setSubscribers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] = useState<User | null>(null);
    const [subscriberDetails, setSubscriberDetails] = useState<{ subscription: Subscription | null } | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/subscribers');
            setSubscribers(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to load subscribers', error);
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
            console.error('Failed to load subscriber details', error);
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
            await api.patch(`/admin/subscribers/${selectedSubscriber.id}/toggle-status`);
            toast(`Subscriber ${action}d successfully`, 'success');

            const updatedStatus = !selectedSubscriber.is_active;
            setSelectedSubscriber({ ...selectedSubscriber, is_active: updatedStatus });
            setSubscribers(subscribers.map((subscriber) => (
                subscriber.id === selectedSubscriber.id
                    ? { ...subscriber, is_active: updatedStatus }
                    : subscriber
            )));
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
            accessor: (row: User) => row.email,
        },
        {
            header: 'Phone',
            accessor: (row: User) => row.phone || '',
        },
        {
            header: 'Status',
            accessor: (row: User) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    row.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            header: 'Action',
            accessor: (row: User) => (
                <button
                    type="button"
                    onClick={() => handleView(row)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                    View Details
                </button>
            ),
        },
    ];

    if (loading && subscribers.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Subscribers Management"
                description="View and manage all active and inactive network subscribers."
            />

            <DataTable
                data={subscribers}
                columns={columns}
                keyExtractor={(row) => row.id.toString()}
                searchPlaceholder="Search subscribers by name, email, or phone..."
            />

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Subscriber Details"
                maxWidth="2xl"
            >
                {selectedSubscriber && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{selectedSubscriber.first_name} {selectedSubscriber.last_name}</h3>
                                <p className="text-sm text-gray-500">{selectedSubscriber.email} | {selectedSubscriber.phone || 'No phone number'}</p>
                            </div>
                            <button
                                type="button"
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
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 rounded bg-gray-50 px-3 py-2">Current Subscription</h4>
                                    {subscriberDetails.subscription ? (
                                        <dl className="space-y-2 px-3 text-sm">
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-gray-500">Plan</dt>
                                                <dd className="font-medium text-right">{subscriberDetails.subscription.plan?.name || 'N/A'}</dd>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-gray-500">Status</dt>
                                                <dd><StatusBadge status={subscriberDetails.subscription.status} /></dd>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-gray-500">Started</dt>
                                                <dd className="text-right">{formatDate(subscriberDetails.subscription.start_date)}</dd>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <dt className="text-gray-500">Plan Cycle</dt>
                                                <dd className="text-right capitalize">{subscriberDetails.subscription.plan?.billing_cycle || 'N/A'}</dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <p className="px-3 text-sm text-gray-500">No active subscription found.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 rounded bg-gray-50 px-3 py-2">Account Details</h4>
                                    <dl className="space-y-2 px-3 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-gray-500">Role</dt>
                                            <dd className="font-medium capitalize">{selectedSubscriber.role}</dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-gray-500">City</dt>
                                            <dd className="font-medium text-right">{selectedSubscriber.city || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-gray-500">Province</dt>
                                            <dd className="font-medium text-right">{selectedSubscriber.province || 'N/A'}</dd>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-gray-500">Joined</dt>
                                            <dd className="font-medium text-right">{selectedSubscriber.created_at ? formatDate(selectedSubscriber.created_at) : 'N/A'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            <p className="py-4 text-center text-sm text-gray-500">Could not load details.</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
