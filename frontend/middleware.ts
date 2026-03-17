import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // We cannot read localStorage in middleware, but we can check checking standard auth cookies if using them.
    // However, since we are using localStorage, the real check happens on the client.
    // This middleware at least prevents initial loading flash if using standard cookies. 
    // We will do a generic client-side check in the Layouts for role-based redirects.

    return NextResponse.next();
}

export const config = {
    matcher: ['/customer/:path*', '/admin/:path*', '/superadmin/:path*'],
};
