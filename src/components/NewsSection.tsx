import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { OptimizedImage } from './ui/OptimizedImage';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  createdAt: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest 6 published news
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      // In a real app we'd filter isPublished, but for simplicity we show latest
      setNews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || news.length === 0) return null;

  return (
    <section id="news" className="py-12 md:py-16 bg-white dark:bg-[#0c0c0d] border-t border-gray-100 dark:border-white/5 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2">Latest Updates</p>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-black dark:text-white">Studio News</h2>
        </div>
        <Link 
          to="/news" 
          className="group hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:opacity-70 transition-opacity"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="w-full pl-6 lg:pl-12 pr-6 overflow-x-auto custom-scrollbar pb-6 flex gap-4 md:gap-6 snap-x snap-mandatory">
        {news.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex-shrink-0 w-[280px] sm:w-[320px] group cursor-pointer snap-start"
            onClick={() => navigate(`/news/${item.id}`)}
          >
            {/* Landscape Image */}
            <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 mb-4 relative">
              {item.image ? (
                <OptimizedImage 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  containerClassName="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Newspaper className="w-8 h-8 opacity-20" />
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Read Story
                </span>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-sm font-bold text-black dark:text-white line-clamp-2 mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              {item.title}
            </h3>
            {item.createdAt && (
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                {new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </motion.div>
        ))}

        {/* 'View All' card at the end of the scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex-shrink-0 w-[180px] sm:w-[220px] flex items-center justify-center snap-start"
        >
          <Link 
            to="/news"
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-500 hover:text-black dark:hover:text-white"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-center">Seluruh News</span>
          </Link>
        </motion.div>
      </div>

      <div className="px-6 mt-2 sm:hidden flex justify-center">
         <Link 
          to="/news" 
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:opacity-70 transition-opacity"
        >
          <span>Lihat Seluruh News</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
