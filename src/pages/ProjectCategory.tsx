import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ProjectCategory() {
  const { category } = useParams<{ category: string }>();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalize category name for display
  const displayCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Projects';

  useEffect(() => {
    window.scrollTo(0, 0);
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter by category (case-insensitive)
      const filtered = data.filter((p: any) => 
        p.category && p.category.toLowerCase() === category?.toLowerCase()
      );
      
      setProjects(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8]">
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40 md:pb-32 min-h-[80vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-12 hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <header className="mb-16 md:mb-24 text-center flex flex-col items-center">
            <span className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-4 block text-[#888]">
              Category
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light leading-[1.1] tracking-tight">
              {displayCategory} Projects
            </h1>
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-t-2 border-[#222] dark:border-[#F8F8F8] rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center opacity-60 py-20 italic">
              No projects found in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <AnimatePresence>
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    <Link to={`/project/${project.id}`} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 bg-gray-100 dark:bg-white/5">
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
