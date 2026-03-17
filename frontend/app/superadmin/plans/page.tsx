'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plan } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export default function SuperAdminPlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [speed, setSpeed] = useState('');
    const [price, setPrice] = useState('');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isActive, setIsActive] = useState(true);
    const [features, setFeatures] = useState<string[]>(['']);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await api.get('/superadmin/plans');
            setPlans(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load plans", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenModal = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setName(plan.name);
            setSpeed(plan.speed_mbps.toString());
            setPrice(plan.price.toString());
            setBillingCycle(plan.billing_cycle);
            setIsActive(plan.is_active);
            setFeatures(Array.isArray(plan.features) && plan.features.length > 0 ? plan.features : ['']);
        } else {
            setEditingPlan(null);
            setName('');
            setSpeed('');
            setPrice('');
            setBillingCycle('monthly');
            setIsActive(true);
            setFeatures(['']);
        }
        setIsModalOpen(true);
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const addFeature = () => setFeatures([...features, '']);

    const removeFeature = (index: number) => {
        if (features.length > 1) {
            const newFeatures = features.filter((_, i) => i !== index);
            setFeatures(newFeatures);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        const payload = {
            name,
            speed_mbps: parseInt(speed),
            price,
            billing_cycle: billingCycle,
            is_active: isActive,
            features: features.filter(f => f.trim() !== '') // Remove empty features
        };

        try {
            if (editingPlan) {
                await api.put(`/superadmin/plans/${editingPlan.id}`, payload);
                toast('Plan updated successfully', 'success');
            } else {
                await api.post('/superadmin/plans', payload);
                toast('Plan created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (error: any) {
            console.error('Failed to save plan', error);
            toast(error.response?.data?.message || 'Failed to save plan', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;
        try {
            await api.delete(`/superadmin/plans/${id}`);
            toast('Plan deleted', 'success');
            fetchPlans();
        } catch (error: any) {
            console.error('Failed to delete', error);
            toast(error.response?.data?.message || 'Failed to delete plan', 'error');
        }
    };

    const columns = [
        {
            header: 'Plan Name',
            accessor: (row: Plan) => <span className="font-semibold text-gray-900">{row.name}</span>
        },
        {
            header: 'Speed',
            accessor: (row: Plan) => `${row.speed_mbps} Mbps`
        },
        {
            header: 'Price',
            accessor: (row: Plan) => formatCurrency(Number(row.price))
        },
        {
            header: 'Cycle',
            accessor: (row: Plan) => <span className="capitalize">{row.billing_cycle}</span>
        },
        {
            header: 'Status',
            accessor: (row: Plan) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    row.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                }`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Action',
            accessor: (row: Plan) => (
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                </div>
            )
        }
    ];

    if (loading && plans.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Service Plans" 
                description="Manage internet packages, pricing, and availability."
                actionLabel="Create Plan"
                onAction={() => handleOpenModal()}
            />

            <div className="mt-8">
                <DataTable
                    data={plans}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search plans..."
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan ? "Edit Plan" : "Create New Plan"} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="e.g. Fiber Blaze 100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Speed (Mbps)</label>
                            <input type="number" required min="1" value={speed} onChange={(e) => setSpeed(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="e.g. 100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (₱)</label>
                            <input type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="e.g. 1500.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6">
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="annually">Annually</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                             <label className="block text-sm font-medium text-gray-700">Plan Features</label>
                             <button type="button" onClick={addFeature} className="text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium">
                                 <Plus className="w-3 h-3 mr-1" /> Add Feature
                             </button>
                        </div>
                        <div className="space-y-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={feature} 
                                        onChange={(e) => handleFeatureChange(index, e.target.value)} 
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" 
                                        placeholder="e.g. Free Router Included" 
                                        required
                                    />
                                    {features.length > 1 && (
                                        <button type="button" onClick={() => removeFeature(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                            Plan is active and visible to public
                        </label>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
