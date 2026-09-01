import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { ScrollReveal, ScrollRevealItem } from './ui/ScrollReveal';
import { Skeleton } from './ui/Skeleton';
import { OptimizedImage } from './ui/OptimizedImage';

export function About() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'about', 'main'), (doc) => {
      if (doc.exists()) {
        setAboutData(doc.data());
      }
      setLoading(false);
    }, (err) => {
      console.warn('About listener error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const image = aboutData?.image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1932&auto=format&fit=crop";
  const title = aboutData?.title || "Designing for the senses.";
  const subtitle = aboutData?.subtitle || "The Studio";
  const description = aboutData?.description || "<p>Sidap Studio is an award-winning architecture and interior design practice dedicated to creating spaces of profound serenity and timeless elegance.</p><p>Founded on the belief that our environment shapes our wellbeing, we approach every project as an opportunity to sculpt light, material, and space into harmonious compositions.</p><p>From private residences to boutique hospitality, our work is defined by rigorous minimalism, textural richness, and an unwavering commitment to craftsmanship.</p>";
  const signature = aboutData?.signature || "Elena Rostova — Principal Architect";
  const signatureImage = aboutData?.signatureImage || "https://upload.wikimedia.org/wikipedia/commons/4/41/Signature_of_John_Hancock.svg";
  const yearsExp = aboutData?.yearsExp || 15;
  const projectsCount = aboutData?.projectsCount || 120;
  const awardsCount = aboutData?.awardsCount || 24;

  return (
    <section id="about" className="py-16 md:py-24 overflow-hidden border-t border-gray-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="about-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            >
              <div className="max-w-md w-full mx-auto lg:mx-0">
                <Skeleton className="aspect-square w-full" />
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-3 mt-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="about-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            >
              <motion.div
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -30, filter: prefersReducedMotion ? 'none' : 'blur(10px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] lg:aspect-square w-full max-w-md mx-auto lg:mx-0 border border-gray-200 dark:border-white/10 p-3 group"
              >
                <div className="w-full h-full overflow-hidden">
                  <OptimizedImage
                    src={image}
                    alt="Studio interior"
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />
                </div>
                {/* Decorative block */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gray-100 dark:bg-[#18181B] -z-10 hidden md:block border border-gray-200 dark:border-white/10 transition-transform duration-[2s] group-hover:translate-x-3 group-hover:translate-y-3" />
              </motion.div>

              <div className="flex flex-col justify-center">
                <SectionHeading subtitle={subtitle} title={title} align="left" />
                
                <ScrollReveal 
                  staggerChildren={0.2}
                  className="space-y-4 text-light-secondary dark:text-dark-secondary text-sm md:text-base font-light leading-[1.7] mt-6 prose-about"
                >
                  <ScrollRevealItem>
                    <div dangerouslySetInnerHTML={{ __html: description }} className="space-y-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic" />
                  </ScrollRevealItem>
                </ScrollReveal>

                <ScrollReveal
                  delay={0.3}
                  staggerChildren={0.2}
                  className="grid grid-cols-3 gap-4 md:gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-white/10"
                >
                  <ScrollRevealItem>
                    <div className="text-2xl md:text-3xl font-serif text-light-accent dark:text-dark-accent mb-1">
                      <AnimatedNumber value={yearsExp} suffix="+" />
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-light-secondary dark:text-dark-secondary">Years Exp.</div>
                  </ScrollRevealItem>
                  <ScrollRevealItem>
                    <div className="text-2xl md:text-3xl font-serif text-light-accent dark:text-dark-accent mb-1">
                      <AnimatedNumber value={projectsCount} suffix="+" />
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-light-secondary dark:text-dark-secondary">Projects</div>
                  </ScrollRevealItem>
                  <ScrollRevealItem>
                    <div className="text-2xl md:text-3xl font-serif text-light-accent dark:text-dark-accent mb-1">
                      <AnimatedNumber value={awardsCount} />
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-light-secondary dark:text-dark-secondary">Awards</div>
                  </ScrollRevealItem>
                </ScrollReveal>

                <ScrollReveal
                  delay={0.6}
                  className="mt-8"
                >
                  <img 
                    src={signatureImage} 
                    alt="Founder Signature" 
                    className="h-10 w-auto opacity-40 dark:invert transition-opacity hover:opacity-100" 
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="mt-4 text-[9px] font-bold tracking-[0.2em] uppercase text-light-secondary dark:text-dark-secondary">{signature}</p>
                </ScrollReveal>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
