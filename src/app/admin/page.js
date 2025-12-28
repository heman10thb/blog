'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Plus,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
    BookOpen,
    LogOut,
    Code2,
    RefreshCw,
    Tag as TagIcon,
    Code as CodeIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getApiKey } from '@/lib/adminConfig';

export default function AdminDashboard() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalTutorials: 0,
        publishedTutorials: 0,
        draftTutorials: 0,
        totalCategories: 0,
        totalViews: 0
    });
    const [recentTutorials, setRecentTutorials] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    // Fetch data from Firebase
    const fetchData = async () => {
        setDataLoading(true);
        try {
            // Fetch tutorials
            const tutorialsQuery = query(
                collection(db, 'tutorials'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const tutorialsSnapshot = await getDocs(tutorialsQuery);
            const tutorials = tutorialsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate stats
            let publishedCount = 0;
            let draftCount = 0;
            let totalViews = 0;

            // Get all tutorials for stats (not just recent)
            const allTutorialsSnapshot = await getDocs(collection(db, 'tutorials'));
            allTutorialsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                totalViews += data.views || 0;
                if (data.status === 'published') publishedCount++;
                else draftCount++;
            });

            // Fetch categories count
            const categoriesSnapshot = await getDocs(collection(db, 'categories'));

            setStats({
                totalTutorials: allTutorialsSnapshot.size,
                publishedTutorials: publishedCount,
                draftTutorials: draftCount,
                totalCategories: categoriesSnapshot.size || 8, // Default to 8 if no categories
                totalViews
            });

            setRecentTutorials(tutorials.slice(0, 5));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setDataLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/admin/login');
    };

    const handleDelete = async (tutorialId, tutorialTitle) => {
        if (!confirm(`Are you sure you want to delete "${tutorialTitle}"?`)) {
            return;
        }

        setDeleting(tutorialId);
        try {
            // Use API route with Admin SDK for delete
            const response = await fetch(`/api/admin/tutorials/${tutorialId}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': getApiKey()
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            // Refresh data after delete
            await fetchData();
        } catch (error) {
            console.error('Error deleting tutorial:', error);
            alert('Failed to delete tutorial: ' + error.message);
        }
        setDeleting(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const formatViews = (views) => {
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}k`;
        }
        return views || 0;
    };

    const difficultyColors = {
        easy: 'text-green-600 bg-green-100',
        medium: 'text-amber-600 bg-amber-100',
        hard: 'text-red-600 bg-red-100',
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="container flex items-center justify-between h-16">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <span>Admin</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
                            View Site →
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{user.displayName || 'Admin'}</p>
                                <p className="text-xs text-muted">{user.email}</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-muted hover:text-red-600 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container py-8">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted">Welcome back! Here's an overview of your content.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={dataLoading}
                            className="btn btn-secondary"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <Link href="/admin/tutorials/new" className="btn btn-primary">
                            <Plus className="w-4 h-4" />
                            New Tutorial
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {dataLoading ? '...' : stats.totalTutorials}
                            </span>
                        </div>
                        <h3 className="font-medium text-foreground">Total Tutorials</h3>
                        <p className="text-sm text-muted">
                            {stats.publishedTutorials} published, {stats.draftTutorials} drafts
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <FolderOpen className="w-6 h-6 text-accent" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {dataLoading ? '...' : stats.totalCategories}
                            </span>
                        </div>
                        <h3 className="font-medium text-foreground">Categories</h3>
                        <p className="text-sm text-muted">Topic categories</p>
                    </div>

                    <div className="bg-white rounded-xl border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {dataLoading ? '...' : formatViews(stats.totalViews)}
                            </span>
                        </div>
                        <h3 className="font-medium text-foreground">Total Views</h3>
                        <p className="text-sm text-muted">All time page views</p>
                    </div>

                    <div className="bg-white rounded-xl border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="text-2xl font-bold text-foreground">
                                {stats.totalTutorials > 0 ? '+' + stats.totalTutorials : '0'}
                            </span>
                        </div>
                        <h3 className="font-medium text-foreground">Tutorials</h3>
                        <p className="text-sm text-muted">Content created</p>
                    </div>
                </div>

                {/* Quick Actions & Recent */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-border p-6">
                        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/tutorials/new"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Add Tutorial</p>
                                    <p className="text-sm text-muted">Create a new coding problem</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/categories"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <FolderOpen className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Manage Categories</p>
                                    <p className="text-sm text-muted">Add or edit categories</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/topics"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <TagIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Manage Topics</p>
                                    <p className="text-sm text-muted">Add or edit topics</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/languages"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CodeIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Programming Languages</p>
                                    <p className="text-sm text-muted">Add or edit languages</p>
                                </div>
                            </Link>
                            <Link
                                href="/tutorials"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">View Site</p>
                                    <p className="text-sm text-muted">See your tutorials live</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Code2 className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Settings & API</p>
                                    <p className="text-sm text-muted">API keys and docs</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Tutorials */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Recent Tutorials
                            </h2>
                        </div>

                        {dataLoading ? (
                            <div className="py-8 text-center text-muted">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                Loading tutorials...
                            </div>
                        ) : recentTutorials.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-muted mb-4">No tutorials yet</p>
                                <Link href="/admin/tutorials/new" className="btn btn-primary">
                                    <Plus className="w-4 h-4" />
                                    Create Your First Tutorial
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted">Title</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted">Difficulty</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted">Views</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTutorials.map((tutorial) => (
                                            <tr key={tutorial.id} className="border-b border-border last:border-b-0">
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-foreground">{tutorial.title}</p>
                                                    <p className="text-xs text-muted">{tutorial.slug}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[tutorial.difficulty] || 'text-gray-600 bg-gray-100'}`}>
                                                        {tutorial.difficulty || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tutorial.status === 'published'
                                                        ? 'text-green-600 bg-green-100'
                                                        : 'text-amber-600 bg-amber-100'
                                                        }`}>
                                                        {tutorial.status || 'draft'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-muted">{formatViews(tutorial.views)}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/tutorials/${tutorial.slug}`}
                                                            className="p-1 text-muted hover:text-primary transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/tutorials/edit/${tutorial.id}`}
                                                            className="p-1 text-muted hover:text-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(tutorial.id, tutorial.title)}
                                                            disabled={deleting === tutorial.id}
                                                            className="p-1 text-muted hover:text-red-600 transition-colors disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className={`w-4 h-4 ${deleting === tutorial.id ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
