import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// API Keys for authentication (set in .env.local)
const EXTERNAL_API_KEY = process.env.ADMIN_API_KEY;
const INTERNAL_API_KEY = process.env.ADMIN_INTERNAL_API_KEY || 'internal_8f7e9d6c5b4a3210fedcba9876543210abcdef1234567890';

// Helper to verify API key (accepts both external and internal keys)
function verifyApiKey(request) {
    const authHeader = request.headers.get('authorization');
    const apiKey = request.headers.get('x-api-key');

    const providedKey = authHeader?.replace('Bearer ', '') || apiKey;

    if (!providedKey) {
        return { valid: false, error: 'API key required' };
    }

    const isValidExternal = EXTERNAL_API_KEY && providedKey === EXTERNAL_API_KEY;
    const isValidInternal = providedKey === INTERNAL_API_KEY;

    if (!isValidExternal && !isValidInternal) {
        return { valid: false, error: 'Invalid API key' };
    }

    return { valid: true, keyType: isValidExternal ? 'external' : 'internal' };
}

// GET - Get single tutorial by ID
export async function GET(request, { params }) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json(
            { error: 'Firebase Admin not configured' },
            { status: 500 }
        );
    }

    try {
        const { id } = await params;
        const doc = await adminDb.collection('tutorials').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
        }

        return NextResponse.json({
            tutorial: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Error fetching tutorial:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update tutorial
export async function PUT(request, { params }) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json(
            { error: 'Firebase Admin not configured' },
            { status: 500 }
        );
    }

    try {
        const { id } = await params;
        const body = await request.json();

        const docRef = adminDb.collection('tutorials').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
        }

        // Prepare update data
        const updateData = {
            ...body,
            updatedAt: FieldValue.serverTimestamp()
        };

        // If status changes to published, set publishedAt
        if (body.status === 'published' && doc.data().status !== 'published') {
            updateData.publishedAt = FieldValue.serverTimestamp();
        }

        // Remove id from update data if present
        delete updateData.id;

        await docRef.update(updateData);

        return NextResponse.json({
            success: true,
            message: 'Tutorial updated successfully',
            id
        });
    } catch (error) {
        console.error('Error updating tutorial:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete tutorial
export async function DELETE(request, { params }) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json(
            { error: 'Firebase Admin not configured' },
            { status: 500 }
        );
    }

    try {
        const { id } = await params;
        const docRef = adminDb.collection('tutorials').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({
            success: true,
            message: 'Tutorial deleted successfully',
            id
        });
    } catch (error) {
        console.error('Error deleting tutorial:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
