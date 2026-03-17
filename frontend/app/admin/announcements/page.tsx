'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/ConfirmDialog';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'info',
        is_published: true,
        expires_at: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/announcements');
            setAnnouncements(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load announcements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/announcements', formData);
            toast('Announcement created successfully', 'success');
            setIsModalOpen(false);
            setFormData({ title: '', content: '', type: 'info', is_published: true, expires_at: '' });
            fetchAnnouncements();
        } catch (error: any) {
            console.error('Failed to create announcement', error);
            toast(error.response?.data?.message || 'Failed to create announcement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await api.delete(`/admin/announcements/${id}`);
            toast('Announcement deleted', 'success');
            setAnnouncements(announcements.filter(a => a.id !== id));
        } catch (error) {
            console.error('Failed to delete', error);
            toast('Failed to delete', 'error');
        }
    };

    const columns = [
        {
            header: 'Title',
            accessor: (row: Announcement) => <span className="font-semibold text-gray-900">{row.title}</span>
        },
        {
            header: 'Type',
            accessor: (row: Announcement) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    row.type === 'maintenance' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                    row.type === 'outage' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                    'bg-blue-50 text-blue-700 ring-blue-600/20'
                }`}>
                    {row.type.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row: Announcement) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.is_published ? 'Published' : 'Draft'}
                </span>
            )
        },
        {
            header: 'Published At',
            accessor: (row: Announcement) => row.published_at ? formatDate(row.published_at) : 'N/A'
        },
        {
            header: 'Expires At',
            accessor: (row: Announcement) => row.expires_at ? formatDate(row.expires_at) : 'Never'
        },
        {
            header: 'Action',
            accessor: (row: Announcement) => (
                <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
            )
        }
    ];

    if (loading && announcements.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="System Announcements" 
                description="Manage public network status updates, maintenance schedules, and info broadcasts."
                actionLabel="New Announcement"
                onAction={() => setIsModalOpen(true)}
            />

            <div className="mt-8">
                <DataTable
                    data={announcements}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search announcements..."
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Announcement">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="mt-1 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="info">General Info</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="outage">Service Outage</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Expires At (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.expires_at}
                                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                                className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="flex items-center pt-8">
                             <input
                                id="is_published"
                                type="checkbox"
                                checked={formData.is_published}
                                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                                Publish Immediately
                            </label>
                        </div>
                    </div>
                   
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Create Announcement'}
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
