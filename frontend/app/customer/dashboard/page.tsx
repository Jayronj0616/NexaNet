'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function CustomerDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/customer/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <FullPageLoader />;

    const { subscription, unread_notifications, open_tickets } = data || {};

    return (
        <div className="space-y-6">
            <PageHeader title="Welcome back," description="Here's what's happening with your NexaNet account today." />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Connection Status</dt>
                    <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                        <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                            {subscription ? <StatusBadge status={subscription.status} /> : <span className="text-gray-500 text-sm">No Active Sub</span>}
                        </div>
                    </dd>
                </div>
                
                <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Current Plan</dt>
                    <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                        <div className="text-xl font-semibold text-gray-900">
                            {subscription?.plan?.name || '--'}
                        </div>
                    </dd>
                </div>

                <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Unread Notifications</dt>
                    <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                        <div className="text-2xl font-semibold text-blue-600">
                            {unread_notifications || 0}
                        </div>
                    </dd>
                </div>

                <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Open Tickets</dt>
                    <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                        <div className="text-2xl font-semibold text-gray-900">
                            {open_tickets || 0}
                        </div>
                    </dd>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Details */}
                {subscription && (
                    <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Subscription Details</h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Speed</dt>
                                <dd className="mt-1 text-sm text-gray-900">Up to {subscription.plan?.speed_mbps} Mbps</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Plan Rate</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatCurrency(subscription.plan?.price)}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Started On</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(subscription.start_date)}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Plan Cycle</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{subscription.plan?.billing_cycle || '--'}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {/* Support Center */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Support Center</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Keep application concerns, installation questions, and service follow-ups in one place.
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                <p className="text-sm font-medium text-blue-700">Open Inquiries</p>
                                <p className="mt-2 text-2xl font-bold text-blue-900">{open_tickets || 0}</p>
                                <p className="mt-1 text-xs text-blue-700">Track active conversations with the support team.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm font-medium text-gray-700">Unread Notifications</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{unread_notifications || 0}</p>
                                <p className="mt-1 text-xs text-gray-600">Stay on top of replies and application updates.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link href="/customer/tickets" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                                Open Support Tickets &rarr;
                            </Link>
                            <Link href="/customer/notifications" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                                View Notifications &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
