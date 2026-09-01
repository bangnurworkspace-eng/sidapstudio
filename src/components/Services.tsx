import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { ScrollReveal, ScrollRevealItem } from './ui/ScrollReveal';
import * as LucideIcons from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export function Services() {
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServicesData(data);
      } else {
        setServicesData([]);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  if (!loading && servicesData.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-24 md:py-32 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeading 
          subtitle={settings.servicesSubtitle || "Expertise"} 
          title={settings.servicesTitle || "Our Services"} 
        />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-16">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 border border-white/50 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl p-8 rounded-sm">
                 <Skeleton className="w-14 h-14 rounded-full mb-8" />
                 <Skeleton className="w-32 h-6 mb-4" />
                 <Skeleton className="w-full h-16" />
              </div>
            ))}
          </div>
        ) : (
          <ScrollReveal 
            staggerChildren={0.2}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-16"
          >
            {servicesData.map((service) => {
              // Get icon dynamically from string name, fallback to Layers
              const IconName = service.icon || 'Layers';
              const Icon = (LucideIcons as any)[IconName] || LucideIcons.Layers;
              
              return (
                <ScrollRevealItem key={service.id}>
                  <div
                    className="group h-full p-8 border border-white/50 border-b-white/20 border-r-white/20 dark:border-white/10 dark:border-t-white/20 dark:border-l-white/20 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 dark:hover:bg-white/[0.06] transition-all duration-500 rounded-sm relative overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 inline-block rounded-full shadow-sm text-light-accent dark:text-dark-accent group-hover:scale-110 transition-transform duration-500 border border-gray-200 dark:border-white/10 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-serif font-light mb-4 text-gray-900 dark:text-gray-100">{service.title}</h3>
                      <div 
                        className="text-light-secondary dark:text-dark-secondary font-light leading-[1.8] text-[13px] prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: service.description }}
                      />
                    </div>
                  </div>
                </ScrollRevealItem>
              );
            })}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
