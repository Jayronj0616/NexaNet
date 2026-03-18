'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, MessageSquareMore, Paperclip, PlusCircle, Send, TimerReset } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
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

export default function CustomerTickets() {
    const searchParams = useSearchParams();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<(typeof statusFilters)[number]['id']>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [threadLoading, setThreadLoading] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [createAttachments, setCreateAttachments] = useState<File[]>([]);
    const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
    const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<number | null>(null);
    const [hasAutoOpenedTicket, setHasAutoOpenedTicket] = useState(false);

    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState<SupportTicket['category']>('application');
    const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replying, setReplying] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customer/tickets');
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
            const response = await api.get(`/customer/tickets/${ticketId}`);
            setSelectedTicket(response.data);
            setReplies(response.data.replies || []);
        } catch (error) {
            console.error('Failed to load ticket thread', error);
            toast('Failed to load the full ticket thread', 'error');
        } finally {
            setThreadLoading(false);
        }
    };

    useEffect(() => {
        void fetchTickets();
    }, []);

    useEffect(() => {
        const requestedTicketId = Number(searchParams.get('ticket'));
        if (!requestedTicketId || hasAutoOpenedTicket || tickets.length === 0) return;

        const matchedTicket = tickets.find((ticket) => ticket.id === requestedTicketId);
        if (!matchedTicket) return;

        setHasAutoOpenedTicket(true);
        void handleView(matchedTicket);
    }, [tickets, searchParams, hasAutoOpenedTicket]);

    const resetCreateForm = () => {
        setSubject('');
        setCategory('application');
        setPriority('medium');
        setDescription('');
        setCreateAttachments([]);
    };

    const handleCreateAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreateAttachments(Array.from(event.target.files || []));
    };

    const handleReplyAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReplyAttachments(Array.from(event.target.files || []));
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('category', category);
            formData.append('priority', priority);
            formData.append('description', description);
            createAttachments.forEach((file) => formData.append('attachments[]', file));

            await api.post('/customer/tickets', formData);
            toast('Inquiry submitted successfully', 'success');
            setIsCreateModalOpen(false);
            resetCreateForm();
            await fetchTickets();
        } catch (error: any) {
            console.error('Failed to create ticket', error);
            toast(error.response?.data?.message || 'Failed to submit your inquiry', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleView = async (ticket: SupportTicket) => {
        setIsViewModalOpen(true);
        setSelectedTicket(ticket);
        setReplies([]);
        setNewReply('');
        setReplyAttachments([]);
        await refreshSelectedTicket(ticket.id);
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !newReply.trim()) return;

        setReplying(true);
        try {
            const formData = new FormData();
            formData.append('message', newReply);
            replyAttachments.forEach((file) => formData.append('attachments[]', file));

            await api.post(`/customer/tickets/${selectedTicket.id}/replies`, formData);
            toast('Follow-up sent successfully', 'success');
            setNewReply('');
            setReplyAttachments([]);
            await refreshSelectedTicket(selectedTicket.id);
            await fetchTickets();
        } catch (error: any) {
            console.error('Failed to send reply', error);
            toast(error.response?.data?.message || 'Failed to send follow-up', 'error');
        } finally {
            setReplying(false);
        }
    };

    const handleDownloadAttachment = async (attachment: SupportTicketAttachment) => {
        if (!selectedTicket) return;

        try {
            setDownloadingAttachmentId(attachment.id);
            const response = await api.get(`/customer/tickets/${selectedTicket.id}/attachments/${attachment.id}`, {
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
    const closedCount = tickets.filter(ticket => ticket.status === 'closed').length;

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
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
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
                description="Track application questions, service concerns, and support replies in one thread."
                actionLabel="New Inquiry"
                onAction={() => setIsCreateModalOpen(true)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Open</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{openCount}</p>
                    <p className="mt-1 text-xs text-gray-500">Waiting for the first staff response.</p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-blue-700">In Progress</p>
                    <p className="mt-2 text-2xl font-semibold text-blue-900">{inProgressCount}</p>
                    <p className="mt-1 text-xs text-blue-700">Active conversations with the support team.</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-green-700">Resolved</p>
                    <p className="mt-2 text-2xl font-semibold text-green-900">{resolvedCount}</p>
                    <p className="mt-1 text-xs text-green-700">Completed inquiries that still have history.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-600">Closed</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{closedCount}</p>
                    <p className="mt-1 text-xs text-gray-600">Archived conversations.</p>
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

            {tickets.length > 0 ? (
                <DataTable
                    data={filteredTickets}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search inquiries..."
                />
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
                    <MessageSquareMore className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No inquiries yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Start a ticket when you need help with your application, installation, or service.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                        <PlusCircle className="h-4 w-4" />
                        New Inquiry
                    </button>
                </div>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Inquiry">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                                className="mt-1 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                            >
                                <option value="application">Application</option>
                                <option value="technical">Technical</option>
                                <option value="account">Account</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as SupportTicket['priority'])}
                                className="mt-1 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Summarize your concern"
                            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Details</label>
                        <textarea
                            required
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Share any details that will help the team answer faster."
                            className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Attachments</label>
                        <div className="mt-1 rounded-lg border border-dashed border-gray-300 px-4 py-4">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                                <Paperclip className="h-4 w-4" />
                                Add files
                                <input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleCreateAttachmentChange}
                                />
                            </label>
                            <p className="mt-2 text-xs text-gray-500">Up to 3 files, 5MB each. JPG, PNG, PDF, DOC, or DOCX.</p>
                            {createAttachments.length > 0 && (
                                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                    {createAttachments.map((file) => (
                                        <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Inquiry'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={selectedTicket ? selectedTicket.ticket_number : 'Inquiry Thread'}
                maxWidth="3xl"
            >
                {threadLoading || !selectedTicket ? (
                    <div className="py-12 text-center text-sm text-gray-500">Loading inquiry thread...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</p>
                                <h3 className="mt-2 text-xl font-semibold text-gray-900">{selectedTicket.subject}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-600">Review the full conversation and add follow-ups here.</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Status</p>
                                        <div className="mt-2">
                                            <StatusBadge status={selectedTicket.status} />
                                        </div>
                                    </div>
                                    {selectedTicket.status === 'resolved' && (
                                        <div className="rounded-full bg-green-50 p-2 text-green-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <dl className="mt-5 space-y-4 text-sm">
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
                            <div className="mb-4 flex items-center gap-2">
                                <MessageSquareMore className="h-5 w-5 text-blue-600" />
                                <h4 className="text-base font-semibold text-gray-900">Conversation</h4>
                            </div>
                            <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                                        Y
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
                                                Y
                                            </div>
                                        )}
                                        <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                                            reply.is_staff_reply
                                                ? 'border border-blue-100 bg-blue-50 text-blue-950'
                                                : 'border border-gray-200 bg-white text-gray-800'
                                        }`}>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {reply.is_staff_reply ? 'Support Team' : 'You'}
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
                                <div className="mb-3 flex items-center gap-2">
                                    {selectedTicket.status === 'resolved' ? (
                                        <TimerReset className="h-5 w-5 text-amber-600" />
                                    ) : (
                                        <Clock3 className="h-5 w-5 text-blue-600" />
                                    )}
                                    <h4 className="text-base font-semibold text-gray-900">Send Follow-up</h4>
                                </div>
                                {selectedTicket.status === 'resolved' && (
                                    <p className="mb-4 text-sm text-amber-700">
                                        Sending a follow-up will reopen this inquiry for the support team.
                                    </p>
                                )}
                                <form onSubmit={handleReplySubmit} className="space-y-3">
                                    <textarea
                                        rows={4}
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        placeholder="Add more context, confirm the fix, or ask a follow-up question."
                                        className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
                                        <p className="mt-2 text-xs text-gray-500">Optional follow-up files, up to 3 attachments.</p>
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
                                            {replying ? 'Sending...' : 'Send Follow-up'}
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
