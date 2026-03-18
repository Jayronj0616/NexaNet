'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Users, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/admin/dashboard');
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

    const { 
        total_subscribers, 
        active_subscribers, 
        pending_applications, 
        open_tickets,
        recent_applications
    } = data || {};

    const stats = [
        { name: 'Total Subscribers', stat: total_subscribers || 0, icon: Users, color: 'bg-blue-500' },
        { name: 'Active Subscriptions', stat: active_subscribers || 0, icon: TrendingUp, color: 'bg-green-500' },
        { name: 'Pending Applications', stat: pending_applications || 0, icon: FileText, color: 'bg-yellow-500' },
        { name: 'Open Support Tickets', stat: open_tickets || 0, icon: AlertCircle, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Admin Dashboard" description="Overview of network operations and subscriber metrics." />

            {/* Main Stats */}
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Support Queue */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Support Queue</h3>
                        <Link href="/admin/tickets" className="text-sm font-medium text-blue-600 hover:text-blue-500">Open tickets</Link>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-700">Tickets Needing Attention</p>
                            <p className="mt-2 text-3xl font-bold text-red-900">{open_tickets || 0}</p>
                            <p className="mt-1 text-xs text-red-700">Open and in-progress inquiries waiting for team action.</p>
                        </div>
                        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                            <p className="text-sm font-medium text-yellow-700">Pending Applications</p>
                            <p className="mt-2 text-3xl font-bold text-yellow-900">{pending_applications || 0}</p>
                            <p className="mt-1 text-xs text-yellow-700">Application reviews that may turn into support follow-ups.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                            <Link href="/admin/tickets" className="text-blue-600 hover:text-blue-500 text-sm font-medium">Review support queue &rarr;</Link>
                            <Link href="/admin/applications" className="text-blue-600 hover:text-blue-500 text-sm font-medium">Review applications &rarr;</Link>
                        </div>
                    </div>
                </div>

                {/* Recent Applications Quick View */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
                        <Link href="/admin/applications" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</Link>
                    </div>
                    <div className="flow-root">
                        <ul role="list" className="-my-5 divide-y divide-gray-200">
                            {recent_applications?.map((app: any) => (
                                <li key={app.id} className="py-4 text-sm flex justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{app.first_name} {app.last_name}</span>
                                        <span className="text-gray-500">{app.barangay}, {app.city}</span>
                                    </div>
                                    <div className="flex items-center">
                                       <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                            app.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : 
                                            app.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </li>
                            )) || <p className="text-sm text-gray-500 py-4">No recent applications.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
