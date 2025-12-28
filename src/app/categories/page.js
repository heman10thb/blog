import CategoryCard from '@/components/CategoryCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { adminDb } from '@/lib/firebaseAdmin';

export const metadata = {
    title: 'Categories',
    description: 'Browse coding tutorials by category - Arrays, Linked Lists, Trees, Dynamic Programming, and more.',
};

async function getCategories() {
    if (!adminDb) return [];

    try {
        const snapshot = await adminDb.collection('categories').orderBy('order', 'asc').get();
        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="py-8 lg:py-12">
            <div className="container">
                <Breadcrumbs items={[{ label: 'Categories' }]} />

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Browse by Category
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Explore our tutorials organized by topic to focus your learning and master specific areas
                    </p>
                </div>

                {/* Categories Grid */}
                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted">No categories found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
