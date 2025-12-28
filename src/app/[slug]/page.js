import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Eye, Tag, ArrowLeft, CheckCircle, Bookmark, Share2, Zap, Code2, List } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import CodeBlock from '@/components/CodeBlock';
import TutorialCard from '@/components/TutorialCard';
import { adminDb } from '@/lib/firebaseAdmin';

// Fetch tutorial from Firebase by slug
async function getTutorialFromFirebase(slug) {
    if (!adminDb) {
        console.error('Firebase Admin not configured');
        return null;
    }

    try {
        const snapshot = await adminDb.collection('tutorials')
            .where('slug', '==', slug)
            .where('status', '==', 'published')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error fetching tutorial:', error);
        return null;
    }
}

// Fetch related tutorials
async function getRelatedTutorials(tutorial) {
    if (!adminDb || !tutorial) return [];

    try {
        const snapshot = await adminDb.collection('tutorials')
            .where('status', '==', 'published')
            .limit(10)
            .get();

        const tutorials = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t => t.id !== tutorial.id && (
                t.categorySlug === tutorial.categorySlug ||
                (t.tags || []).some(tag => (tutorial.tags || []).includes(tag))
            ))
            .slice(0, 3);

        return tutorials;
    } catch (error) {
        console.error('Error fetching related tutorials:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const tutorial = await getTutorialFromFirebase(slug);

    if (!tutorial) {
        return { title: 'Tutorial Not Found' };
    }

    return {
        title: tutorial.title,
        description: tutorial.description,
        openGraph: {
            title: tutorial.title,
            description: tutorial.description,
        },
    };
}

export default async function TutorialPage({ params }) {
    const { slug } = await params;
    const tutorial = await getTutorialFromFirebase(slug);

    if (!tutorial) {
        notFound();
    }

    const relatedTutorials = await getRelatedTutorials(tutorial);

    const difficultyConfig = {
        easy: { color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
        medium: { color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        hard: { color: 'from-rose-500 to-red-500', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };

    const difficulty = difficultyConfig[tutorial.difficulty] || difficultyConfig.easy;

    const formatViews = (views) => {
        if (!views) return '0';
        if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
        return views;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                <div className={`absolute inset-0 bg-gradient-to-br ${difficulty.color} opacity-5`}></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>

                <div className="container relative py-8 lg:py-12">
                    <Breadcrumbs
                        items={[
                            { href: '/tutorials', label: 'Tutorials' },
                            { href: `/categories/${tutorial.categorySlug}`, label: tutorial.category || 'Uncategorized' },
                            { label: tutorial.title },
                        ]}
                    />

                    {/* Header Card */}
                    <div className="mt-8 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Difficulty Bar */}
                        <div className={`h-1.5 bg-gradient-to-r ${difficulty.color}`}></div>

                        <div className="p-8 lg:p-12">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${difficulty.bg} ${difficulty.text} ${difficulty.border} border`}>
                                    <Zap className="w-3.5 h-3.5" />
                                    {(tutorial.difficulty || 'easy').charAt(0).toUpperCase() + (tutorial.difficulty || 'easy').slice(1)}
                                </span>
                                {tutorial.category && (
                                    <Link
                                        href={`/categories/${tutorial.categorySlug}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        <Code2 className="w-3.5 h-3.5" />
                                        {tutorial.category}
                                    </Link>
                                )}
                            </div>

                            {/* Title */}
                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                                {tutorial.title}
                            </h1>

                            {/* Description */}
                            <p className="text-base lg:text-lg text-muted mb-8 max-w-3xl leading-relaxed">
                                {tutorial.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDate(tutorial.createdAt || tutorial.publishedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Eye className="w-4 h-4" />
                                    <span>{formatViews(tutorial.views)} views</span>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <button className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="container py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Article (8/12 = ~66%) */}
                    <article className="lg:col-span-8 lg:order-1">

                        {/* Problem Statement */}
                        {tutorial.problemStatement && (
                            <section id="problem" className="mb-10 scroll-mt-28">
                                <h2 className="text-2xl font-bold text-foreground mb-3 pb-2 border-b border-slate-100">
                                    Problem Statement
                                </h2>
                                <p className="text-foreground leading-relaxed text-base lg:text-sm whitespace-pre-wrap">
                                    {tutorial.problemStatement}
                                </p>
                            </section>
                        )}

                        {/* Input/Output Format - Inline */}
                        {(tutorial.inputFormat || tutorial.outputFormat) && (
                            <section className="mb-10 grid md:grid-cols-2 gap-8">
                                {tutorial.inputFormat && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Input Format</h3>
                                        <p className="text-foreground leading-relaxed text-base lg:text-sm">{tutorial.inputFormat}</p>
                                    </div>
                                )}
                                {tutorial.outputFormat && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Output Format</h3>
                                        <p className="text-foreground leading-relaxed text-base lg:text-sm">{tutorial.outputFormat}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Examples */}
                        {tutorial.examples && tutorial.examples.length > 0 && (
                            <section id="examples" className="mb-10 scroll-mt-28">
                                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-slate-100">
                                    Examples
                                </h2>
                                <div className="space-y-6">
                                    {tutorial.examples.map((example, index) => (
                                        <div key={index} className="border-l-[3px] border-primary/20 pl-5">
                                            <span className="text-xs font-semibold text-primary mb-2 block">Example {index + 1}</span>
                                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Input</span>
                                                    <pre className="mt-1 p-3 bg-slate-50 text-slate-700 rounded-md text-sm font-mono overflow-x-auto border border-slate-100">
                                                        {example.input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Output</span>
                                                    <pre className="mt-1 p-3 bg-slate-50 text-slate-700 rounded-md text-sm font-mono overflow-x-auto border border-slate-100">
                                                        {example.output}
                                                    </pre>
                                                </div>
                                            </div>
                                            {example.explanation && (
                                                <p className="text-sm text-muted mt-2">
                                                    <span className="font-medium text-foreground">Explanation:</span> {example.explanation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Constraints */}
                        {tutorial.constraints && (
                            <section id="constraints" className="mb-10 scroll-mt-28">
                                <h2 className="text-2xl font-bold text-foreground mb-3 pb-2 border-b border-slate-100">
                                    Constraints
                                </h2>
                                <pre className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg whitespace-pre-wrap font-mono leading-relaxed border border-slate-100">
                                    {tutorial.constraints}
                                </pre>
                            </section>
                        )}

                        {/* Solution */}
                        {tutorial.solutions && (
                            <section id="solution" className="mb-10 scroll-mt-28">
                                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-slate-100">
                                    Solution
                                </h2>
                                <CodeBlock solutions={tutorial.solutions} />
                            </section>
                        )}

                        {/* Approach */}
                        {tutorial.approach && (
                            <section id="approach" className="mb-10 scroll-mt-28">
                                <h2 className="text-2xl font-bold text-foreground mb-3 pb-2 border-b border-slate-100">
                                    Approach
                                </h2>
                                <p className="text-foreground leading-relaxed text-base lg:text-sm whitespace-pre-wrap">
                                    {tutorial.approach}
                                </p>
                            </section>
                        )}

                        {/* Complexity Analysis */}
                        {tutorial.complexity && (tutorial.complexity.time || tutorial.complexity.space) && (
                            <section id="complexity" className="mb-10 scroll-mt-28">
                                <h2 className="text-2xl font-bold text-foreground mb-3 pb-2 border-b border-slate-100">
                                    Complexity
                                </h2>
                                <div className="flex flex-wrap gap-8">
                                    {tutorial.complexity.time && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <div>
                                                <span className="text-sm text-muted">Time:</span>
                                                <span className="ml-2 font-mono text-sm font-medium text-foreground">{tutorial.complexity.time}</span>
                                            </div>
                                        </div>
                                    )}
                                    {tutorial.complexity.space && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                            <div>
                                                <span className="text-sm text-muted">Space:</span>
                                                <span className="ml-2 font-mono text-sm font-medium text-foreground">{tutorial.complexity.space}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </article>

                    {/* Right Column: Sidebar (4/12 = ~33%) */}
                    <aside className="lg:col-span-4 lg:order-2 space-y-8">
                        <div className="sticky top-24">
                            {/* Table of Contents */}
                            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6">
                                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                    <List className="w-4 h-4" />
                                    On This Page
                                </h3>
                                <nav className="space-y-1">
                                    {tutorial.problemStatement && (
                                        <a href="#problem" className="block text-sm text-muted hover:text-primary transition-colors py-1.5 px-2 hover:bg-slate-50 rounded-md">Problem Statement</a>
                                    )}
                                    {tutorial.examples?.length > 0 && (
                                        <a href="#examples" className="block text-sm text-muted hover:text-primary transition-colors py-1.5 px-2 hover:bg-slate-50 rounded-md">Examples</a>
                                    )}
                                    {tutorial.constraints && (
                                        <a href="#constraints" className="block text-sm text-muted hover:text-primary transition-colors py-1.5 px-2 hover:bg-slate-50 rounded-md">Constraints</a>
                                    )}
                                    {tutorial.solutions && (
                                        <a href="#solution" className="block text-sm text-muted hover:text-primary transition-colors py-1.5 px-2 hover:bg-slate-50 rounded-md">Solution</a>
                                    )}
                                    {tutorial.approach && (
                                        <a href="#approach" className="block text-sm text-muted hover:text-primary transition-colors py-1.5 px-2 hover:bg-slate-50 rounded-md">Approach</a>
                                    )}
                                    {tutorial.complexity && (
                                        <a href="#complexity" className="block text-sm text-muted hover:text-primary transition-colors py-1.5 px-2 hover:bg-slate-50 rounded-md">Complexity</a>
                                    )}
                                </nav>
                            </div>

                            {/* Tags */}
                            {tutorial.tags && tutorial.tags.length > 0 && (
                                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Related Topics
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tutorial.tags.map((tag) => (
                                            <Link
                                                key={tag}
                                                href={`/topics/${tag}`}
                                                className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-medium border border-slate-100 hover:border-primary/30 hover:text-primary transition-colors"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-6">
                                <button className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-primary/5 text-slate-600 hover:text-primary transition-all text-sm font-medium">
                                    <Bookmark className="w-4 h-4" />
                                    Save
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-primary/5 text-slate-600 hover:text-primary transition-all text-sm font-medium">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Related Tutorials */}
            {relatedTutorials.length > 0 && (
                <section className="bg-slate-50 py-16 border-t border-slate-100">
                    <div className="container">
                        <h2 className="text-xl font-bold text-foreground mb-8">Related Tutorials</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedTutorials.map((t) => (
                                <TutorialCard key={t.id} tutorial={t} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Back Navigation */}
            <div className="container py-8">
                <Link
                    href="/tutorials"
                    className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All Tutorials
                </Link>
            </div>
        </div>
    );
}
