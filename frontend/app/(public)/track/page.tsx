'use client';

import axios from 'axios';
import React, { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { ServiceApplication } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { ApplicationTimeline } from '@/components/application/ApplicationTimeline';

function TrackForm() {
    const searchParams = useSearchParams();
    const initialSearchTerm = searchParams.get('reference') || searchParams.get('email') || '';
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ServiceApplication | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialSearchTerm) {
            void fetchTrackingResult(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const fetchTrackingResult = async (term: string) => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const isEmail = term.includes('@');
            const param = isEmail ? `email=${encodeURIComponent(term)}` : `reference=${encodeURIComponent(term)}`;

            const response = await api.get(`/public/applications/track?${param}`);
            const payload = response.data.data || response.data;
            const application = Array.isArray(payload) ? payload[0] : payload;

            setResult(application ?? null);
        } catch (err: unknown) {
            console.error('Track failed', err);

            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Application not found. Please check your reference number or email.');
            } else {
                setError('Application not found. Please check your reference number or email.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;

        await fetchTrackingResult(searchTerm);
    };

    return (
        <div className="bg-white px-6 py-8 shadow-xl sm:rounded-xl sm:px-12">
            <form onSubmit={handleSearch} className="space-y-6">
                <div>
                    <label htmlFor="search" className="block text-sm font-medium leading-6 text-gray-900">
                        Reference Number or Email Address
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm">
                        <div className="relative flex flex-grow items-stretch focus-within:z-10">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="block w-full rounded-none rounded-l-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="APP-12345 or your@email.com"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchTerm}
                            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5 text-gray-400" /> : 'Track'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-8">
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200 animate-in fade-in">
                        <div className="px-4 py-6 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                            <div>
                                <h3 className="text-base font-semibold leading-7 text-gray-900">Application Status</h3>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Reference: {result.reference_number}</p>
                            </div>
                            <StatusBadge status={result.status} className="text-sm px-3 py-1.5" />
                        </div>
                        <div className="border-b border-gray-200 bg-blue-50/60 px-4 py-5 sm:px-6">
                            <div className="grid gap-4 md:grid-cols-[1.2fr_2fr]">
                                <div className="rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Current Stage</p>
                                    <h4 className="mt-2 text-xl font-semibold text-gray-900">{result.status_label || 'Application Update'}</h4>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">{result.status_description}</p>
                                </div>
                                <div className="rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Timeline</p>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                        Follow each stage of your application, from processing to installation and activation.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100">
                            <dl className="divide-y divide-gray-100">
                                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-900">Applicant Name</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{result.first_name} {result.last_name}</dd>
                                </div>
                                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                                    <dt className="text-sm font-medium text-gray-900">Installation Address</dt>
                                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{result.address}, {result.barangay}, {result.city}</dd>
                                </div>
                                {result.plan && (
                                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-900">Selected Plan</dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{result.plan.name} (Up to {result.plan.speed_mbps} Mbps)</dd>
                                    </div>
                                )}
                                {result.technician_name && (
                                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-blue-50">
                                        <dt className="text-sm font-medium text-blue-900">Installation Schedule</dt>
                                        <dd className="mt-1 text-sm leading-6 text-blue-800 sm:col-span-2 sm:mt-0">
                                            {result.installation_date ? formatDate(result.installation_date) : 'Pending'} by <strong>{result.technician_name}</strong>
                                        </dd>
                                    </div>
                                )}
                                {result.rejection_reason && (
                                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-red-50">
                                        <dt className="text-sm font-medium text-red-900">Reason for Rejection</dt>
                                        <dd className="mt-1 text-sm leading-6 text-red-800 sm:col-span-2 sm:mt-0 cursor-not-allowed">
                                            {result.rejection_reason}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                        {result.timeline && result.timeline.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-4 py-6 sm:px-6">
                                <h4 className="text-base font-semibold text-gray-900">Application Timeline</h4>
                                <p className="mt-1 text-sm text-gray-600">You can use this view to see whether your application is still pending, already processed, or ready for installation.</p>
                                <div className="mt-5">
                                    <ApplicationTimeline items={result.timeline} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackPage() {
    return (
        <div className="bg-gray-50 py-24 sm:py-32 min-h-[calc(100vh-4rem)]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center pb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Track Your Application</h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        Check the real-time status of your new internet installation.
                    </p>
                </div>

                <div className="mx-auto max-w-2xl">
                    <Suspense fallback={<FullPageLoader />}>
                        <TrackForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
