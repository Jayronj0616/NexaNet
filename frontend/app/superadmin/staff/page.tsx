'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/ConfirmDialog';

export default function SuperAdminStaff() {
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'admin' | 'superadmin'>('admin');
    const [password, setPassword] = useState('');
    const [isActive, setIsActive] = useState(true);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await api.get('/superadmin/staff');
            setStaff(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load staff", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingStaff(user);
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setRole(user.role as 'admin' | 'superadmin');
            setIsActive(user.is_active);
            setPassword(''); // Leave blank unless changing
        } else {
            setEditingStaff(null);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setRole('admin');
            setIsActive(true);
            setPassword('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        const payload: any = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            role,
            is_active: isActive
        };

        if (password) {
            payload.password = password;
            payload.password_confirmation = password;
        }

        try {
            if (editingStaff) {
                await api.put(`/superadmin/staff/${editingStaff.id}`, payload);
                toast('Staff record updated successfully', 'success');
            } else {
                await api.post('/superadmin/staff', payload);
                toast('Staff member created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchStaff();
        } catch (error: any) {
            console.error('Failed to save staff', error);
            toast(error.response?.data?.message || 'Failed to save staff', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this staff member? Check active tickets assigned to them first.")) return;
        try {
            await api.delete(`/superadmin/staff/${id}`);
            toast('Staff deleted', 'success');
            fetchStaff();
        } catch (error: any) {
            console.error('Failed to delete', error);
            toast(error.response?.data?.message || 'Failed to delete staff', 'error');
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: (row: User) => <span className="font-medium text-gray-900">{row.first_name} {row.last_name}</span>
        },
        {
            header: 'Email',
            accessor: (row: User) => row.email as string
        },
        {
            header: 'Role',
            accessor: (row: User) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                    row.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {row.role}
                </span>
            )
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
                <div className="flex gap-3">
                    <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                </div>
            )
        }
    ];

    if (loading && staff.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Staff Management" 
                description="Manage system administrators and support staff accounts."
                actionLabel="Add Staff Member"
                onAction={() => handleOpenModal()}
            />

            <div className="mt-8">
                <DataTable
                    data={staff}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search staff..."
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Edit Staff" : "Add New Staff"} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value as 'admin'|'superadmin')} className="mt-1 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6">
                                <option value="admin">Admin (Staff)</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password {editingStaff && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                            </label>
                            <input type="password" required={!editingStaff} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6" />
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
                            Account is active (can log in)
                        </label>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Create Staff')}
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
