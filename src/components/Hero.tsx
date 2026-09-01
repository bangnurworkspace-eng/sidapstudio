import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ScrollReveal, ScrollRevealItem } from './ui/ScrollReveal';
import { Magnetic } from './ui/Magnetic';
import { Skeleton } from './ui/Skeleton';
import { OptimizedImage } from './ui/OptimizedImage';

export function Hero() {
  const [heroData, setHeroData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const y = useTransform(scrollY, [0, 1000], [0, prefersReducedMotion ? 0 : 300]);
  const opacity = useTransform(scrollY, [0, 800], [1, 0]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'hero', 'main'), (doc) => {
      if (doc.exists()) {
        setHeroData(doc.data());
      }
      setLoading(false);
    }, (err) => {
      console.warn('Hero listener error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const image = heroData?.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop";
  const title = heroData?.title || "Crafting spaces that inspire life.";
  const subtitle = heroData?.subtitle || "Architecture & Interior Design";
  const buttonText = heroData?.buttonText || "Discover Our Work";
  const buttonLink = heroData?.buttonLink || "#projects";

  return (
    <section ref={ref} className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Parallax effect */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="bg-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0"
          >
            <Skeleton className="w-full h-full rounded-none" />
          </motion.div>
        ) : (
          <motion.div 
            key="bg-image"
            initial={{ scale: prefersReducedMotion ? 1 : 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ y, opacity }}
            className="absolute inset-0 z-0"
          >
            <OptimizedImage
              src={image}
              alt={title}
              className="w-full h-full object-cover object-center"
              containerClassName="w-full h-full absolute inset-0"
              priority={true}
            />
            {/* Soft gradient overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 transition-colors duration-500" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="content-skeleton"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full"
            >
              <Skeleton className="h-8 w-40 rounded-full mb-6 bg-white/10" />
              <Skeleton className="h-24 md:h-32 lg:h-40 w-4/5 md:w-3/4 mb-8 bg-white/10" />
              <Skeleton className="h-12 w-48 rounded-full bg-white/10" />
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <ScrollReveal staggerChildren={0.2} delay={0.2} className="flex flex-col items-center">
                <ScrollRevealItem yOffset={20}>
                  <p className="uppercase tracking-[0.25em] text-[10px] md:text-[11px] mb-6 text-[#0F0F10] bg-[#D9C5B2] px-5 py-2 font-bold inline-block rounded-full shadow-lg">
                    {subtitle}
                  </p>
                </ScrollRevealItem>
                
                <ScrollRevealItem yOffset={30}>
                  <h1 className="text-[50px] md:text-[84px] lg:text-[120px] font-serif font-light leading-[1.05] tracking-tighter mb-8 text-balance drop-shadow-2xl">
                    {title}
                  </h1>
                </ScrollRevealItem>
                
                <ScrollRevealItem yOffset={20}>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Magnetic>
                      <a
                        href="/projects/architecture"
                        className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/40 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:-translate-y-1 uppercase tracking-[0.25em] text-[11px] font-bold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 text-white"
                      >
                        Architecture
                      </a>
                    </Magnetic>
                    <Magnetic>
                      <a
                        href="/projects/interior"
                        className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/40 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:-translate-y-1 uppercase tracking-[0.25em] text-[11px] font-bold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 text-white"
                      >
                        Interior
                      </a>
                    </Magnetic>
                  </div>
                </ScrollRevealItem>
              </ScrollReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
