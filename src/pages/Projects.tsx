import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: 'All', label: 'SEMUA / ALL' },
  { id: 'Architecture', label: 'ARCHITECTURE' },
  { id: 'Interior', label: 'INTERIOR' }
] as const;

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    
    return projects.filter((p: any) => {
      const cat = (p.category || '').toLowerCase();
      if (selectedCategory === 'Architecture') {
        return cat.includes('arch') || !cat.includes('interior');
      }
      if (selectedCategory === 'Interior') {
        return cat.includes('interior');
      }
      return true;
    });
  }, [projects, selectedCategory]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8]">
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40 md:pb-32 min-h-[80vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-12 hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <header className="mb-12 md:mb-16 text-center flex flex-col items-center">
            <span className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-4 block text-[#888]">
              Portfolio
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.1] tracking-tight mb-12">
              All Projects
            </h1>

            {/* Category Filter Pills */}
            {!loading && projects.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-gray-100/90 dark:bg-white/5 rounded-full border border-gray-200/80 dark:border-white/10 backdrop-blur-md max-w-fit mx-auto"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`relative px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 ${
                        isActive
                          ? 'text-white dark:text-black shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeProjectTab"
                          className="absolute inset-0 bg-black dark:bg-white rounded-full -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-t-2 border-[#222] dark:border-[#F8F8F8] rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center opacity-60 py-20 italic">
              No projects found in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link to={`/project/${project.id}`} className="group block">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-sm mb-6 bg-gray-100 dark:bg-white/5">
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-2xl font-serif mb-2">{project.title}</h3>
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#888] group-hover:text-current transition-colors">
                        View Project
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
