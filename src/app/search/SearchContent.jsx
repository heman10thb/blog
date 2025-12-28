'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import TutorialCard from '@/components/TutorialCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [allTutorials, setAllTutorials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all published tutorials on mount for client-side search
    useEffect(() => {
        const fetchTutorials = async () => {
            try {
                const q = query(collection(db, 'tutorials'), where('status', '==', 'published'));
                const snapshot = await getDocs(q);
                const tutorials = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllTutorials(tutorials);

                // If there's an initial query, search immediately after fetching
                if (initialQuery) {
                    performSearch(initialQuery, tutorials);
                }
            } catch (error) {
                console.error('Error fetching tutorials for search:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTutorials();
    }, []);

    const performSearch = (term, tutorialsToSearch = allTutorials) => {
        if (!term.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const lowerTerm = term.toLowerCase().trim();
        const searchResults = tutorialsToSearch.filter(tutorial => {
            return (
                tutorial.title?.toLowerCase().includes(lowerTerm) ||
                tutorial.description?.toLowerCase().includes(lowerTerm) ||
                tutorial.tags?.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
                tutorial.category?.toLowerCase().includes(lowerTerm)
            );
        });

        setResults(searchResults);
        setHasSearched(true);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery);
            // Update URL without refresh
            window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setResults([]);
        setHasSearched(false);
        window.history.pushState({}, '', '/search');
    };

    return (
        <div className="py-8 lg:py-12">
            <div className="container">
                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Search Tutorials
                    </h1>
                    <p className="text-muted text-lg mb-8">
                        Find coding problems, topics, and solutions
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light" />
                        <input
                            type="text"
                            placeholder="Search for problems, topics, or concepts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-14 py-4 rounded-2xl border-2 border-border bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Results */}
                {hasSearched ? (
                    <div>
                        <p className="text-muted mb-6">
                            {results.length > 0 ? (
                                <>Found <strong className="text-foreground">{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "<strong className="text-foreground">{initialQuery || searchQuery}</strong>"</>
                            ) : (
                                <>No results found for "<strong className="text-foreground">{initialQuery || searchQuery}</strong>"</>
                            )}
                        </p>

                        {results.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((tutorial) => (
                                    <TutorialCard key={tutorial.id} tutorial={tutorial} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 rounded-xl bg-slate-50 border border-border">
                                <p className="text-muted text-lg mb-4">
                                    Try searching for different keywords
                                </p>
                                <p className="text-sm text-muted-light">
                                    Popular searches: array, linked list, dynamic programming, tree
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted text-lg">
                            Enter a search term to find tutorials
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {['array', 'linked list', 'stack', 'tree', 'dynamic programming'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setSearchQuery(term);
                                        performSearch(term);
                                        window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
                                    }}
                                    className="px-4 py-2 bg-slate-100 hover:bg-primary/10 hover:text-primary rounded-lg text-sm font-medium transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
