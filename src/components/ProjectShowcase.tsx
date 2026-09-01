import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProjectShowcase() {
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    }, (err) => console.warn('Showcase settings listener error:', err));

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
      setLoading(false);
    }, (err) => {
      console.warn('Showcase projects listener error:', err);
      setProjects([]);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = projects.length - 1;
      if (nextIndex >= projects.length) nextIndex = 0;
      return nextIndex;
    });
  }, [projects.length]);

  useEffect(() => {
    if (loading || projects.length <= 1 || isPaused) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [loading, projects.length, isPaused, paginate]);

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) paginate(1);
    if (isRightSwipe) paginate(-1);
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
      };
    }
  };

  if (loading) {
    return (
      <section className="w-full h-[100dvh] bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  const currentProject = projects[currentIndex];

  return (
    <section 
      id="projects" 
      className="relative w-full h-[100dvh] bg-black overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", duration: 1, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 1 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Fullscreen Image */}
          <img 
            src={currentProject.image} 
            alt={currentProject.title}
            className="w-full h-full object-cover"
            loading={currentIndex === 0 ? "eager" : "lazy"}
          />
          
          {/* Cinematic Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Project Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24 z-10 translate-y-12">
            <div className="max-w-4xl w-full flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-8 leading-[1.1] tracking-tight">
                {currentProject.title}
              </h2>
              
              {!currentProject.id.startsWith('placeholder-') && (
                <Link 
                  to={`/project/${currentProject.id}`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-white/90 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all hover:gap-5"
                >
                  View Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-32 flex items-center justify-start px-4 md:px-8 z-20">
        <button 
          onClick={() => paginate(-1)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md text-white transition-all border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-20 md:w-32 flex items-center justify-end px-4 md:px-8 z-20">
        <button 
          onClick={() => paginate(1)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md text-white transition-all border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Next project"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center items-center gap-3 z-20">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              idx === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
