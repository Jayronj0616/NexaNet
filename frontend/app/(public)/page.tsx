import React from 'react';
import Link from 'next/link';
import { Wifi, Zap, MonitorPlay, Film, ArrowRight, Play, Star } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="relative overflow-hidden bg-white text-gray-900 selection:bg-rose-200 selection:text-rose-900">
            {/* HERO SECTION */}
            <div className="relative pt-24 pb-20 sm:pt-32 sm:pb-32 overflow-hidden bg-slate-50">
                {/* Background Decor */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-rose-200 to-indigo-300 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 mt-10">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-200 text-rose-600 text-sm font-semibold mb-6 uppercase tracking-wider shadow-sm">
                            <Star className="w-4 h-4 fill-rose-500 text-rose-500" /> Premium Bundles Now Available
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 text-gray-900">
                            Fiber Fast. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">
                                Cable Perfect.
                            </span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                            NexaNet brings you blazing fast gigabit fiber internet bundled with premium cable TV and your favorite streaming apps. Stream Netflix, game, and work without limits.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link href="/apply" className="w-full sm:w-auto rounded-full bg-rose-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 hover:shadow-rose-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                Upgrade Now <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/plans" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-base font-bold text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 flex items-center justify-center hover:-translate-y-1">
                                View Bundles
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-lg lg:max-w-none relative mt-10 lg:mt-0">
                        <div className="relative rounded-2xl bg-white border border-gray-100 p-2 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-pointer group-hover:shadow-rose-100 transition-all duration-500">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80')] bg-cover bg-center rounded-xl overflow-hidden transform group-hover:scale-105 transition-transform duration-700"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent rounded-xl"></div>
                            <button className="z-10 w-20 h-20 rounded-full bg-white/90 flex items-center justify-center text-rose-600 pl-1 shadow-xl group-hover:bg-white group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                                <Play className="w-8 h-8 fill-rose-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PARTNER LOGOS MARQUEE */}
            <div className="relative overflow-hidden bg-white py-10 border-y border-gray-100">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2].map((group) => (
                        <div key={group} className="flex items-center mx-10 gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <span className="text-3xl font-black tracking-tighter text-red-600 uppercase">Netflix</span>
                            <span className="text-3xl font-black tracking-tighter text-indigo-700 uppercase">HBO Go</span>
                            <span className="text-3xl font-bold tracking-tighter text-blue-600">Prime Video</span>
                            <span className="text-3xl font-black tracking-tighter text-sky-600">Disney+</span>
                            <span className="text-3xl font-extrabold tracking-tighter text-rose-600 uppercase">Lionsgate</span>
                            <span className="text-3xl font-bold tracking-tighter text-gray-800">Apple TV+</span>
                            <span className="text-3xl font-black tracking-tighter text-green-600 uppercase">Spotify</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SCROLLING PROMOTIONAL BANNERS / ADS TRAY */}
            <div className="py-20 bg-slate-50 overflow-hidden relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-10">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
                        Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Entertainment Bundles</span>
                    </h2>
                    <p className="mt-4 text-gray-600 text-lg">Swipe to discover our limited time offers and gigabit fiber upgrades.</p>
                </div>

                {/* Horizontal Scroll Snap Container */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 lg:px-8 pb-10 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    
                    {/* Promo Card 1: Netflix Bundle */}
                    <div className="snap-center shrink-0 w-[85vw] sm:w-[400px] rounded-3xl bg-white border border-gray-100 overflow-hidden relative flex flex-col transition-transform hover:-translate-y-2 duration-300 shadow-xl shadow-gray-200/50 group">
                        <div className="h-48 bg-[url('https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80')] bg-cover bg-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
                            <div className="absolute bottom-4 left-6">
                                <span className="text-3xl font-black text-red-500 uppercase tracking-tighter block mb-1">Netflix</span>
                                <h3 className="text-white font-bold text-xl">On Us for 12 Months</h3>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col grow">
                            <p className="text-gray-600 mb-6">Upgrade to Premium 100Mbps or higher and get a complimentary Netflix standard subscription.</p>
                            <Link href="/plans" className="mt-auto inline-flex items-center font-bold text-red-600 hover:text-red-500">
                                Grab Offer <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Promo Card 2: Cable Integration */}
                    <div className="snap-center shrink-0 w-[85vw] sm:w-[400px] rounded-3xl bg-white border border-gray-100 overflow-hidden relative flex flex-col transition-transform hover:-translate-y-2 duration-300 shadow-xl shadow-gray-200/50 group">
                        <div className="h-48 bg-[url('https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80')] bg-cover bg-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent transition-opacity group-hover:opacity-90"></div>
                            <div className="absolute bottom-4 left-6">
                                <span className="text-3xl font-black text-blue-400 tracking-tighter block mb-1">NexaTV+</span>
                                <h3 className="text-white font-bold text-xl">150+ HD Channels</h3>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col grow">
                            <p className="text-gray-600 mb-6">Enjoy live sports, breaking news, and primetime entertainment with our uncompressed 4K Cable TV add-on.</p>
                            <Link href="/plans" className="mt-auto inline-flex items-center font-bold text-blue-600 hover:text-blue-500">
                                View Channel Lineup <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Promo Card 3: Mesh WiFi */}
                    <div className="snap-center shrink-0 w-[85vw] sm:w-[400px] rounded-3xl bg-white border border-gray-100 overflow-hidden relative flex flex-col transition-transform hover:-translate-y-2 duration-300 shadow-xl shadow-gray-200/50 group">
                        <div className="h-48 bg-[url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80')] bg-cover bg-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/40 to-transparent transition-opacity group-hover:opacity-90"></div>
                            <div className="absolute bottom-4 left-6">
                                <span className="text-3xl font-black text-emerald-400 tracking-tighter block mb-1">Whole Home</span>
                                <h3 className="text-white font-bold text-xl">Free Mesh WiFi 6</h3>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col grow">
                            <p className="text-gray-600 mb-6">Eliminate dead zones. Get a free Tri-band Mesh WiFi router setup with any Business or Gigabit plan.</p>
                            <Link href="/plans" className="mt-auto inline-flex items-center font-bold text-emerald-600 hover:text-emerald-500">
                                Learn More <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                     {/* Promo Card 4: Gaming */}
                     <div className="snap-center shrink-0 w-[85vw] sm:w-[400px] rounded-3xl bg-white border border-gray-100 overflow-hidden relative flex flex-col transition-transform hover:-translate-y-2 duration-300 shadow-xl shadow-gray-200/50 group">
                        <div className="h-48 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80')] bg-cover bg-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent transition-opacity group-hover:opacity-90"></div>
                            <div className="absolute bottom-4 left-6">
                                <span className="text-3xl font-black text-purple-400 tracking-tighter block mb-1">Zero Ping</span>
                                <h3 className="text-white font-bold text-xl">Prioritized Routing</h3>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col grow">
                            <p className="text-gray-600 mb-6">Experience sub-10ms latency to regional gaming servers. Perfect for competitive esports and streaming.</p>
                            <Link href="/apply" className="mt-auto inline-flex items-center font-bold text-purple-600 hover:text-purple-500">
                                Get Connected <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="py-24 sm:py-32 bg-white border-t border-gray-100 relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-rose-600 uppercase tracking-widest">The NexaNet Edge</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Everything you need in one connection
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We deliver uncompromising internet speeds alongside world-class entertainment offerings, giving you the ultimate digital hub.
                        </p>
                    </div>
                    
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
                            {[
                                {
                                    name: 'Symmetrical Gigabit Fiber',
                                    description: 'Equal upload and download speeds. Perfect for content creators and heavy downloaders.',
                                    icon: Zap,
                                },
                                {
                                    name: 'Cinematic Cable TV',
                                    description: 'Seamless integration with HD and 4K uncompressed cable channels direct to your screen.',
                                    icon: MonitorPlay,
                                },
                                {
                                    name: 'Streaming Subscriptions',
                                    description: 'Consolidate your bills. We bundle top services like Netflix and HBO directly into your plan.',
                                    icon: Film,
                                },
                                {
                                    name: 'Uncapped & Unthrottled',
                                    description: 'Truly unlimited data. No slowing down at the end of the month, no surprise overage fees.',
                                    icon: Wifi,
                                },
                            ].map((feature) => (
                                <div key={feature.name} className="flex flex-col text-left bg-slate-50 p-8 rounded-3xl border border-gray-100 hover:border-rose-200 transition-colors shadow-sm hover:shadow-md">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-md text-white">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <dt className="text-xl font-bold leading-7 text-gray-900">
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-10">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8 relative z-10 bg-rose-600 rounded-3xl mx-4 sm:mx-8 lg:mx-16 mb-16 shadow-2xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Ready for the ultimate upgrade?
                            <br />
                            Check your area's network readiness.
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-xl leading-8 text-rose-100">
                            Join thousands of satisfied customers who have revolutionized their digital lifestyle with NexaNet Fiber and Cable.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/check-availability" className="rounded-full bg-white px-8 py-4 text-base font-bold text-rose-600 shadow-xl hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all transform hover:-translate-y-1">
                                Check Coverage Now
                            </Link>
                            <Link href="/plans" className="rounded-full bg-rose-700 px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-rose-800 border border-rose-500 transition-all transform hover:-translate-y-1">
                                Explore Bundles
                            </Link>
                        </div>
                    </div>
                    {/* Decorative background for CTA circle */}
                    <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                </div>
            </div>
            
            {/* Global style for hiding scrollbar added purely inline logic since JSX style doesn't cover webkit hide natively as easily without Tailwind plugin */}
            <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}} />
        </div>
    );
}
