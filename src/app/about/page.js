import Link from 'next/link';
import { Code2, Target, Users, Zap, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'About',
    description: 'Learn more about Letuscrack - your go-to resource for mastering coding interview problems.',
};

export default function AboutPage() {
    const features = [
        {
            icon: Code2,
            title: 'Multiple Languages',
            description: 'Solutions in Python, Java, C++, and JavaScript so you can learn in your preferred language.',
        },
        {
            icon: Target,
            title: 'Clear Explanations',
            description: 'Step-by-step approach breakdowns and complexity analysis for every problem.',
        },
        {
            icon: Zap,
            title: 'Optimized Solutions',
            description: 'Learn the most efficient algorithms with detailed time and space complexity analysis.',
        },
        {
            icon: Users,
            title: 'Interview Ready',
            description: 'Problems curated from real coding interviews at top tech companies.',
        },
    ];

    return (
        <div className="py-8 lg:py-12">
            <div className="container">
                <Breadcrumbs items={[{ label: 'About' }]} />

                {/* Hero */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                        About <span className="gradient-text">Letuscrack</span>
                    </h1>
                    <p className="text-lg text-muted leading-relaxed">
                        Letuscrack is your comprehensive resource for mastering coding interview problems.
                        We provide clear, well-explained solutions in multiple programming languages to help
                        you succeed in technical interviews and become a better programmer.
                    </p>
                </div>

                {/* Mission */}
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Our Mission
                                </h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    We believe that understanding the "why" behind algorithms is just as important
                                    as knowing the "how". Our tutorials don't just show you the code – they explain
                                    the thought process, the trade-offs, and the patterns you can apply to similar problems.
                                </p>
                                <p className="text-muted leading-relaxed">
                                    Whether you're preparing for your first coding interview or brushing up on
                                    algorithms for a senior role, Letuscrack provides the explanations and practice
                                    you need to succeed.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <span className="text-2xl">📊</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-foreground">150+</div>
                                            <div className="text-sm text-muted">Tutorials</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                            <span className="text-2xl">💻</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-foreground">4</div>
                                            <div className="text-sm text-muted">Programming Languages</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-foreground">8</div>
                                            <div className="text-sm text-muted">Topic Categories</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                            Why Choose Letuscrack?
                        </h2>
                        <p className="text-muted">
                            Everything you need to master coding interviews
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="card text-center">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-16 px-8 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Explore our collection of tutorials and start mastering coding interview problems today.
                    </p>
                    <Link
                        href="/tutorials"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
                    >
                        Browse Tutorials
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </div>
        </div>
    );
}
