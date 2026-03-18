import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/customer') || pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/customer/:path*', '/admin/:path*', '/superadmin/:path*'],
};
