import { Suspense } from 'react';
import SearchContent from './SearchContent';

export const metadata = {
    title: 'Search',
    description: 'Search for coding tutorials, problems, and solutions.',
};

function SearchFallback() {
    return (
        <div className="py-8 lg:py-12">
            <div className="container">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Search Tutorials
                    </h1>
                    <p className="text-muted text-lg mb-8">
                        Find coding problems, topics, and solutions
                    </p>
                    <div className="skeleton h-16 w-full rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchFallback />}>
            <SearchContent />
        </Suspense>
    );
}
