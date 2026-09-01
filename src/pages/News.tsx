import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowRight, Search, Newspaper, Sparkles, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  summary?: string;
  description?: string;
  content?: string;
  image?: string;
  location?: string;
  year?: string;
  author?: string;
  createdAt?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  isProject?: boolean;
}

export function News() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch news collection ONLY
    const qNews = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubNews = onSnapshot(
      qNews, 
      (newsSnap) => {
        const newsData: ArticleItem[] = newsSnap.docs
          .map(doc => ({ id: doc.id, isProject: false, ...doc.data() } as ArticleItem))
          .filter(item => item.isPublished !== false);

        setArticles(newsData);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching news:', err);
        setArticles([]);
        setLoading(false);
      }
    );

    return () => unsubNews();
  }, []);

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find(a => a.isFeatured) || filteredArticles[0];
  const listArticles = featuredArticle ? filteredArticles.filter(a => a.id !== featuredArticle.id) : filteredArticles;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8]">
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40 md:pb-32 min-h-[85vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Header Section */}
          <header className="mb-16 md:mb-20 text-center flex flex-col items-center">
            <span className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-4 block text-[#888]">
              Editorial & Studio Updates
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.1] tracking-tight mb-6">
              News & Stories
            </h1>
            <p className="max-w-xl text-base md:text-lg font-light text-[#666] dark:text-[#999] leading-relaxed">
              Explore our latest studio announcements, architectural insights, and articles from our team.
            </p>
          </header>

          {/* Search & Category Filter Bar */}
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-200 dark:border-white/10">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md shadow-black/5 dark:shadow-white/5 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-white/5 text-[#666] dark:text-[#AAA] hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search news & articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#111] outline-none text-xs transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-10 h-10 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs uppercase tracking-widest text-gray-400">Loading stories...</span>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-12">
              <Newspaper className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-serif mb-2">No Stories Found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                No news articles match your current search criteria. Try choosing another category or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              
              {/* Featured Spotlight Article (if available on page 1 of search) */}
              {featuredArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="group relative"
                >
                  <Link 
                    to={`/news/${featuredArticle.id}`} 
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-gray-50 dark:bg-white/[0.02] p-6 lg:p-10 rounded-3xl border border-gray-200/80 dark:border-white/10 hover:border-black dark:hover:border-white/30 transition-all duration-500 shadow-sm hover:shadow-xl"
                  >
                    <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-200 dark:bg-white/5">
                      {featuredArticle.image ? (
                        <img
                          src={featuredArticle.image}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Newspaper className="w-12 h-12 opacity-30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Featured Story
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                      <div className="flex items-center gap-3 text-xs text-[#888]">
                        <span className="font-bold uppercase tracking-widest text-black dark:text-white">
                          {featuredArticle.category}
                        </span>
                        <span>•</span>
                        <span>
                          {featuredArticle.createdAt ? new Date(featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light leading-snug group-hover:opacity-80 transition-opacity">
                        {featuredArticle.title}
                      </h2>

                      {featuredArticle.summary && (
                        <p className="text-sm md:text-base font-light text-[#555] dark:text-[#AAA] leading-relaxed line-clamp-3">
                          {featuredArticle.summary}
                        </p>
                      )}

                      <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black dark:text-white group-hover:translate-x-1 transition-transform">
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid of Remaining Articles */}
              {listArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                  <AnimatePresence>
                    {listArticles.map((article, idx) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.5 }}
                        className="group flex flex-col"
                      >
                        <Link to={`/news/${article.id}`} className="flex flex-col h-full">
                          {/* Image */}
                          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6 bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            {article.image ? (
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Newspaper className="w-10 h-10 opacity-30" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                              {article.category}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-2 text-[11px] text-[#888] mb-2 uppercase tracking-wider">
                            <span>
                              {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Editorial'}
                            </span>
                            {article.location && (
                              <>
                                <span>•</span>
                                <span>{article.location}</span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-xl md:text-2xl font-serif font-light mb-3 line-clamp-2 leading-snug group-hover:opacity-80 transition-opacity">
                            {article.title}
                          </h3>

                          {/* Summary */}
                          {article.summary && (
                            <p className="text-xs md:text-sm font-light text-[#666] dark:text-[#AAA] leading-relaxed line-clamp-2 mb-6 flex-1">
                              {article.summary}
                            </p>
                          )}

                          {/* Action Link */}
                          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black dark:text-white group-hover:translate-x-1 transition-transform mt-auto pt-2">
                            <span>Read Article</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

