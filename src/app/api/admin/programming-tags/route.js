import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// API Keys for authentication
const EXTERNAL_API_KEY = process.env.ADMIN_API_KEY;
const INTERNAL_API_KEY = process.env.ADMIN_INTERNAL_API_KEY || 'internal_8f7e9d6c5b4a3210fedcba9876543210abcdef1234567890';

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

    return { valid: true };
}

// GET - List all programming tags
export async function GET(request) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    try {
        const snapshot = await adminDb.collection('programmingTags').orderBy('name', 'asc').get();
        const tags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ tags, count: tags.length });
    } catch (error) {
        console.error('Error fetching programming tags:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new programming tag
export async function POST(request) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim();

        const tagData = {
            name: body.name,
            slug,
            icon: body.icon || '💻',
            color: body.color || '#10b981',
            createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await adminDb.collection('programmingTags').add(tagData);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: 'Programming tag created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating programming tag:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update programming tag by ID
export async function PUT(request) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
        }

        const body = await request.json();

        const updateData = {};
        if (body.name) updateData.name = body.name;
        if (body.slug) updateData.slug = body.slug;
        if (body.icon) updateData.icon = body.icon;
        if (body.color) updateData.color = body.color;

        await adminDb.collection('programmingTags').doc(id).update(updateData);

        return NextResponse.json({
            success: true,
            message: 'Programming tag updated successfully'
        });

    } catch (error) {
        console.error('Error updating programming tag:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete programming tag by ID
export async function DELETE(request) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
        }

        await adminDb.collection('programmingTags').doc(id).delete();

        return NextResponse.json({
            success: true,
            message: 'Programming tag deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting programming tag:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
