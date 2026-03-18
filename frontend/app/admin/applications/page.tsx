'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { ServiceApplication } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/ConfirmDialog';
import { ApplicationTimeline } from '@/components/application/ApplicationTimeline';
import { ApplicationHistoryFeed } from '@/components/application/ApplicationHistoryFeed';

const statusFilters = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Processed' },
    { value: 'installation_scheduled', label: 'For Installation' },
    { value: 'installation_complete', label: 'Installation Complete' },
    { value: 'activated', label: 'Activated' },
    { value: 'rejected', label: 'Rejected' },
] as const;

function normalizeNotesValue(value?: string | null): string {
    return (value ?? '').trim();
}

export default function AdminApplications() {
    const [applications, setApplications] = useState<ServiceApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]['value']>('all');

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);

    const [isScheduling, setIsScheduling] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [technicianName, setTechnicianName] = useState('');
    const [installDate, setInstallDate] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [notesDraft, setNotesDraft] = useState('');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/applications');
            setApplications(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to load applications', error);
            toast('Failed to load applications', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchApplications();
    }, []);

    useEffect(() => {
        setNotesDraft(selectedApp?.notes || '');
    }, [selectedApp?.id, selectedApp?.notes]);

    const fetchApplicationDetails = async (applicationId: number) => {
        setDetailsLoading(true);
        try {
            const response = await api.get(`/admin/applications/${applicationId}`);
            setSelectedApp(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to load application details', error);
            toast('Failed to load application details', 'error');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleView = async (app: ServiceApplication) => {
        setSelectedApp(app);
        setIsScheduling(false);
        setIsRejecting(false);
        setTechnicianName('');
        setInstallDate('');
        setRejectReason('');
        setIsViewModalOpen(true);
        await fetchApplicationDetails(app.id);
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedApp(null);
        setIsScheduling(false);
        setIsRejecting(false);
        setTechnicianName('');
        setInstallDate('');
        setRejectReason('');
        setNotesDraft('');
    };

    const handleAction = async (actionPath: string, payload: Record<string, unknown> = {}, successMessage: string) => {
        if (!selectedApp) return;

        try {
            setActionLoading(true);
            await api.patch(`/admin/applications/${selectedApp.id}/${actionPath}`, payload);
            toast(successMessage, 'success');
            await Promise.all([
                fetchApplications(),
                fetchApplicationDetails(selectedApp.id),
            ]);
            setIsScheduling(false);
            setIsRejecting(false);
            setRejectReason('');
        } catch (error: any) {
            console.error(`Action ${actionPath} failed`, error);
            toast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const saveNotes = async () => {
        if (!selectedApp) return;

        try {
            setSavingNotes(true);
            const response = await api.patch(`/admin/applications/${selectedApp.id}/notes`, {
                notes: normalizeNotesValue(notesDraft) || null,
            });
            const application = response.data.application || response.data.data || response.data;
            setSelectedApp(application);
            await fetchApplications();
            toast(response.data.message || 'Application notes updated.', 'success');
        } catch (error: any) {
            console.error('Failed to update application notes', error);
            toast(error.response?.data?.message || 'Failed to update application notes', 'error');
        } finally {
            setSavingNotes(false);
        }
    };

    const renderActionButtons = () => {
        if (!selectedApp) return null;

        switch (selectedApp.status) {
            case 'pending':
                return isRejecting ? (
                    <div className="w-full rounded-md border border-red-100 bg-red-50 p-4">
                        <h4 className="text-sm font-medium text-red-900">Reject Application</h4>
                        <p className="mt-1 text-xs text-red-700">Share the actual reason so the applicant receives a clear update.</p>
                        <textarea
                            rows={4}
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            className="mt-3 block w-full rounded-md border-0 text-sm text-gray-900 ring-1 ring-inset ring-red-200 focus:ring-2 focus:ring-inset focus:ring-red-500"
                            placeholder="Enter the rejection reason shown to the applicant..."
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                disabled={actionLoading}
                                onClick={() => {
                                    setIsRejecting(false);
                                    setRejectReason('');
                                }}
                                className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={actionLoading || !rejectReason.trim()}
                                onClick={() => void handleAction('reject', { reason: rejectReason.trim() }, 'Application rejected')}
                                className="rounded bg-red-600 px-3 py-1.5 text-xs text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button
                            disabled={actionLoading}
                            onClick={() => setIsRejecting(true)}
                            className="rounded bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Reject
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={() => void handleAction('approve', {}, 'Application approved')}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Approve
                        </button>
                    </div>
                );
            case 'approved':
                return isScheduling ? (
                    <div className="w-full rounded-md border bg-gray-50 p-4">
                        <h4 className="text-sm font-medium text-gray-900">Schedule Installation</h4>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <input
                                type="text"
                                placeholder="Technician Name"
                                className="rounded border-gray-300 text-sm"
                                value={technicianName}
                                onChange={(event) => setTechnicianName(event.target.value)}
                            />
                            <input
                                type="date"
                                className="rounded border-gray-300 text-sm"
                                value={installDate}
                                onChange={(event) => setInstallDate(event.target.value)}
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                disabled={actionLoading}
                                onClick={() => setIsScheduling(false)}
                                className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleAction('schedule', { technician_name: technicianName, installation_date: installDate }, 'Installation scheduled')}
                                disabled={actionLoading || !technicianName || !installDate}
                                className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirm Schedule
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        disabled={actionLoading}
                        onClick={() => setIsScheduling(true)}
                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Schedule Installation
                    </button>
                );
            case 'installation_scheduled':
                return (
                    <button
                        disabled={actionLoading}
                        onClick={() => void handleAction('complete-installation', {}, 'Installation marked as complete')}
                        className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Mark Installation Complete
                    </button>
                );
            case 'installation_complete':
                return (
                    <button
                        disabled={actionLoading}
                        onClick={() => void handleAction('activate', {}, 'Account activated successfully')}
                        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Activate & Create Account
                    </button>
                );
            case 'activated':
            case 'active':
            case 'rejected':
            default:
                return (
                    <span className="text-sm italic text-gray-500">No actions available for this status.</span>
                );
        }
    };

    const statusCounts = applications.reduce<Record<string, number>>((counts, app) => {
        counts.all = (counts.all || 0) + 1;
        counts[app.status] = (counts[app.status] || 0) + 1;
        return counts;
    }, {});

    const filteredApplications = applications.filter((application) => {
        const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
        const normalizedQuery = searchTerm.trim().toLowerCase();
        const searchFields = [
            application.reference_number,
            application.first_name,
            application.last_name,
            application.email,
            application.address,
            application.barangay,
            application.city,
            application.province,
            application.plan?.name,
            application.status_label,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return matchesStatus && (normalizedQuery === '' || searchFields.includes(normalizedQuery));
    });

    const notesChanged = normalizeNotesValue(notesDraft) !== normalizeNotesValue(selectedApp?.notes);

    const columns = [
        {
            header: 'Ref / Applicant',
            accessor: (row: ServiceApplication) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{row.reference_number}</span>
                    <span className="text-xs text-gray-500">{row.first_name} {row.last_name}</span>
                    <span className="text-xs text-gray-400">{row.email}</span>
                </div>
            ),
        },
        {
            header: 'Area',
            accessor: (row: ServiceApplication) => (
                <div className="flex flex-col">
                    <span className="text-gray-900">{row.barangay}, {row.city}</span>
                    <span className="text-xs text-gray-500">{row.province}</span>
                </div>
            ),
        },
        {
            header: 'Stage',
            accessor: (row: ServiceApplication) => (
                <div className="flex flex-col gap-1">
                    <StatusBadge status={row.status} />
                    <span className="text-xs text-gray-500">{row.status_label || 'Application Update'}</span>
                </div>
            ),
        },
        {
            header: 'Plan',
            accessor: (row: ServiceApplication) => row.plan?.name || 'Unassigned',
        },
        {
            header: 'Date Applied',
            accessor: (row: ServiceApplication) => formatDate(row.created_at),
        },
        {
            header: 'Action',
            accessor: (row: ServiceApplication) => (
                <button
                    onClick={() => { void handleView(row); }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                >
                    Manage
                </button>
            ),
        },
    ];

    if (loading && applications.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Service Applications"
                description="Process new internet applications from submission to activation."
            />

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Search by reference, applicant, email, or area..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilters)[number]['value'])}
                            className="rounded-md border-0 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                        >
                            {statusFilters.map((filter) => (
                                <option key={filter.value} value={filter.value}>
                                    {filter.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Reset Filters
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{filteredApplications.length}</span> of {applications.length} applications
                    </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {statusFilters.map((filter) => {
                        const isActive = statusFilter === filter.value;
                        const count = statusCounts[filter.value] || 0;

                        return (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <span>{filter.label}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <DataTable
                data={filteredApplications}
                columns={columns}
                keyExtractor={(row) => row.id.toString()}
                searchable={false}
                itemsPerPage={8}
            />

            <Modal isOpen={isViewModalOpen} onClose={handleCloseModal} title="Process Application" maxWidth="4xl">
                {selectedApp && (
                    <div className="space-y-6">
                        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-xl border bg-gray-50 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Current Status</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <StatusBadge status={selectedApp.status} className="px-3 py-1 text-base" />
                                    <span className="text-sm font-medium text-gray-700">{selectedApp.status_label || 'Application Update'}</span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-gray-600">
                                    {selectedApp.status_description || 'Track the application as it moves from review to installation and activation.'}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-white p-4 text-right">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Reference No.</p>
                                <p className="mt-1 font-mono font-bold text-gray-900">{selectedApp.reference_number}</p>
                                <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">Applied On</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(selectedApp.created_at)}</p>
                            </div>
                        </div>

                        {detailsLoading ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
                                Loading full application details...
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                                    <div className="space-y-6">
                                        <div className="grid gap-6 rounded-xl border bg-white p-5 md:grid-cols-2">
                                            <div>
                                                <h4 className="mb-3 border-b pb-2 text-sm font-semibold text-gray-900">Applicant Details</h4>
                                                <dl className="space-y-2 text-sm">
                                                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Name</dt><dd className="text-right font-medium text-gray-900">{selectedApp.first_name} {selectedApp.last_name}</dd></div>
                                                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Email</dt><dd className="break-all text-right text-gray-900">{selectedApp.email}</dd></div>
                                                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Phone</dt><dd className="text-right text-gray-900">{selectedApp.phone}</dd></div>
                                                </dl>
                                            </div>

                                            <div>
                                                <h4 className="mb-3 border-b pb-2 text-sm font-semibold text-gray-900">Service Request</h4>
                                                <dl className="space-y-2 text-sm">
                                                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Plan</dt><dd className="text-right font-medium text-gray-900">{selectedApp.plan?.name}</dd></div>
                                                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Location</dt><dd className="text-right text-gray-900">{selectedApp.address}<br />{selectedApp.barangay}, {selectedApp.city}</dd></div>
                                                </dl>
                                            </div>
                                        </div>

                                        {selectedApp.technician_name && (
                                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                                <h4 className="text-sm font-semibold text-blue-900">Installation Schedule</h4>
                                                <p className="mt-2 text-sm leading-6 text-blue-800">
                                                    Assigned to <strong>{selectedApp.technician_name}</strong> on {selectedApp.installation_date ? formatDate(selectedApp.installation_date) : 'Pending'}.
                                                </p>
                                            </div>
                                        )}

                                        {selectedApp.rejection_reason && (
                                            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                                <h4 className="text-sm font-semibold text-red-900">Rejection Reason</h4>
                                                <p className="mt-2 text-sm leading-6 text-red-800">{selectedApp.rejection_reason}</p>
                                            </div>
                                        )}

                                        <div className="rounded-xl border bg-white p-5">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900">Internal Notes</h4>
                                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                                        Visible to admins only. Use this for review context, installation reminders, or follow-up details.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => void saveNotes()}
                                                    disabled={savingNotes || !notesChanged}
                                                    className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {savingNotes ? 'Saving...' : 'Save Notes'}
                                                </button>
                                            </div>
                                            <textarea
                                                rows={6}
                                                value={notesDraft}
                                                onChange={(event) => setNotesDraft(event.target.value)}
                                                className="mt-4 block w-full rounded-lg border-0 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                                                placeholder="Add admin-only notes for this application..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="rounded-xl border bg-gray-50 p-5">
                                            <h4 className="text-sm font-semibold text-gray-900">Application Timeline</h4>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Follow the application from submission through review, installation, and activation.
                                            </p>
                                            <div className="mt-5">
                                                <ApplicationTimeline items={selectedApp.timeline || []} />
                                            </div>
                                        </div>

                                        <div className="rounded-xl border bg-gray-50 p-5">
                                            <h4 className="text-sm font-semibold text-gray-900">Activity History</h4>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Every workflow action and note update is recorded here for staff reference.
                                            </p>
                                            <div className="mt-5">
                                                <ApplicationHistoryFeed items={selectedApp.activities || []} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-gray-200 pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm text-gray-500">
                                            {actionLoading ? 'Updating application workflow...' : 'Move the application to the next stage when the current step is complete.'}
                                        </p>
                                        <div className="flex justify-end">
                                            {renderActionButtons()}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
