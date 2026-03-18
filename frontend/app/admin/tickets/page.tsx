'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, MessageSquare, Paperclip, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { SupportTicket, SupportTicketAttachment, TicketReply } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate, formatDateTime, formatStatus } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/ConfirmDialog';
import { TicketAttachmentList } from '@/components/tickets/TicketAttachmentList';

const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'closed', label: 'Closed' },
] as const;

const priorityStyles: Record<string, string> = {
    low: 'bg-gray-50 text-gray-700 ring-gray-200',
    medium: 'bg-blue-50 text-blue-700 ring-blue-200',
    high: 'bg-orange-50 text-orange-700 ring-orange-200',
    urgent: 'bg-red-50 text-red-700 ring-red-200',
};

const renderPriorityBadge = (priority: SupportTicket['priority']) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${priorityStyles[priority] || priorityStyles.medium}`}>
        {formatStatus(priority)}
    </span>
);

export default function AdminTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<(typeof statusFilters)[number]['id']>('all');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [threadLoading, setThreadLoading] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
    const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<number | null>(null);
    const [replying, setReplying] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/tickets');
            setTickets(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to load tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshSelectedTicket = async (ticketId: number) => {
        setThreadLoading(true);
        try {
            const response = await api.get(`/admin/tickets/${ticketId}`);
            setSelectedTicket(response.data);
            setReplies(response.data.replies || []);
        } catch (error) {
            console.error('Failed to load thread', error);
            toast('Failed to load the full inquiry thread', 'error');
        } finally {
            setThreadLoading(false);
        }
    };

    useEffect(() => {
        void fetchTickets();
    }, []);

    const handleView = async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setReplies([]);
        setNewReply('');
        setReplyAttachments([]);
        setIsViewModalOpen(true);
        await refreshSelectedTicket(ticket.id);
    };

    const handleReplyAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReplyAttachments(Array.from(event.target.files || []));
    };

    const handleStatusUpdate = async (status: SupportTicket['status']) => {
        if (!selectedTicket) return;

        try {
            await api.patch(`/admin/tickets/${selectedTicket.id}/status`, { status });
            toast(`Ticket status updated to ${formatStatus(status)}`, 'success');
            await refreshSelectedTicket(selectedTicket.id);
            fetchTickets();
        } catch (error: any) {
            console.error('Failed to update status', error);
            toast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !newReply.trim()) return;

        setReplying(true);
        try {
            const formData = new FormData();
            formData.append('message', newReply);
            replyAttachments.forEach((file) => formData.append('attachments[]', file));

            await api.post(`/admin/tickets/${selectedTicket.id}/replies`, formData);
            toast('Reply sent successfully', 'success');
            setNewReply('');
            setReplyAttachments([]);
            await refreshSelectedTicket(selectedTicket.id);
            await fetchTickets();
        } catch (error: any) {
            console.error('Failed to send reply', error);
            toast(error.response?.data?.message || 'Failed to send reply', 'error');
        } finally {
            setReplying(false);
        }
    };

    const handleDownloadAttachment = async (attachment: SupportTicketAttachment) => {
        if (!selectedTicket) return;

        try {
            setDownloadingAttachmentId(attachment.id);
            const response = await api.get(`/admin/tickets/${selectedTicket.id}/attachments/${attachment.id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.original_name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download attachment', error);
            toast('Failed to download attachment', 'error');
        } finally {
            setDownloadingAttachmentId(null);
        }
    };

    const openCount = tickets.filter(ticket => ticket.status === 'open').length;
    const inProgressCount = tickets.filter(ticket => ticket.status === 'in_progress').length;
    const resolvedCount = tickets.filter(ticket => ticket.status === 'resolved').length;
    const urgentCount = tickets.filter(ticket => ticket.priority === 'urgent' && ticket.status !== 'closed').length;

    const filteredTickets = activeStatus === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === activeStatus);

    const columns = [
        {
            header: 'Ticket',
            accessor: (row: SupportTicket) => (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{row.ticket_number}</div>
                    <div className="max-w-xs truncate text-sm text-gray-500">{row.subject}</div>
                </div>
            ),
        },
        {
            header: 'Customer',
            accessor: (row: SupportTicket) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Unknown',
        },
        {
            header: 'Category',
            accessor: (row: SupportTicket) => <span className="capitalize">{formatStatus(row.category)}</span>,
        },
        {
            header: 'Priority',
            accessor: (row: SupportTicket) => renderPriorityBadge(row.priority),
        },
        {
            header: 'Status',
            accessor: (row: SupportTicket) => <StatusBadge status={row.status} />,
        },
        {
            header: 'Updated',
            accessor: (row: SupportTicket) => formatDate(row.updated_at),
        },
        {
            header: 'Action',
            accessor: (row: SupportTicket) => (
                <button
                    type="button"
                    onClick={() => handleView(row)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                    <MessageSquare className="h-4 w-4" />
                    View Thread
                </button>
            ),
        },
    ];

    if (loading && tickets.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Inquiry Tickets"
                description="Manage application, technical, account, and general customer inquiries."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-yellow-700">Open</p>
                    <p className="mt-2 text-2xl font-semibold text-yellow-900">{openCount}</p>
                    <p className="mt-1 text-xs text-yellow-700">New inquiries waiting for triage.</p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-blue-700">In Progress</p>
                    <p className="mt-2 text-2xl font-semibold text-blue-900">{inProgressCount}</p>
                    <p className="mt-1 text-xs text-blue-700">Active threads that need follow-through.</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-green-700">Resolved</p>
                    <p className="mt-2 text-2xl font-semibold text-green-900">{resolvedCount}</p>
                    <p className="mt-1 text-xs text-green-700">Resolved recently and still visible in the queue.</p>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-red-700">Urgent Active</p>
                    <p className="mt-2 text-2xl font-semibold text-red-900">{urgentCount}</p>
                    <p className="mt-1 text-xs text-red-700">High-priority tickets that are not yet closed.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => {
                    const isActive = activeStatus === filter.id;

                    return (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => setActiveStatus(filter.id)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {filter.label}
                        </button>
                    );
                })}
            </div>

            <DataTable
                data={filteredTickets}
                columns={columns}
                keyExtractor={(row) => row.id.toString()}
                searchPlaceholder="Search inquiries..."
            />

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={selectedTicket ? selectedTicket.ticket_number : 'Inquiry Thread'}
                maxWidth="4xl"
            >
                {threadLoading || !selectedTicket ? (
                    <div className="py-12 text-center text-sm text-gray-500">Loading inquiry thread...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Issue Summary</p>
                                <h3 className="mt-2 text-xl font-semibold text-gray-900">{selectedTicket.subject}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-600">Review the full context and keep the customer's thread moving from here.</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
                                        <div className="mt-2">
                                            <StatusBadge status={selectedTicket.status} />
                                        </div>
                                    </div>
                                    {selectedTicket.priority === 'urgent' && (
                                        <div className="rounded-full bg-red-50 p-2 text-red-600">
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                    )}
                                    {selectedTicket.status === 'resolved' && (
                                        <div className="rounded-full bg-green-50 p-2 text-green-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <dl className="mt-5 space-y-4 text-sm">
                                    <div>
                                        <dt className="text-gray-500">Customer</dt>
                                        <dd className="mt-1 font-medium text-gray-900">
                                            {selectedTicket.user ? `${selectedTicket.user.first_name} ${selectedTicket.user.last_name}` : 'Unknown'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Email</dt>
                                        <dd className="mt-1 font-medium text-gray-900">{selectedTicket.user?.email || '--'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Category</dt>
                                        <dd className="mt-1 font-medium text-gray-900">{formatStatus(selectedTicket.category)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Priority</dt>
                                        <dd className="mt-1">{renderPriorityBadge(selectedTicket.priority)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Created</dt>
                                        <dd className="mt-1 font-medium text-gray-900">{formatDateTime(selectedTicket.created_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Last Updated</dt>
                                        <dd className="mt-1 font-medium text-gray-900">{formatDateTime(selectedTicket.updated_at)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="mb-4 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900">Conversation</h4>
                                    <p className="mt-1 text-sm text-gray-500">Reply in-thread so the customer sees one clear conversation.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Update status</label>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusUpdate(e.target.value as SupportTicket['status'])}
                                        className="mt-2 rounded-md border-0 py-2 pl-3 pr-10 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                                        {selectedTicket.user?.first_name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Original request</p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{selectedTicket.description}</p>
                                        <TicketAttachmentList
                                            attachments={selectedTicket.attachments || []}
                                            onDownload={handleDownloadAttachment}
                                            downloadingId={downloadingAttachmentId}
                                        />
                                        <p className="mt-3 text-xs text-gray-500">{formatDateTime(selectedTicket.created_at)}</p>
                                    </div>
                                </div>

                                {replies.map((reply) => (
                                    <div key={reply.id} className={`flex gap-3 ${reply.is_staff_reply ? 'justify-end' : ''}`}>
                                        {!reply.is_staff_reply && (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                                                {reply.user?.first_name?.charAt(0) || 'C'}
                                            </div>
                                        )}
                                        <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                                            reply.is_staff_reply
                                                ? 'border border-blue-100 bg-blue-50 text-blue-950'
                                                : 'border border-gray-200 bg-white text-gray-800'
                                        }`}>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {reply.is_staff_reply ? 'Staff Reply' : 'Customer Follow-up'}
                                            </p>
                                            <p className="mt-2 whitespace-pre-wrap">{reply.message}</p>
                                            <TicketAttachmentList
                                                attachments={reply.attachments || []}
                                                onDownload={handleDownloadAttachment}
                                                downloadingId={downloadingAttachmentId}
                                            />
                                            <p className="mt-3 text-xs text-gray-500">{formatDateTime(reply.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedTicket.status !== 'closed' && (
                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <h4 className="text-base font-semibold text-gray-900">Reply to Customer</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Sending a reply keeps the ticket active and triggers the customer notification flow.
                                </p>
                                <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
                                    <textarea
                                        rows={4}
                                        className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="Share the next step, resolution details, or request more information."
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        required
                                    />
                                    <div className="rounded-lg border border-dashed border-gray-300 px-4 py-4">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                                            <Paperclip className="h-4 w-4" />
                                            Attach files
                                            <input
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={handleReplyAttachmentChange}
                                            />
                                        </label>
                                        <p className="mt-2 text-xs text-gray-500">Optional reply files, up to 3 attachments.</p>
                                        {replyAttachments.length > 0 && (
                                            <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                                {replyAttachments.map((file) => (
                                                    <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={replying || !newReply.trim()}
                                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                            {replying ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
