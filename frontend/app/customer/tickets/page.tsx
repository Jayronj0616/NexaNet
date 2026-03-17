'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SupportTicket } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/ConfirmDialog';

export default function CustomerTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('technical');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customer/tickets');
            setTickets(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/customer/tickets', { subject, category, description });
            toast('Ticket created successfully', 'success');
            setIsCreateModalOpen(false);
            setSubject('');
            setDescription('');
            setCategory('technical');
            fetchTickets();
        } catch (error: any) {
            console.error('Failed to create ticket', error);
            toast(error.response?.data?.message || 'Failed to create ticket', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            header: 'Ticket ID',
            accessor: (row: SupportTicket) => <span className="font-semibold">TKT-{row.id.toString().padStart(4, '0')}</span>
        },
        {
            header: 'Subject',
            accessor: 'subject',
            className: 'max-w-xs truncate'
        },
        {
            header: 'Category',
            accessor: (row: SupportTicket) => <span className="capitalize">{row.category.replace('_', ' ')}</span>
        },
        {
            header: 'Status',
            accessor: (row: SupportTicket) => <StatusBadge status={row.status} />
        },
        {
            header: 'Created At',
            accessor: (row: SupportTicket) => formatDate(row.created_at)
        },
        {
            header: 'Action',
            accessor: (row: SupportTicket) => (
                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">View Thread</button>
            )
        }
    ];

    if (loading && tickets.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Support Tickets" 
                description="Need help? Create a new ticket or view your past requests."
                actionLabel="Create Ticket"
                onAction={() => setIsCreateModalOpen(true)}
            />

            <div className="mt-8">
                <DataTable
                    data={tickets}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search tickets..."
                />
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Support Ticket">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="technical">Technical Issue</option>
                            <option value="billing">Billing Inquiry</option>
                            <option value="general">General Question</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
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
