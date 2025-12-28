import { notFound } from 'next/navigation';
import TutorialCard from '@/components/TutorialCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { adminDb } from '@/lib/firebaseAdmin';

async function getCategory(slug) {
    if (!adminDb) return null;
    try {
        const snapshot = await adminDb.collection('categories')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

async function getTutorialsByCategory(categorySlug) {
    if (!adminDb) return [];
    try {
        const snapshot = await adminDb.collection('tutorials')
            .where('categorySlug', '==', categorySlug)
            .where('status', '==', 'published')
            .get();

        const tutorials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory to avoid needing a composite index
        return tutorials.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching tutorials by category:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        return { title: 'Category Not Found' };
    }

    return {
        title: category.name,
        description: category.description,
    };
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        notFound();
    }

    const tutorials = await getTutorialsByCategory(slug);

    return (
        <div className="py-8 lg:py-12">
            <div className="container">
                <Breadcrumbs
                    items={[
                        { href: '/categories', label: 'Categories' },
                        { label: category.name },
                    ]}
                />

                {/* Header */}
                <div className="mb-12">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                        style={{ backgroundColor: `${category.color}15` }}
                    >
                        {category.icon}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        {category.name}
                    </h1>
                    <p className="text-muted text-lg max-w-2xl">
                        {category.description}
                    </p>
                    <p className="text-sm mt-4" style={{ color: category.color }}>
                        {tutorials.length} tutorial{tutorials.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Tutorials Grid */}
                {tutorials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tutorials.map((tutorial) => (
                            <TutorialCard key={tutorial.id} tutorial={tutorial} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-xl bg-slate-50 border border-border">
                        <p className="text-muted text-lg">
                            No tutorials available in this category yet.
                        </p>
                        <p className="text-sm text-muted-light mt-2">
                            Check back soon for new content!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
