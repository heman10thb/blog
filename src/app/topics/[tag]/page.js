import TutorialCard from '@/components/TutorialCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { adminDb } from '@/lib/firebaseAdmin';

async function getTutorialsByTag(tag) {
    if (!adminDb) return [];

    // Convert URL friendly tag back to display format if needed
    // e.g., "dynamic-programming" -> "dynamic programming"
    const displayTag = tag.replace(/-/g, ' ');

    // We try to find tutorials that contain the tag
    // Note: This matches exact strings in the tags array
    try {
        // Try with formatted tag (e.g. "two pointers")
        let snapshot = await adminDb.collection('tutorials')
            .where('tags', 'array-contains', displayTag)
            .where('status', '==', 'published')
            .get();

        // If no results, try with original tag (e.g. "two-pointers" or single word "arrays")
        if (snapshot.empty && displayTag !== tag) {
            snapshot = await adminDb.collection('tutorials')
                .where('tags', 'array-contains', tag)
                .where('status', '==', 'published')
                .get();
        }

        const tutorials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory
        return tutorials.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching tutorials by tag:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { tag } = await params;
    const formattedTag = tag.replace(/-/g, ' ');

    return {
        title: `${formattedTag} Tutorials`,
        description: `Browse coding tutorials tagged with ${formattedTag}.`,
    };
}

export default async function TopicPage({ params }) {
    const { tag } = await params;
    const tutorials = await getTutorialsByTag(tag);
    const formattedTag = tag.replace(/-/g, ' ');

    return (
        <div className="py-8 lg:py-12">
            <div className="container">
                <Breadcrumbs
                    items={[
                        { href: '/tutorials', label: 'Tutorials' },
                        { label: formattedTag },
                    ]}
                />

                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
                        # {formattedTag}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Tutorials tagged "{formattedTag}"
                    </h1>
                    <p className="text-muted text-lg">
                        {tutorials.length} tutorial{tutorials.length !== 1 ? 's' : ''} found
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
                            No tutorials found with this tag.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
