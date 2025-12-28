import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CategoryCard({ category }) {
    return (
        <Link href={`/categories/${category.slug}`} className="block group">
            <div
                className="card h-full flex flex-col"
                style={{ '--category-color': category.color }}
            >
                {/* Icon */}
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ backgroundColor: `${category.color}15` }}
                >
                    {category.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {category.name}
                </h3>
                <p className="text-muted text-sm line-clamp-2 mb-4 flex-1">
                    {category.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: category.color }}>
                        {category.tutorialCount} tutorials
                    </span>
                    <ArrowRight
                        className="w-4 h-4 text-muted group-hover:translate-x-1 transition-all"
                        style={{ color: category.color }}
                    />
                </div>
            </div>
        </Link>
    );
}
