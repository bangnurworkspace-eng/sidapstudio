import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScrollReveal, ScrollRevealItem } from './ui/ScrollReveal';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Footer() {
  const [footerData, setFooterData] = useState({
    logoText: 'Sidap Studio',
    description: 'Creating spaces of profound serenity and timeless elegance. Architecture and interior design for the modern world.',
    copyright: `© ${new Date().getFullYear()} Sidap Studio. All rights reserved.`,
    privacyLink: '#',
    termsLink: '#'
  });

  const [contactData, setContactData] = useState<any>({});

  useEffect(() => {
    const unsubFooter = onSnapshot(doc(db, 'settings', 'footer'), (doc) => {
      if (doc.exists()) setFooterData(doc.data() as any);
    }, (err) => console.warn('Footer listener error:', err));
    const unsubContact = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists()) setContactData(doc.data() as any);
    }, (err) => console.warn('Contact settings listener error:', err));
    return () => {
      unsubFooter();
      unsubContact();
    };
  }, []);

  return (
    <footer className="bg-light-bg dark:bg-dark-bg pt-24 pb-12 border-t border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <ScrollReveal staggerChildren={0.2} className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <ScrollRevealItem className="col-span-1 md:col-span-2">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-light tracking-tight mb-6">{footerData.logoText}</h2>
            <p className="text-light-secondary dark:text-dark-secondary font-light max-w-sm text-sm md:text-base leading-[1.8]">
              {footerData.description}
            </p>
          </ScrollRevealItem>
          
          <ScrollRevealItem>
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold mb-6">Studio</h3>
            <ul className="space-y-4 text-light-secondary dark:text-dark-secondary font-light text-[11px] uppercase tracking-widest">
              <li><a href="#about" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">About Us</a></li>
              <li><a href="#projects" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">Projects</a></li>
              <li><a href="#services" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">Services</a></li>
              <li><a href="#gallery" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">Gallery</a></li>
            </ul>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold mb-6">Connect</h3>
            <ul className="space-y-4 text-light-secondary dark:text-dark-secondary font-light text-[11px] uppercase tracking-widest">
              {contactData.whatsapp ? (
                <li><a href={`https://wa.me/${contactData.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">WhatsApp</a></li>
              ) : (
                <li><a href="#" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">WhatsApp</a></li>
              )}
              {contactData.instagram && (
                <li><a href={contactData.instagram} target="_blank" rel="noopener noreferrer" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">Instagram</a></li>
              )}
              {contactData.linkedin && (
                <li><a href={contactData.linkedin} target="_blank" rel="noopener noreferrer" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">LinkedIn</a></li>
              )}
              {contactData.twitter && (
                <li><a href={contactData.twitter} target="_blank" rel="noopener noreferrer" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">Twitter</a></li>
              )}
              <li><a href="#contact" className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-all inline-block pb-1">Contact</a></li>
            </ul>
          </ScrollRevealItem>
        </ScrollReveal>

        <ScrollReveal 
          delay={0.6}
          className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-light-secondary dark:text-dark-secondary"
        >
          <p>{footerData.copyright}</p>
          <div className="flex gap-6">
            <a href={footerData.privacyLink} className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-colors pb-1">Privacy Policy</a>
            <a href={footerData.termsLink} className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-500 after:bg-current hover:text-black dark:hover:text-white transition-colors pb-1">Terms of Service</a>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
