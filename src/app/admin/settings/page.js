'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Settings,
    Globe,
    Zap,
    Shield,
    FileText,
    ArrowLeft,
    Copy,
    Check,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getExternalApiKey,
    setExternalApiKey,
    isUsingCustomExternalKey,
    resetExternalApiKey,
    getInternalApiKey,
    setInternalApiKey,
    isUsingCustomInternalKey,
    resetInternalApiKey,
    generateApiKey,
    getApiBaseUrl
} from '@/lib/adminConfig';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // API Keys
    const [externalKey, setLocalExternalKey] = useState('');
    const [newExternalKey, setNewExternalKey] = useState('');
    const [isCustomExternal, setIsCustomExternal] = useState(false);
    const [internalKey, setLocalInternalKey] = useState('');
    const [newInternalKey, setNewInternalKey] = useState('');
    const [isCustomInternal, setIsCustomInternal] = useState(false);



    const [copied, setCopied] = useState(null);
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        setLocalExternalKey(getExternalApiKey());
        setIsCustomExternal(isUsingCustomExternalKey());
        setLocalInternalKey(getInternalApiKey());
        setIsCustomInternal(isUsingCustomInternalKey());
        setBaseUrl(getApiBaseUrl());
    }, []);



    const handleCopy = async (text, type) => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    // API Key handlers
    const handleGenerateExternalKey = () => setNewExternalKey(generateApiKey('ext'));
    const handleGenerateInternalKey = () => setNewInternalKey(generateApiKey('int'));

    const handleSaveExternalKey = () => {
        if (!newExternalKey.trim()) return alert('Please enter or generate an API key');
        setExternalApiKey(newExternalKey);
        setLocalExternalKey(newExternalKey);
        setIsCustomExternal(true);
        setNewExternalKey('');
        alert('External API key saved! Update .env.local with ADMIN_API_KEY=' + newExternalKey);
    };

    const handleSaveInternalKey = () => {
        if (!newInternalKey.trim()) return alert('Please enter or generate an API key');
        setInternalApiKey(newInternalKey);
        setLocalInternalKey(newInternalKey);
        setIsCustomInternal(true);
        setNewInternalKey('');
        alert('Internal API key saved!');
    };

    const handleResetExternalKey = () => {
        if (confirm('Reset external API key?')) {
            resetExternalApiKey();
            setLocalExternalKey(getExternalApiKey());
            setIsCustomExternal(false);
        }
    };

    const handleResetInternalKey = () => {
        if (confirm('Reset internal API key?')) {
            resetInternalApiKey();
            setLocalInternalKey(getInternalApiKey());
            setIsCustomInternal(false);
        }
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
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <span>Settings & API</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">



                        {/* External API Key */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                External API Key (n8n)
                            </h2>
                            <p className="text-sm text-muted mb-4">For external integrations like n8n, Zapier</p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input type="password" value={externalKey} readOnly className="flex-1 px-3 py-2 rounded-lg border border-border bg-slate-50 font-mono text-sm" />
                                    <button onClick={() => handleCopy(externalKey, 'external')} className="btn btn-secondary">
                                        {copied === 'external' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newExternalKey}
                                        onChange={(e) => setNewExternalKey(e.target.value)}
                                        placeholder="New key..."
                                        className="flex-1 px-3 py-2 rounded-lg border border-border font-mono text-sm"
                                    />
                                    <button onClick={handleGenerateExternalKey} className="btn btn-secondary"><RefreshCw className="w-4 h-4" /></button>
                                    <button onClick={handleSaveExternalKey} className="btn btn-primary">Save</button>
                                </div>
                                {isCustomExternal && (
                                    <button onClick={handleResetExternalKey} className="text-sm text-red-600 hover:underline">Reset</button>
                                )}
                            </div>
                        </div>

                        {/* Internal API Key */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" />
                                Internal API Key (Dashboard)
                            </h2>
                            <p className="text-sm text-muted mb-4">For admin dashboard operations</p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input type="password" value={internalKey} readOnly className="flex-1 px-3 py-2 rounded-lg border border-border bg-slate-50 font-mono text-sm" />
                                    <button onClick={() => handleCopy(internalKey, 'internal')} className="btn btn-secondary">
                                        {copied === 'internal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newInternalKey}
                                        onChange={(e) => setNewInternalKey(e.target.value)}
                                        placeholder="New key..."
                                        className="flex-1 px-3 py-2 rounded-lg border border-border font-mono text-sm"
                                    />
                                    <button onClick={handleGenerateInternalKey} className="btn btn-secondary"><RefreshCw className="w-4 h-4" /></button>
                                    <button onClick={handleSaveInternalKey} className="btn btn-primary">Save</button>
                                </div>
                                {isCustomInternal && (
                                    <button onClick={handleResetInternalKey} className="text-sm text-red-600 hover:underline">Reset</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Base URL */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Base URL
                            </h2>
                            <div className="flex items-center gap-2">
                                <input type="text" value={baseUrl} readOnly className="flex-1 px-3 py-2 rounded-lg border border-border bg-slate-50 font-mono text-sm" />
                                <button onClick={() => handleCopy(baseUrl, 'baseUrl')} className="p-2 text-muted hover:text-primary">
                                    {copied === 'baseUrl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* API Endpoints */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                API Endpoints
                            </h2>
                            <p className="text-sm text-muted mb-4">
                                View complete documentation for all available API endpoints.
                            </p>
                            <Link
                                href="/admin/api-docs"
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                            >
                                View Documentation
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-semibold text-foreground mb-4">Quick Links</h2>
                            <div className="space-y-2">
                                <Link href="/admin" className="block p-3 rounded-lg hover:bg-slate-50">Dashboard</Link>
                                <Link href="/admin/tutorials/new" className="block p-3 rounded-lg hover:bg-slate-50">New Tutorial</Link>
                                <Link href="/admin/categories" className="block p-3 rounded-lg hover:bg-slate-50">Categories</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
