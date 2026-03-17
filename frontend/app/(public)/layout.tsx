import React from 'react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center">
                                <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                                    <span className="text-blue-600">Nexa</span>Net
                                </span>
                            </Link>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
                            <Link href="/plans" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Plans</Link>
                            <Link href="/check-availability" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Coverage</Link>
                            <Link href="/track" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Track Application</Link>
                        </nav>
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Sign In</Link>
                            <Link href="/apply" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                Get Connected
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-gray-900 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <span className="text-2xl font-extrabold tracking-tight text-white mb-4 block">
                                <span className="text-blue-500">Nexa</span>Net
                            </span>
                            <p className="text-gray-400 text-sm max-w-sm">
                                Empowering homes and businesses with blazing fast, reliable, and unconditional internet connectivity. Experience the future of web with us.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link href="/plans" className="text-gray-400 hover:text-white text-sm">Our Plans</Link></li>
                                <li><Link href="/check-availability" className="text-gray-400 hover:text-white text-sm">Service Area</Link></li>
                                <li><Link href="/apply" className="text-gray-400 hover:text-white text-sm">Apply Now</Link></li>
                                <li><Link href="/track" className="text-gray-400 hover:text-white text-sm">Track Application</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><Link href="/login" className="text-gray-400 hover:text-white text-sm">Customer Portal</Link></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Contact Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} NexaNet. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
