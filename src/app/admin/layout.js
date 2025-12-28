'use client';

import { AuthProvider } from '@/contexts/AuthContext';

// Note: For noindex, we'll use a head tag in the login page directly
// since this is a client component layout

export default function AdminLayout({ children }) {
    return (
        <AuthProvider>
            {/* Inject noindex for all admin pages */}
            <head>
                <meta name="robots" content="noindex, nofollow" />
            </head>
            {children}
        </AuthProvider>
    );
}
