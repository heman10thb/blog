import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// This bypasses security rules and has full access to Firestore

function initializeFirebaseAdmin() {
    console.log('[Firebase Admin] Starting initialization...');

    const apps = getApps();

    if (apps.length > 0) {
        console.log('[Firebase Admin] Already initialized, reusing existing app');
        return apps[0];
    }

    // Use individual environment variables (recommended for hosting platforms)
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    console.log('[Firebase Admin] Checking individual env vars:');
    console.log('  - FIREBASE_PROJECT_ID:', projectId ? '✓ Set' : '✗ Missing');
    console.log('  - FIREBASE_CLIENT_EMAIL:', clientEmail ? '✓ Set' : '✗ Missing');
    console.log('  - FIREBASE_PRIVATE_KEY:', privateKey ? `✓ Set (${privateKey.length} chars)` : '✗ Missing');

    if (projectId && clientEmail && privateKey) {
        try {
            console.log('[Firebase Admin] Initializing with individual credentials...');
            const app = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                projectId,
            });
            console.log('[Firebase Admin] ✓ Successfully initialized with individual credentials');
            return app;
        } catch (error) {
            console.error('[Firebase Admin] ✗ Error initializing with individual vars:', error.message);
            return null;
        }
    }

    // Fallback: Check if service account JSON is provided (legacy support)
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log('[Firebase Admin] Checking FIREBASE_SERVICE_ACCOUNT_KEY:', serviceAccount ? '✓ Set' : '✗ Missing');

    if (serviceAccount) {
        try {
            console.log('[Firebase Admin] Initializing with JSON credentials...');
            const credentials = JSON.parse(serviceAccount);
            const app = initializeApp({
                credential: cert(credentials),
                projectId: credentials.project_id,
            });
            console.log('[Firebase Admin] ✓ Successfully initialized with JSON credentials');
            return app;
        } catch (error) {
            console.error('[Firebase Admin] ✗ Error parsing service account JSON:', error.message);
            return null;
        }
    }

    // During build time or when credentials are missing, return null
    console.log('[Firebase Admin] ✗ No credentials found, returning null');
    return null;
}

let adminApp;
try {
    adminApp = initializeFirebaseAdmin();
} catch (error) {
    console.error('[Firebase Admin] ✗ Failed to initialize:', error.message);
    adminApp = null;
}

// Export Firestore Admin instance
export const adminDb = adminApp ? getFirestore(adminApp) : null;
console.log('[Firebase Admin] adminDb available:', adminDb ? 'Yes' : 'No');

export default adminApp;


