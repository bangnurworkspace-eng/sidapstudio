import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from './ui/Skeleton';
import { ChevronDown, Check, ArrowUpRight } from 'lucide-react';

interface GalleryProjectImage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  category: string;
  location?: string;
  year?: string;
}

const CATEGORIES = [
  { id: 'All', label: 'SEMUA / ALL' },
  { id: 'Architecture', label: 'ARCHITECTURE' },
  { id: 'Interior', label: 'INTERIOR' }
] as const;

const INITIAL_DISPLAY_COUNT = 6;
const LOAD_MORE_STEP = 6;

export function Gallery() {
  const [items, setItems] = useState<GalleryProjectImage[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_DISPLAY_COUNT);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    // 2. Fetch directly from projects to showcase project images
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let extractedImages: GalleryProjectImage[] = [];

        if (!snapshot.empty) {
          snapshot.docs.forEach((d) => {
            const data = d.data();
            const projId = d.id;
            const title = data.title || 'Untitled Project';
            const category = data.category || 'Architecture';
            const location = data.location || '';
            const year = data.year || '';

            // Main project cover image
            if (data.image) {
              extractedImages.push({
                id: `${projId}-main`,
                projectId: projId,
                url: data.image,
                title,
                category,
                location,
                year
              });
            }

            // Additional gallery images inside the project
            if (Array.isArray(data.gallery)) {
              data.gallery.forEach((url: string, gIdx: number) => {
                if (url && url !== data.image) {
                  extractedImages.push({
                    id: `${projId}-gal-${gIdx}`,
                    projectId: projId,
                    url,
                    title,
                    category,
                    location,
                    year
                  });
                }
              });
            }
          });
        }

        setItems(extractedImages);
        setLoading(false);
      },
      (err) => {
        console.warn('Projects snapshot error:', err);
        setItems([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  // Filter items by category
  const filteredImages = useMemo(() => {
    if (selectedCategory === 'All') return items;

    return items.filter((img) => {
      const cat = (img.category || '').toLowerCase();
      if (selectedCategory === 'Architecture') {
        return cat.includes('arch') || !cat.includes('interior');
      }
      if (selectedCategory === 'Interior') {
        return cat.includes('interior');
      }
      return true;
    });
  }, [items, selectedCategory]);

  // Sliced items for "Load More"
  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      All: items.length,
      Architecture: 0,
      Interior: 0
    };

    items.forEach((img) => {
      const cat = (img.category || '').toLowerCase();
      if (cat.includes('interior')) {
        counts.Interior += 1;
      }
      if (cat.includes('arch') || !cat.includes('interior')) {
        counts.Architecture += 1;
      }
    });

    return counts;
  }, [items]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  };

  const handleNavigateToProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const hasMore = visibleCount < filteredImages.length;
  const remainingCount = Math.max(0, filteredImages.length - visibleCount);

  return (
    <section id="gallery" className="py-24 md:py-32 border-t border-gray-200 dark:border-white/10 min-h-[800px] bg-white dark:bg-[#0c0c0d] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Centralized Header Section */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="uppercase tracking-[0.25em] text-[10px] font-bold text-light-accent dark:text-dark-accent mb-4 bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-sm inline-block"
          >
            {settings.gallerySubtitle || "VISUAL ARCHIVE"}
          </motion.p>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-tight text-black dark:text-white mb-8"
          >
            {settings.galleryTitle || "Gallery"}
          </motion.h2>

          {/* Centralized Category Filter Pills */}
          {!loading && items.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-gray-100/90 dark:bg-white/5 rounded-full border border-gray-200/80 dark:border-white/10 backdrop-blur-md max-w-fit mx-auto"
            >
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`relative px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'text-white dark:text-black shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGalleryTab"
                        className="absolute inset-0 bg-black dark:bg-white rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black font-extrabold'
                          : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Gallery Image Grid */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="gallery-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
              >
                {[64, 80, 72, 96, 60, 80].map((h, i) => (
                  <Skeleton key={i} className="w-full rounded-sm" style={{ height: `${h / 4}rem` }} />
                ))}
              </motion.div>
            ) : filteredImages.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-24 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02]"
              >
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Tidak ada foto proyek dalam kategori <span className="font-bold text-black dark:text-white">"{selectedCategory}"</span>.
                </p>
                <button
                  onClick={() => handleCategoryChange('All')}
                  className="mt-4 px-6 py-2.5 text-xs font-bold tracking-widest uppercase bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-80 transition-opacity"
                >
                  Tampilkan Semua Foto
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`gallery-${selectedCategory}-${visibleCount}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {displayedImages.map((image, i) => {
                    const isInterior = (image.category || '').toLowerCase().includes('interior');
                    const categoryDisplay = isInterior ? 'INTERIOR' : 'ARCHITECTURE';

                    return (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: (i % 6) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="break-inside-avoid"
                      >
                        <div
                          className="relative overflow-hidden rounded-sm group cursor-pointer border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5"
                          onClick={() => handleNavigateToProject(image.projectId)}
                        >
                          <div className="relative w-full h-auto">
                            <div className="absolute inset-0 bg-gray-200 dark:bg-white/5 animate-pulse" />
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-auto object-cover relative z-10 opacity-0 transition-all duration-700 group-hover:scale-105"
                              onLoad={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>

                          {/* Hover Overlay linking directly to Project */}
                          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-6">
                            
                            {/* Top Category Badge */}
                            <div className="self-end translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-500">
                              <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                                {categoryDisplay}
                              </span>
                            </div>

                            {/* Bottom Project Title & CTA */}
                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              <span className="block text-white text-base md:text-lg font-serif font-medium tracking-tight mb-1">
                                {image.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80 group-hover:text-white">
                                <span>Lihat Project</span>
                                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Load More & Counter Footer */}
        {!loading && filteredImages.length > 0 && (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 border-t border-gray-100 dark:border-white/5 pt-10">
            
            {/* Progress Text */}
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400">
              Menampilkan <span className="text-black dark:text-white font-bold">{displayedImages.length}</span> dari <span className="text-black dark:text-white font-bold">{filteredImages.length}</span> foto
            </p>

            {/* Load More Button */}
            {hasMore ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadMore}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300 shadow-lg shadow-black/5 dark:shadow-white/5"
              >
                <span>Load More</span>
                <span className="text-[11px] opacity-75 font-normal">
                  (+{Math.min(LOAD_MORE_STEP, remainingCount)})
                </span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </motion.button>
            ) : filteredImages.length > INITIAL_DISPLAY_COUNT ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 py-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Semua foto dalam kategori ini telah dimuat</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
