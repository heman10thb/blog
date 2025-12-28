import Link from 'next/link';
import { Code2, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        tutorials: [
            { href: '/tutorials', label: 'All Tutorials' },
            { href: '/categories/arrays-strings', label: 'Arrays & Strings' },
            { href: '/categories/dynamic-programming', label: 'Dynamic Programming' },
            { href: '/categories/trees-graphs', label: 'Trees & Graphs' },
        ],
        resources: [
            { href: '/categories', label: 'Categories' },
            { href: '/about', label: 'About Us' },
            { href: '/search', label: 'Search' },
        ],
        difficulty: [
            { href: '/tutorials?difficulty=easy', label: 'Easy Problems' },
            { href: '/tutorials?difficulty=medium', label: 'Medium Problems' },
            { href: '/tutorials?difficulty=hard', label: 'Hard Problems' },
        ],
    };

    return (
        <footer className="bg-slate-900 text-white mt-20">
            <div className="container py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <span>Letuscrack</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Master coding interview problems with clear explanations and solutions in multiple programming languages.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Tutorials */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Popular Topics</h4>
                        <ul className="space-y-3">
                            {footerLinks.tutorials.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4">By Difficulty</h4>
                        <ul className="space-y-3">
                            {footerLinks.difficulty.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © {currentYear} Letuscrack. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
