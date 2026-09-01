import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { ScrollReveal, ScrollRevealItem } from './ui/ScrollReveal';
import { Skeleton } from './ui/Skeleton';

export function Testimonials() {
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    const q = query(collection(db, 'testimonials'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTestimonialsData(data);
      } else {
        setTestimonialsData([]);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  if (!loading && testimonialsData.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeading 
          subtitle={settings.testimonialsSubtitle || "Client Words"} 
          title={settings.testimonialsTitle || "Testimonials"} 
        />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 border border-white/50 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl p-12 flex flex-col items-center justify-center">
                 <Skeleton className="w-16 h-16 rounded-full mb-6" />
                 <Skeleton className="w-full h-24 mb-8" />
                 <Skeleton className="w-32 h-4 mb-2" />
                 <Skeleton className="w-24 h-4" />
              </div>
            ))}
          </div>
        ) : (
          <ScrollReveal staggerChildren={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {testimonialsData.map((testimonial) => (
              <ScrollRevealItem key={testimonial.id} className="h-full">
                <div
                  className="group flex flex-col text-center items-center h-full p-12 border border-white/50 border-b-white/20 border-r-white/20 dark:border-white/10 dark:border-t-white/20 dark:border-l-white/20 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="text-6xl font-serif text-light-accent dark:text-dark-accent mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">"</div>
                  
                  <div className="prose prose-sm dark:prose-invert prose-p:font-serif prose-p:font-light prose-p:italic prose-p:text-lg md:prose-p:text-xl prose-p:leading-[1.8] text-gray-700 dark:text-gray-300 flex-grow relative z-10">
                    <div dangerouslySetInnerHTML={{ __html: testimonial.quote }} />
                  </div>
                  
                  <div className="mt-8 relative z-10 border-t border-gray-200 dark:border-white/10 pt-6 w-full">
                    <p className="font-bold text-[10px] tracking-[0.25em] uppercase">{testimonial.author}</p>
                    <p className="text-[11px] text-light-secondary dark:text-dark-secondary mt-1 tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
