'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Code, Save, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiKey } from '@/lib/adminConfig';

export default function LanguagesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [languages, setLanguages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '💻',
        color: '#10b981'
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    const fetchLanguages = async () => {
        setDataLoading(true);
        try {
            const response = await fetch('/api/admin/programming-tags', {
                headers: { 'x-api-key': getApiKey() }
            });
            if (response.ok) {
                const data = await response.json();
                setLanguages(data.tags || []);
            }
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
        setDataLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchLanguages();
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
                const response = await fetch(`/api/admin/programming-tags?id=${editingId}`, {
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
                const response = await fetch('/api/admin/programming-tags', {
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
            await fetchLanguages();
            alert('Language saved successfully!');
        } catch (error) {
            console.error('Error saving language:', error);
            alert('Failed to save language: ' + error.message);
        }

        setSaving(false);
    };

    const handleEdit = (lang) => {
        setFormData({
            name: lang.name,
            slug: lang.slug,
            icon: lang.icon || '💻',
            color: lang.color || '#10b981'
        });
        setEditingId(lang.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/programming-tags?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': getApiKey() }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            await fetchLanguages();
            alert('Language deleted successfully!');
        } catch (error) {
            console.error('Error deleting language:', error);
            alert('Failed to delete language: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            icon: '💻',
            color: '#10b981'
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

    const commonIcons = ['🐍', '☕', '⚡', '📘', '🔷', '🦀', '💎', '🐹', '🐘', '💻', '⚙️', '🌐'];

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
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                <Code className="w-5 h-5 text-white" />
                            </div>
                            <span>Manage Languages</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        Add Language
                    </button>
                </div>
            </header>

            <div className="container py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Languages List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-border">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h2 className="font-semibold text-foreground">All Languages ({languages.length})</h2>
                                <button onClick={fetchLanguages} className="p-2 text-muted hover:text-foreground">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            {dataLoading ? (
                                <div className="p-12 text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                                    <p className="text-muted">Loading languages...</p>
                                </div>
                            ) : languages.length === 0 ? (
                                <div className="p-12 text-center text-muted">
                                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No languages yet. Create your first language!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {languages.map((lang) => (
                                        <div key={lang.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                                    style={{ backgroundColor: `${lang.color}20` }}
                                                >
                                                    {lang.icon || '💻'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{lang.name}</p>
                                                    <p className="text-sm text-muted">{lang.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(lang)}
                                                    className="p-2 text-muted hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lang.id, lang.name)}
                                                    className="p-2 text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add/Edit Form */}
                    <div>
                        {showAddForm && (
                            <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-foreground">
                                        {editingId ? 'Edit Language' : 'Add Language'}
                                    </h2>
                                    <button onClick={resetForm} className="p-2 text-muted hover:text-foreground">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            placeholder="e.g., Python"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            placeholder="python"
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-slate-50 font-mono text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {commonIcons.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                    className={`w-10 h-10 rounded-lg border text-lg flex items-center justify-center transition-colors ${formData.icon === icon
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-primary/50'
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
                                            placeholder="Enter emoji"
                                            className="w-full px-4 py-2 rounded-lg border border-border text-center text-xl"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Color</label>
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
                                                className="flex-1 px-4 py-3 rounded-lg border border-border font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full btn btn-primary"
                                    >
                                        {saving ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {editingId ? 'Update Language' : 'Create Language'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!showAddForm && (
                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="font-semibold text-foreground mb-4">Quick Tips</h3>
                                <ul className="text-sm text-muted space-y-2">
                                    <li>• Add programming languages for tutorials</li>
                                    <li>• Examples: Python 🐍, JavaScript ⚡, Java ☕</li>
                                    <li>• Select languages when creating tutorials</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
