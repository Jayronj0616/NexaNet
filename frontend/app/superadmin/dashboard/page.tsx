'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Building2, Users as UsersIcon, HardDrive, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function SuperAdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/superadmin/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Failed to load superadmin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <FullPageLoader />;

    const { 
        total_customers,
        total_staff,
        active_plans,
        total_revenue_ytd
    } = data || {};

    const stats = [
        { name: 'Total Customers', stat: total_customers || 0, icon: UsersIcon, color: 'bg-blue-500' },
        { name: 'Total Staff', stat: total_staff || 0, icon: Building2, color: 'bg-purple-500' },
        { name: 'Active Plans', stat: active_plans || 0, icon: HardDrive, color: 'bg-green-500' },
        { name: 'YTD Revenue', stat: formatCurrency(total_revenue_ytd || 0), icon: DollarSign, color: 'bg-indigo-500' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="SuperAdmin Dashboard" description="Master overview of NexaNet operations and financials." />

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
                 {/* Quick Links / Admin Access */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6 overflow-hidden">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 border-b pb-2">Quick Access</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/superadmin/plans" className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                            <span className="font-medium text-gray-900">Manage Plans</span>
                            <span className="text-gray-400 group-hover:text-blue-600">&rarr;</span>
                        </Link>
                        <Link href="/superadmin/staff" className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-between group">
                            <span className="font-medium text-gray-900">Manage Staff</span>
                            <span className="text-gray-400 group-hover:text-blue-600">&rarr;</span>
                        </Link>
                        <Link href="/superadmin/settings" className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-between group col-span-2">
                            <span className="font-medium text-gray-900">System Settings</span>
                            <span className="text-gray-400 group-hover:text-blue-600">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
