'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Eye,
    Code2,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiKey } from '@/lib/adminConfig';

const languages = ['python', 'java', 'cpp', 'javascript'];
const languageLabels = {
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    javascript: 'JavaScript'
};

const defaultSolution = { code: '', explanation: '' };

export default function NewTutorialPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // State for options fetched from API
    const [categories, setCategories] = useState([]);
    const [availableTopics, setAvailableTopics] = useState([]);
    const [availableProgrammingTags, setAvailableProgrammingTags] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: '',
        categorySlug: '',
        difficulty: 'easy',
        tags: [],
        problemStatement: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        solutions: {
            python: { ...defaultSolution },
            java: { ...defaultSolution },
            cpp: { ...defaultSolution },
            javascript: { ...defaultSolution }
        },
        approach: '',
        complexity: { time: '', space: '' },
        status: 'draft',
        featured: false,
        topics: [],
        programmingTags: []
    });

    const [tagInput, setTagInput] = useState('');
    const [activeTab, setActiveTab] = useState('python');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    // Fetch options (Categories, Topics, Tags)
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [categoriesRes, topicsRes, tagsRes] = await Promise.all([
                    fetch('/api/admin/categories', { headers: { 'x-api-key': getApiKey() } }),
                    fetch('/api/admin/topics', { headers: { 'x-api-key': getApiKey() } }),
                    fetch('/api/admin/programming-tags', { headers: { 'x-api-key': getApiKey() } })
                ]);

                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    setCategories(data.categories || []);
                }
                if (topicsRes.ok) {
                    const data = await topicsRes.json();
                    setAvailableTopics(data.topics || []);
                }
                if (tagsRes.ok) {
                    const data = await tagsRes.json();
                    setAvailableProgrammingTags(data.tags || []);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
            }
        };
        fetchOptions();
    }, []);

    // Auto-generate slug from title
    const handleTitleChange = (title) => {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setFormData(prev => ({ ...prev, title, slug }));
    };

    const handleCategoryChange = (categorySlug) => {
        const category = categories.find(c => c.slug === categorySlug);
        setFormData(prev => ({
            ...prev,
            categorySlug,
            category: category?.name || ''
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim().toLowerCase()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const addExample = () => {
        setFormData(prev => ({
            ...prev,
            examples: [...prev.examples, { input: '', output: '', explanation: '' }]
        }));
    };

    const updateExample = (index, field, value) => {
        setFormData(prev => {
            const examples = [...prev.examples];
            examples[index] = { ...examples[index], [field]: value };
            return { ...prev, examples };
        });
    };

    const removeExample = (index) => {
        if (formData.examples.length > 1) {
            setFormData(prev => ({
                ...prev,
                examples: prev.examples.filter((_, i) => i !== index)
            }));
        }
    };

    const updateSolution = (language, field, value) => {
        setFormData(prev => ({
            ...prev,
            solutions: {
                ...prev.solutions,
                [language]: {
                    ...prev.solutions[language],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async (status) => {
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!formData.categorySlug) {
            setError('Category is required');
            return;
        }
        if (!formData.problemStatement.trim()) {
            setError('Problem statement is required');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/admin/tutorials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': getApiKey()
                },
                body: JSON.stringify({ ...formData, status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save tutorial');
            }

            alert('Tutorial saved successfully!');
            router.push('/admin');
        } catch (err) {
            setError('Failed to save tutorial: ' + err.message);
        }

        setSaving(false);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

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
                            <span>New Tutorial</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={saving}
                            className="btn btn-secondary"
                        >
                            <Save className="w-4 h-4" />
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('published')}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            <Eye className="w-4 h-4" />
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            <div className="container py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Basic Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="e.g., Two Sum"
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                                        placeholder="two-sum"
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description for search results and SEO..."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Problem Statement */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Problem Statement *</h2>
                            <textarea
                                value={formData.problemStatement}
                                onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                                placeholder="Describe the problem in detail..."
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm"
                            />
                        </div>

                        {/* Input/Output Format */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Input/Output Format</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Input Format
                                    </label>
                                    <textarea
                                        value={formData.inputFormat}
                                        onChange={(e) => setFormData(prev => ({ ...prev, inputFormat: e.target.value }))}
                                        placeholder="Describe input format..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Output Format
                                    </label>
                                    <textarea
                                        value={formData.outputFormat}
                                        onChange={(e) => setFormData(prev => ({ ...prev, outputFormat: e.target.value }))}
                                        placeholder="Describe output format..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Examples */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-foreground">Examples</h2>
                                <button
                                    onClick={addExample}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Example
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.examples.map((example, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-slate-50 border border-border">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-muted">Example {index + 1}</span>
                                            {formData.examples.length > 1 && (
                                                <button
                                                    onClick={() => removeExample(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-muted mb-1">Input</label>
                                                <textarea
                                                    value={example.input}
                                                    onChange={(e) => updateExample(index, 'input', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary text-sm font-mono resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted mb-1">Output</label>
                                                <textarea
                                                    value={example.output}
                                                    onChange={(e) => updateExample(index, 'output', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary text-sm font-mono resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <label className="block text-xs font-medium text-muted mb-1">Explanation (optional)</label>
                                            <input
                                                type="text"
                                                value={example.explanation}
                                                onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Constraints */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Constraints</h2>
                            <textarea
                                value={formData.constraints}
                                onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
                                placeholder="- 1 <= n <= 10^5&#10;- -10^4 <= nums[i] <= 10^4"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm"
                            />
                        </div>

                        {/* Solutions */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Solutions</h2>

                            {/* Language Tabs */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {languages.map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setActiveTab(lang)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === lang
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 text-muted hover:bg-slate-200'
                                            }`}
                                    >
                                        {languageLabels[lang]}
                                    </button>
                                ))}
                            </div>

                            {/* Code Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {languageLabels[activeTab]} Code
                                    </label>
                                    <textarea
                                        value={formData.solutions[activeTab].code}
                                        onChange={(e) => updateSolution(activeTab, 'code', e.target.value)}
                                        placeholder={`Enter ${languageLabels[activeTab]} solution code...`}
                                        rows={12}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm bg-slate-900 text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Explanation
                                    </label>
                                    <textarea
                                        value={formData.solutions[activeTab].explanation}
                                        onChange={(e) => updateSolution(activeTab, 'explanation', e.target.value)}
                                        placeholder="Explain the solution approach..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Approach & Complexity */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Approach & Complexity</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Overall Approach
                                    </label>
                                    <textarea
                                        value={formData.approach}
                                        onChange={(e) => setFormData(prev => ({ ...prev, approach: e.target.value }))}
                                        placeholder="Explain the overall approach and algorithm..."
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Time Complexity
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.complexity.time}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                complexity: { ...prev.complexity, time: e.target.value }
                                            }))}
                                            placeholder="e.g., O(n)"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Space Complexity
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.complexity.space}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                complexity: { ...prev.complexity, space: e.target.value }
                                            }))}
                                            placeholder="e.g., O(n)"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category & Difficulty */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Classification</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.categorySlug}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                                        />
                                        <span className="text-sm font-medium text-foreground">Featured Tutorial</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Tags</h2>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder="Add a tag..."
                                    className="flex-1 px-3 py-2 rounded-lg border border-border focus:border-primary text-sm"
                                />
                                <button
                                    onClick={addTag}
                                    className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="text-slate-500 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {formData.tags.length === 0 && (
                                    <p className="text-sm text-muted">No tags added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Topics Selection */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Topics</h2>
                            {availableTopics.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {availableTopics.map((topic) => (
                                        <label key={topic.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.topics.includes(topic.slug)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({ ...prev, topics: [...prev.topics, topic.slug] }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, topics: prev.topics.filter(t => t !== topic.slug) }));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                            />
                                            <span className="text-sm text-foreground">{topic.name}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted">No topics yet. Add in Settings.</p>
                            )}
                        </div>

                        {/* Programming Languages */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Programming Languages</h2>
                            {availableProgrammingTags.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {availableProgrammingTags.map((tag) => (
                                        <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.programmingTags.includes(tag.slug)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({ ...prev, programmingTags: [...prev.programmingTags, tag.slug] }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, programmingTags: prev.programmingTags.filter(t => t !== tag.slug) }));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                            />
                                            <span className="text-sm text-foreground">{tag.icon} {tag.name}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted">No languages yet. Add in Settings.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
