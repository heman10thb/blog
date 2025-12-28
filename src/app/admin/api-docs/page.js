
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Copy, Check, Terminal, Tag, Code, Folder, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/adminConfig';

export default function ApiDocsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [baseUrl, setBaseUrl] = useState('');
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
        setBaseUrl(getApiBaseUrl());
    }, [user, loading, router]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const EndpointBlock = ({ method, path, description, params, body, response, responseCode = 200, curl }) => (
        <div className="mb-8 border-b border-border pb-8 last:border-0 last:pb-0">
            <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-md text-sm font-bold font-mono 
                    ${method === 'GET' ? 'bg-green-100 text-green-700' :
                        method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'}`}>
                    {method}
                </span>
                <code className="text-lg font-mono text-foreground">{path}</code>
            </div>
            <p className="text-muted mb-4">{description}</p>

            {curl && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Example Use (cURL)</h4>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto relative group">
                        <pre className="text-slate-50 font-mono text-xs whitespace-pre-wrap break-all">
                            <code>{curl}</code>
                        </pre>
                        <button
                            onClick={() => handleCopy(curl, `curl-${method}-${path}`)}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy command"
                        >
                            {copied === `curl-${method}-${path}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            )}

            {params && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Query Parameters</h4>
                    <ul className="list-disc list-inside text-sm text-muted space-y-1">
                        {params.map((p, i) => (
                            <li key={i}><code className="text-xs bg-slate-100 px-1 rounded">{p.name}</code> {p.required ? <span className="text-red-500 text-xs">(required)</span> : <span className="text-slate-400 text-xs">(optional)</span>}: {p.description}</li>
                        ))}
                    </ul>
                </div>
            )}

            {body && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Request Body (JSON)</h4>
                    <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-muted overflow-x-auto border border-border">
                        {JSON.stringify(body, null, 2)}
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h4 className="font-semibold text-sm text-foreground mb-2">Response ({responseCode})</h4>
                <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-muted overflow-x-auto border border-border">
                    {JSON.stringify(response, null, 2)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="container flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/settings" className="p-2 text-muted hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Book className="w-5 h-5 text-white" />
                            </div>
                            <span>API Documentation</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container py-8 max-w-4xl">
                <div className="space-y-8">
                    {/* Introduction */}
                    <section className="bg-white p-8 rounded-xl border border-border">
                        <h1 className="text-3xl font-bold text-foreground mb-4">Letuscrack API Reference</h1>
                        <p className="text-muted text-lg leading-relaxed mb-6">
                            Complete documentation for programmically managing your content. All endpoints are relative to the base URL.
                        </p>

                        <div className="p-4 bg-slate-50 rounded-lg border border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 font-mono text-sm">
                                <span className="font-semibold text-muted">Base URL:</span>
                                <span>{baseUrl}/api/admin</span>
                            </div>
                            <button
                                onClick={() => handleCopy(`${baseUrl}/api/admin`, 'baseurl')}
                                className="p-1 hover:text-primary transition-colors"
                            >
                                {copied === 'baseurl' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </section>

                    {/* Authentication */}
                    <section className="bg-white p-8 rounded-xl border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Terminal className="w-6 h-6" /> Authentication
                        </h2>
                        <p className="text-muted mb-4">
                            Include your API key in the <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-primary">x-api-key</code> request header.
                        </p>
                    </section>

                    {/* Tutorials */}
                    <section className="bg-white p-8 rounded-xl border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <FileText className="w-6 h-6" /> Tutorials
                        </h2>

                        <EndpointBlock
                            method="GET"
                            path="/tutorials"
                            description="List all tutorials. Returns minimal data for list views."
                            curl={`curl -X GET "${baseUrl}/api/admin/tutorials" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            response={{ tutorials: [{ id: "123", title: "Two Sum", slug: "two-sum", status: "published" }], count: 1 }}
                        />

                        <EndpointBlock
                            method="POST"
                            path="/tutorials"
                            description="Create a new tutorial."
                            curl={`curl -X POST "${baseUrl}/api/admin/tutorials" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Two Sum",
    "slug": "two-sum",
    "categorySlug": "arrays",
    "problemStatement": "Find two numbers...",
    "status": "draft"
  }'`}
                            body={{
                                title: "Two Sum",
                                slug: "two-sum",
                                category: "Arrays",
                                categorySlug: "arrays",
                                problemStatement: "Find two numbers...",
                                status: "draft"
                            }}
                            response={{ success: true, id: "123", message: "Tutorial created successfully" }}
                            responseCode={201}
                        />

                        <EndpointBlock
                            method="GET"
                            path="/tutorials/[id]"
                            description="Get full details of a specific tutorial."
                            curl={`curl -X GET "${baseUrl}/api/admin/tutorials/123" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            response={{ tutorial: { id: "123", title: "Two Sum", problemStatement: "...", examples: [] } }}
                        />

                        <EndpointBlock
                            method="PUT"
                            path="/tutorials/[id]"
                            description="Update an existing tutorial."
                            curl={`curl -X PUT "${baseUrl}/api/admin/tutorials/123" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Two Sum (Updated)",
    "status": "published"
  }'`}
                            body={{ title: "Two Sum (Updated)", status: "published" }}
                            response={{ success: true, message: "Tutorial updated successfully", id: "123" }}
                        />

                        <EndpointBlock
                            method="DELETE"
                            path="/tutorials/[id]"
                            description="Permanently delete a tutorial."
                            curl={`curl -X DELETE "${baseUrl}/api/admin/tutorials/123" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            response={{ success: true, message: "Tutorial deleted successfully", id: "123" }}
                        />
                    </section>

                    {/* Categories */}
                    <section className="bg-white p-8 rounded-xl border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Folder className="w-6 h-6" /> Categories
                        </h2>

                        <EndpointBlock
                            method="GET"
                            path="/categories"
                            description="List all categories ordered by their 'order' field."
                            curl={`curl -X GET "${baseUrl}/api/admin/categories" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            response={{ categories: [{ id: "c1", name: "Arrays", slug: "arrays", order: 1 }], count: 1 }}
                        />

                        <EndpointBlock
                            method="POST"
                            path="/categories"
                            description="Create a new category."
                            curl={`curl -X POST "${baseUrl}/api/admin/categories" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Dynamic Programming",
    "slug": "dynamic-programming",
    "icon": "🧠",
    "color": "#6366f1"
  }'`}
                            body={{ name: "Dynamic Programming", slug: "dynamic-programming", icon: "🧠", color: "#6366f1" }}
                            response={{ success: true, id: "c2", message: "Category created successfully" }}
                            responseCode={201}
                        />
                    </section>

                    {/* Topics */}
                    <section className="bg-white p-8 rounded-xl border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Tag className="w-6 h-6" /> Topics
                        </h2>

                        <EndpointBlock
                            method="GET"
                            path="/topics"
                            description="Get all topics."
                            curl={`curl -X GET "${baseUrl}/api/admin/topics" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            response={{ topics: [{ id: "t1", name: "Backtracking", slug: "backtracking" }], count: 1 }}
                        />

                        <EndpointBlock
                            method="POST"
                            path="/topics"
                            description="Create a new topic."
                            curl={`curl -X POST "${baseUrl}/api/admin/topics" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Backtracking",
    "description": "Recursive algorithms...",
    "color": "#6366f1"
  }'`}
                            body={{ name: "Backtracking", description: "Recursive algorithms...", color: "#6366f1" }}
                            response={{ success: true, id: "t1", message: "Topic created successfully" }}
                            responseCode={201}
                        />

                        <EndpointBlock
                            method="PUT"
                            path="/topics?id=[id]"
                            description="Update a topic. Pass ID in query string."
                            curl={`curl -X PUT "${baseUrl}/api/admin/topics?id=t1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Backtracking (New)",
    "color": "#10b981"
  }'`}
                            params={[{ name: "id", required: true, description: "ID of topic to update" }]}
                            body={{ name: "Backtracking (New)", color: "#10b981" }}
                            response={{ success: true, message: "Topic updated successfully" }}
                        />

                        <EndpointBlock
                            method="DELETE"
                            path="/topics?id=[id]"
                            description="Delete a topic."
                            curl={`curl -X DELETE "${baseUrl}/api/admin/topics?id=t1" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            params={[{ name: "id", required: true, description: "ID of topic to delete" }]}
                            response={{ success: true, message: "Topic deleted successfully" }}
                        />
                    </section>

                    {/* Programming Tags */}
                    <section className="bg-white p-8 rounded-xl border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Code className="w-6 h-6" /> Programming Languages
                        </h2>

                        <EndpointBlock
                            method="GET"
                            path="/programming-tags"
                            description="Get all programming language tags."
                            curl={`curl -X GET "${baseUrl}/api/admin/programming-tags" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            response={{ tags: [{ id: "p1", name: "Python", slug: "python", icon: "🐍" }], count: 1 }}
                        />

                        <EndpointBlock
                            method="POST"
                            path="/programming-tags"
                            description="Create a new programming language tag."
                            curl={`curl -X POST "${baseUrl}/api/admin/programming-tags" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Python",
    "icon": "🐍",
    "color": "#3776ab"
  }'`}
                            body={{ name: "Python", icon: "🐍", color: "#3776ab" }}
                            response={{ success: true, id: "p1", message: "Programming tag created successfully" }}
                            responseCode={201}
                        />

                        <EndpointBlock
                            method="PUT"
                            path="/programming-tags?id=[id]"
                            description="Update a programming tag."
                            curl={`curl -X PUT "${baseUrl}/api/admin/programming-tags?id=p1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "icon": "💻"
  }'`}
                            params={[{ name: "id", required: true, description: "ID of tag to update" }]}
                            body={{ icon: "💻" }}
                            response={{ success: true, message: "Programming tag updated successfully" }}
                        />

                        <EndpointBlock
                            method="DELETE"
                            path="/programming-tags?id=[id]"
                            description="Delete a programming tag."
                            curl={`curl -X DELETE "${baseUrl}/api/admin/programming-tags?id=p1" \\
  -H "x-api-key: YOUR_API_KEY"`}
                            params={[{ name: "id", required: true, description: "ID of tag to delete" }]}
                            response={{ success: true, message: "Programming tag deleted successfully" }}
                        />
                    </section>

                </div>
            </div>
        </div>
    );
}
