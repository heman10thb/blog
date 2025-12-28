'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Code2, Save, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getApiKey } from '@/lib/adminConfig';

export default function CategoriesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '📁',
        color: '#6366f1'
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    // Fetch categories from Firebase
    const fetchCategories = async () => {
        setDataLoading(true);
        try {
            const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // If no categories in Firebase, set empty
                setCategories([]);
            } else {
                const cats = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(cats);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
        setDataLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user]);

    const handleNameChange = (name) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setFormData(prev => ({ ...prev, name, slug }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }

        setSaving(true);

        try {
            if (editingId) {
                // Update existing category
                const response = await fetch(`/api/admin/categories/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': getApiKey()
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update');
                }
            } else {
                // Add new category
                const response = await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': getApiKey()
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to create');
                }
            }

            resetForm();
            await fetchCategories();
            alert('Category saved successfully!');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category: ' + error.message);
        }

        setSaving(false);
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            icon: category.icon || '📁',
            color: category.color || '#6366f1'
        });
        setEditingId(category.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': getApiKey()
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            await fetchCategories();
            alert('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: '📁',
            color: '#6366f1'
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const commonIcons = ['📊', '🔗', '🌳', '⚡', '🔍', '📚', '#️⃣', '🔄', '💡', '🎯', '🧮', '📝'];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="container flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 text-muted hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <span>Categories</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchCategories}
                            disabled={dataLoading}
                            className="btn btn-secondary"
                        >
                            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                    </div>
                </div>
            </header>

            <div className="container py-8">
                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl border border-border p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-foreground">
                                {editingId ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button onClick={resetForm} className="text-muted hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="e.g., Arrays & Strings"
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Icon
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {commonIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                className={`w-10 h-10 rounded-lg border text-xl flex items-center justify-center transition-colors ${formData.icon === icon
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border hover:border-primary'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                        placeholder="Or enter custom emoji"
                                        className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                            className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                            className="flex-1 px-4 py-2 rounded-lg border border-border focus:border-primary font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Preview
                                    </label>
                                    <div className="p-4 rounded-lg border border-border">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2"
                                            style={{ backgroundColor: `${formData.color}15` }}
                                        >
                                            {formData.icon}
                                        </div>
                                        <p className="font-medium text-foreground">{formData.name || 'Category Name'}</p>
                                        <p className="text-sm text-muted">{formData.description || 'Description'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')} Category
                            </button>
                        </div>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {dataLoading ? (
                        <div className="py-12 text-center text-muted">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading categories...
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted">Category</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted">Slug</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-muted">Tutorials</th>
                                    <th className="text-right py-4 px-6 text-sm font-medium text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-t border-border">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                                    style={{ backgroundColor: `${category.color || '#6366f1'}15` }}
                                                >
                                                    {category.icon || '📁'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{category.name}</p>
                                                    <p className="text-sm text-muted line-clamp-1">{category.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <code className="text-sm text-muted bg-slate-100 px-2 py-1 rounded">
                                                {category.slug}
                                            </code>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-foreground font-medium">{category.tutorialCount || 0}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-muted hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="p-2 text-muted hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
