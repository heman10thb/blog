'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles, BookOpen, Code2, Zap, RefreshCw } from 'lucide-react';
import TutorialCard from '@/components/TutorialCard';
import CategoryCard from '@/components/CategoryCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const [featuredTutorials, setFeaturedTutorials] = useState([]);
  const [recentTutorials, setRecentTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tutorials: 0, categories: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all tutorials (no where clause to avoid index requirement)
        const tutorialsSnapshot = await getDocs(collection(db, 'tutorials'));
        let allTutorials = tutorialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter to published only on client side
        allTutorials = allTutorials.filter(t => t.status === 'published');

        // Sort by createdAt descending
        allTutorials.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        console.log('Fetched tutorials from Firebase:', allTutorials.length);

        // Featured tutorials (featured flag or first 3)
        const featured = allTutorials.filter(t => t.featured).slice(0, 3);
        setFeaturedTutorials(featured.length > 0 ? featured : allTutorials.slice(0, 3));

        // Recent tutorials (last 4)
        setRecentTutorials(allTutorials.slice(0, 4));

        // Fetch categories
        try {
          const categoriesSnapshot = await getDocs(collection(db, 'categories'));

          if (categoriesSnapshot.empty) {
            setCategories([]);
          } else {
            let cats = categoriesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            cats.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(cats);
          }
        } catch (catError) {
          console.error('Error fetching categories:', catError);
          setCategories([]);
        }

        // Stats
        setStats({
          tutorials: allTutorials.length,
          categories: categories.length
        });

      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
        setFeaturedTutorials([]);
        setRecentTutorials([]);
        setCategories([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Master coding interviews with confidence</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Crack Any Coding
              <span className="gradient-text block">Interview Problem</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto">
              Clear explanations, multiple language solutions, and step-by-step approaches
              to help you master data structures and algorithms.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-10">
              <Link href="/search" className="block">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light group-hover:text-primary transition-colors" />
                  <div className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-border bg-white shadow-lg shadow-primary/5 group-hover:border-primary/50 transition-all text-left text-muted">
                    Search for problems, topics, or concepts...
                  </div>
                </div>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tutorials" className="btn btn-primary">
                <BookOpen className="w-4 h-4" />
                Browse All Tutorials
              </Link>
              <Link href="/categories" className="btn btn-secondary">
                Explore Categories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${stats.tutorials || '0'}`, label: 'Tutorials', icon: BookOpen },
              { value: `${categories.length || '0'}`, label: 'Categories', icon: Code2 },
              { value: '4', label: 'Languages', icon: Zap },
              { value: '50k+', label: 'Monthly Readers', icon: Sparkles },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Featured Tutorials
              </h2>
              <p className="text-muted">Popular problems to get you started</p>
            </div>
            <Link href="/tutorials" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-muted">Loading tutorials...</p>
            </div>
          ) : featuredTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted">
              <p>No published tutorials yet. Check back soon!</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/tutorials" className="btn btn-secondary">
              View All Tutorials
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Browse by Category
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Explore tutorials organized by topic to focus your learning
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/categories" className="btn btn-primary">
              View All Categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Tutorials */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Recently Added
              </h2>
              <p className="text-muted">Latest tutorials and solutions</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
            </div>
          ) : recentTutorials.length > 0 ? (
            <div className="space-y-4">
              {recentTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <p>No recent tutorials yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-dark">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Crack Your Next Interview?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Start practicing with our comprehensive collection of coding problems and solutions.
            </p>
            <Link href="/tutorials" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-colors">
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
