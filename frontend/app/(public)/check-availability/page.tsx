'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { MapPin, Search, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/ConfirmDialog';

interface CheckResult {
    is_serviceable: boolean;
    barangay: string;
    city: string;
    message?: string;
}

export default function CheckAvailabilityPage() {
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/public/service-areas/check', { city, barangay });
            setResult(response.data);
            
            if (response.data.is_serviceable) {
                toast('Great news! We cover your area.', 'success');
            } else {
                toast('Sorry, we do not cover your area yet.', 'error');
            }
        } catch (error: any) {
            console.error('Check failed', error);
            // The API returns 404 for unserviceable areas based on the prompt implicitly or explicitly, handle both
            if (error.response?.status === 404 || error.response?.data?.is_serviceable === false) {
                 setResult({
                    is_serviceable: false,
                    barangay,
                    city,
                    message: "Sorry, this area is not currently serviceable."
                 });
                 toast('Sorry, we do not cover your area yet.', 'error');
            } else {
                toast('Error checking availability. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 py-24 sm:py-32 min-h-screen">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Check Service Availability</h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        Enter your location details below to see if NexaNet's high-speed fiber internet is available in your area.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-xl sm:mt-20">
                    <div className="bg-white px-6 py-8 shadow-xl sm:rounded-xl sm:px-12">
                        <form onSubmit={handleCheck} className="space-y-6">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                                    City / Municipality
                                </label>
                                <div className="mt-2 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        id="city"
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="e.g. Quezon City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="barangay" className="block text-sm font-medium leading-6 text-gray-900">
                                    Barangay
                                </label>
                                <div className="mt-2 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        id="barangay"
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="e.g. Bagong Pag-asa"
                                        value={barangay}
                                        onChange={(e) => setBarangay(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !city || !barangay}
                                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300 transition-colors"
                            >
                                {loading ? 'Checking...' : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        Check Availability
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Results section */}
                        {result && (
                            <div className={`mt-8 rounded-lg p-6 border ${result.is_serviceable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {result.is_serviceable ? (
                                            <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden="true" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className={`text-lg font-medium ${result.is_serviceable ? 'text-green-800' : 'text-red-800'}`}>
                                            {result.is_serviceable ? 'Great news! We cover your area.' : 'Not available yet.'}
                                        </h3>
                                        <div className={`mt-2 text-sm ${result.is_serviceable ? 'text-green-700' : 'text-red-700'}`}>
                                            <p>
                                                {result.is_serviceable 
                                                    ? `NexaNet fiber internet is available in ${result.barangay}, ${result.city}. You can proceed with your application.` 
                                                    : `We're continuously expanding our network, but we don't currently serve ${result.barangay}, ${result.city}.`}
                                            </p>
                                        </div>
                                        {result.is_serviceable && (
                                            <div className="mt-4">
                                                <Link
                                                    href={`/apply?city=${encodeURIComponent(result.city)}&barangay=${encodeURIComponent(result.barangay)}`}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                                >
                                                    Apply for Service Now
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
