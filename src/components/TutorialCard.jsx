import Link from 'next/link';
import { Clock, Eye, ArrowRight } from 'lucide-react';

export default function TutorialCard({ tutorial, variant = 'default' }) {
    const difficultyColors = {
        easy: 'badge-easy',
        medium: 'badge-medium',
        hard: 'badge-hard',
    };

    const formatViews = (views) => {
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}k`;
        }
        return views;
    };

    const formatDate = (date) => {
        if (!date) return '';

        // Handle Firestore Timestamp
        const d = date?.toDate ? date.toDate() : new Date(date);

        // Check if date is valid
        if (isNaN(d.getTime())) return '';

        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (variant === 'compact') {
        return (
            <Link href={`/tutorials/${tutorial.slug}`} className="block group">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-card-hover transition-all">
                    <div className={`badge ${difficultyColors[tutorial.difficulty]}`}>
                        {tutorial.difficulty}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {tutorial.title}
                        </h4>
                        <p className="text-sm text-muted truncate">{tutorial.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/${tutorial.slug}`} className="block group h-full">
            <article className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                <div className="p-6 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tutorial.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            tutorial.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                            {tutorial.difficulty}
                        </span>
                        {tutorial.category && (
                            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                {tutorial.category}
                            </span>
                        )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-tight">
                        {tutorial.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {tutorial.description}
                    </p>

                    {/* Tags */}
                    {tutorial.tags && tutorial.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {tutorial.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-medium border border-slate-100"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(tutorial.publishedAt || tutorial.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" />
                                {formatViews(tutorial.views || 0)}
                            </span>
                        </div>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:-rotate-45">
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
