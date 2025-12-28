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

    // Check Bearer token or x-api-key header
    const providedKey = authHeader?.replace('Bearer ', '') || apiKey;

    if (!providedKey) {
        return { valid: false, error: 'API key required' };
    }

    // Accept either external or internal key
    const isValidExternal = EXTERNAL_API_KEY && providedKey === EXTERNAL_API_KEY;
    const isValidInternal = providedKey === INTERNAL_API_KEY;

    if (!isValidExternal && !isValidInternal) {
        return { valid: false, error: 'Invalid API key' };
    }

    return { valid: true, keyType: isValidExternal ? 'external' : 'internal' };
}

// GET - List all tutorials (for admin)
export async function GET(request) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json(
            { error: 'Firebase Admin not configured. Please set up service account credentials.' },
            { status: 500 }
        );
    }

    try {
        const snapshot = await adminDb
            .collection('tutorials')
            .orderBy('createdAt', 'desc')
            .get();

        const tutorials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ tutorials, count: tutorials.length });
    } catch (error) {
        console.error('Error fetching tutorials:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new tutorial
export async function POST(request) {
    const auth = verifyApiKey(request);
    if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    if (!adminDb) {
        return NextResponse.json(
            { error: 'Firebase Admin not configured. Please set up service account credentials.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['title', 'slug', 'category', 'categorySlug', 'problemStatement'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Prepare tutorial data with defaults
        const now = FieldValue.serverTimestamp();
        const tutorialData = {
            title: body.title,
            slug: body.slug,
            description: body.description || '',
            category: body.category,
            categorySlug: body.categorySlug,
            difficulty: body.difficulty || 'medium',
            tags: body.tags || [],
            problemStatement: body.problemStatement,
            inputFormat: body.inputFormat || '',
            outputFormat: body.outputFormat || '',
            constraints: body.constraints || '',
            examples: body.examples || [],
            solutions: body.solutions || {},
            approach: body.approach || '',
            complexity: body.complexity || { time: '', space: '' },
            relatedTutorials: body.relatedTutorials || [],
            views: 0,
            status: body.status || 'draft',
            featured: body.featured || false,
            createdAt: now,
            updatedAt: now,
            publishedAt: body.status === 'published' ? now : null
        };

        const docRef = await adminDb.collection('tutorials').add(tutorialData);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: 'Tutorial created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating tutorial:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
