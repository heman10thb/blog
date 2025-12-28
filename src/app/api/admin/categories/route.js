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

// GET - List all categories
export async function GET(request) {
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
        const snapshot = await adminDb
            .collection('categories')
            .orderBy('order', 'asc')
            .get();

        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ categories, count: categories.length });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new category
export async function POST(request) {
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
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.slug) {
            return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        // Get current max order
        const snapshot = await adminDb.collection('categories').get();
        const maxOrder = snapshot.docs.reduce((max, doc) => {
            const order = doc.data().order || 0;
            return order > max ? order : max;
        }, 0);

        const categoryData = {
            name: body.name,
            slug: body.slug,
            description: body.description || '',
            icon: body.icon || '📁',
            color: body.color || '#6366f1',
            tutorialCount: 0,
            order: maxOrder + 1,
            createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await adminDb.collection('categories').add(categoryData);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: 'Category created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
