'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Filter, RefreshCw } from 'lucide-react';
import TutorialCard from '@/components/TutorialCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Suspense } from 'react';

function TutorialsContent() {
    const searchParams = useSearchParams();
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    const [tutorials, setTutorials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all tutorials (simple query, no composite index needed)
                const tutorialsSnapshot = await getDocs(collection(db, 'tutorials'));
                let allTutorials = tutorialsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter to published only
                allTutorials = allTutorials.filter(t => t.status === 'published');

                // Sort by createdAt descending
                allTutorials.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                });

                console.log('Tutorials page - fetched from Firebase:', allTutorials.length);
                setTutorials(allTutorials);

                // Fetch categories
                try {
                    const categoriesSnapshot = await getDocs(collection(db, 'categories'));

                    if (categoriesSnapshot.empty) {
                        setCategories([]);
                    } else {
                        let cats = categoriesSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        cats.sort((a, b) => (a.order || 0) - (b.order || 0));
                        setCategories(cats);
                    }
                } catch (catError) {
                    console.error('Error fetching categories:', catError);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching tutorials:', error);
                setTutorials([]);
                setCategories([]);
            }
            setLoading(false);
            setLoading(false);
        };

        fetchData();
    }, []);

    // Filter tutorials based on query params
    let filteredTutorials = tutorials;

    if (difficulty) {
        filteredTutorials = filteredTutorials.filter(t => t.difficulty === difficulty);
    }

    if (category) {
        filteredTutorials = filteredTutorials.filter(t => t.categorySlug === category);
    }

    const difficulties = ['easy', 'medium', 'hard'];

    return (
        <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
            <div className="container">
                <Breadcrumbs items={[{ label: 'Tutorials' }]} />

                {/* Header */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Explore Tutorials
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Master data structures and algorithms with our collection of {tutorials.length} standard problems,
                        complete with detailed solution breakdowns.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-12 space-y-6">
                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        <div className="flex gap-2 mx-auto">
                            <Link
                                href={`/tutorials${difficulty ? `?difficulty=${difficulty}` : ''}`}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${!category
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                All Categories
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/tutorials?category=${cat.slug}${difficulty ? `&difficulty=${difficulty}` : ''}`}
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border flex items-center gap-2 ${category === cat.slug
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <Link
                                href="/tutorials"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!difficulty ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                All Levels
                            </Link>
                            {difficulties.map((d) => (
                                <Link
                                    key={d}
                                    href={`/tutorials?difficulty=${d}${category ? `&category=${category}` : ''}`}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${difficulty === d ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {d}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-24">
                        <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary mb-4 opacity-50" />
                        <p className="text-slate-500 font-medium">Loading tutorials...</p>
                    </div>
                ) : filteredTutorials.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTutorials.map((tutorial) => (
                                <TutorialCard key={tutorial.id} tutorial={tutorial} />
                            ))}
                        </div>

                        <div className="mt-12 text-center text-sm text-slate-400">
                            Showing {filteredTutorials.length} of {tutorials.length} tutorials
                        </div>
                    </>
                ) : (
                    <div className="text-center py-24 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Filter className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No tutorials found</h3>
                        <p className="text-slate-500 mb-6">
                            No tutorials match your current filters. Try changing the category or difficulty level.
                        </p>
                        <Link href="/tutorials" className="btn btn-primary">
                            Clear All Filters
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TutorialsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <RefreshCw className="w-10 h-10 animate-spin text-primary opacity-50" />
            </div>
        }>
            <TutorialsContent />
        </Suspense>
    );
}
