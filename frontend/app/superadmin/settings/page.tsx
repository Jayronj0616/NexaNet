'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { toast } from '@/components/ui/ConfirmDialog';
import { Save } from 'lucide-react';

interface SystemSetting {
    id?: number;
    key: string;
    value: string;
    type: 'string' | 'boolean' | 'integer' | 'json';
    group: 'company' | 'billing' | 'system';
    label: string;
}

export default function SuperAdminSettings() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state grouped
    const [companyInfo, setCompanyInfo] = useState<any>({});
    const [billingInfo, setBillingInfo] = useState<any>({});
    const [systemInfo, setSystemInfo] = useState<any>({});

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/superadmin/settings');
            const data: SystemSetting[] = response.data.data || response.data;
            setSettings(data);
            
            // Distribute to groups for easier form handling
            const cInfo: any = {};
            const bInfo: any = {};
            const sInfo: any = {};
            
            data.forEach(s => {
                const val = s.type === 'boolean' ? s.value === 'true' || s.value === '1' : s.value;
                if (s.group === 'company') cInfo[s.key] = val;
                if (s.group === 'billing') bInfo[s.key] = val;
                if (s.group === 'system') sInfo[s.key] = val;
            });
            
            setCompanyInfo(cInfo);
            setBillingInfo(bInfo);
            setSystemInfo(sInfo);

        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        // Flatten back to array format expected by backend (key => value)
        const payload: Record<string, any> = {
            ...companyInfo,
            ...billingInfo,
            ...systemInfo
        };

        try {
            await api.post('/superadmin/settings', payload);
            toast('Settings saved successfully', 'success');
            fetchSettings(); // Refresh
        } catch (error: any) {
             console.error('Failed to save settings', error);
             toast(error.response?.data?.message || 'Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <FullPageLoader />;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="sm:flex sm:items-center sm:justify-between">
                <PageHeader 
                    title="System Settings" 
                    description="Configure global application variables, company info, and automated rules."
                />
            </div>

            <form onSubmit={handleSave} className="space-y-8 mt-8">
                {/* Company Information */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pb-2">Company Information</h3>
                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input 
                                    type="text" 
                                    value={companyInfo['company_name'] || ''} 
                                    onChange={(e) => setCompanyInfo({...companyInfo, 'company_name': e.target.value})}
                                    className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Support Email</label>
                                <input 
                                    type="email" 
                                    value={companyInfo['support_email'] || ''} 
                                    onChange={(e) => setCompanyInfo({...companyInfo, 'support_email': e.target.value})}
                                    className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" 
                                />
                            </div>
                             <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Support Phone</label>
                                <input 
                                    type="text" 
                                    value={companyInfo['support_phone'] || ''} 
                                    onChange={(e) => setCompanyInfo({...companyInfo, 'support_phone': e.target.value})}
                                    className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Rules */}
                 <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pb-2">Billing Rules</h3>
                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Days Until Bill is Due (After Generation)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={billingInfo['bill_due_days'] || ''} 
                                    onChange={(e) => setBillingInfo({...billingInfo, 'bill_due_days': e.target.value})}
                                    className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grace Period Days (Before Disconnect)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={billingInfo['grace_period_days'] || ''} 
                                    onChange={(e) => setBillingInfo({...billingInfo, 'grace_period_days': e.target.value})}
                                    className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Toggles */}
                 <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 border-b pb-2">System Controls</h3>
                        <div className="mt-5 space-y-4">
                            <div className="flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="maintenance_mode"
                                        type="checkbox"
                                        checked={systemInfo['maintenance_mode'] || false}
                                        onChange={(e) => setSystemInfo({...systemInfo, 'maintenance_mode': e.target.checked})}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor="maintenance_mode" className="font-medium text-gray-900">Maintenance Mode</label>
                                    <p className="text-gray-500">Temporarily blocks customer portal access and displays a maintenance message.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-75 transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
