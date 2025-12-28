'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const languageIcons = {
    python: '🐍',
    java: '☕',
    cpp: '⚡',
    javascript: '🟨',
    c: '🔧',
};

const languageLabels = {
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    javascript: 'JavaScript',
    c: 'C',
};

const syntaxLanguages = {
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    javascript: 'javascript',
    c: 'c',
};

export default function CodeBlock({ solutions, defaultLanguage = 'python' }) {
    // Filter out languages that don't have code
    const availableLanguages = Object.keys(solutions || {}).filter(lang => {
        const sol = solutions[lang];
        return sol && (typeof sol === 'string' ? sol.trim() : sol.code?.trim());
    });

    // Find first available language with code
    const findValidLanguage = () => {
        if (availableLanguages.includes(defaultLanguage)) {
            return defaultLanguage;
        }
        return availableLanguages[0] || 'python';
    };

    const [activeLanguage, setActiveLanguage] = useState(findValidLanguage());
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setActiveLanguage(findValidLanguage());
    }, [solutions]);

    // Get current solution - handle both formats: { code, explanation } and just string
    const getSolutionCode = (lang) => {
        const sol = solutions?.[lang];
        if (!sol) return '';
        if (typeof sol === 'string') return sol;
        return sol.code || '';
    };

    const getSolutionExplanation = (lang) => {
        const sol = solutions?.[lang];
        if (!sol || typeof sol === 'string') return '';
        return sol.explanation || '';
    };

    const currentCode = getSolutionCode(activeLanguage);
    const currentExplanation = getSolutionExplanation(activeLanguage);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (availableLanguages.length === 0) {
        return (
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-code-bg p-6">
                <p className="text-slate-400 text-center">No code solutions available yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-slate-700 bg-code-bg">
            {/* Language Tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-800 border-b border-slate-700 overflow-x-auto">
                {availableLanguages.map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setActiveLanguage(lang)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeLanguage === lang
                            ? 'bg-primary text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        <span>{languageIcons[lang] || '💻'}</span>
                        <span>{languageLabels[lang] || lang}</span>
                    </button>
                ))}

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code */}
            <div className="max-h-[500px] overflow-auto">
                {currentCode ? (
                    <SyntaxHighlighter
                        language={syntaxLanguages[activeLanguage] || 'javascript'}
                        style={oneDark}
                        showLineNumbers
                        wrapLines={true}
                        customStyle={{
                            margin: 0,
                            padding: '1.5rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                        }}
                        lineNumberStyle={{
                            minWidth: '2.5em',
                            paddingRight: '1em',
                            color: '#64748b',
                            userSelect: 'none',
                        }}
                        lineProps={{
                            style: { display: 'block', backgroundColor: 'transparent', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }
                        }}
                    >
                        {currentCode}
                    </SyntaxHighlighter>
                ) : (
                    <div className="p-6 text-slate-400 text-center">
                        No code for this language yet.
                    </div>
                )}
            </div>

            {/* Explanation */}
            {currentExplanation && (
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    <h4 className="text-sm font-semibold text-white mb-2">Explanation</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {currentExplanation}
                    </p>
                </div>
            )}
        </div>
    );
}
