import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Check, Mail, Phone, MapPin } from 'lucide-react';
import { ScrollReveal, ScrollRevealItem } from './ui/ScrollReveal';
import { Magnetic } from './ui/Magnetic';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState<any>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists()) setContactInfo(doc.data());
    }, (err) => console.warn('Contact listener error:', err));
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill out all fields.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting form', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionHeading 
          subtitle={contactInfo.subtitle || "Inquiries"} 
          title={contactInfo.title || "Let's build together."} 
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-12">
          
          {/* Contact Form */}
          <ScrollReveal className="lg:col-span-3 space-y-8 relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div role="alert" className="absolute -top-12 left-0 right-0 text-center text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScrollRevealItem className="space-y-2">
                  <label htmlFor="name" className="text-[10px] uppercase tracking-[0.25em] text-light-secondary dark:text-dark-secondary font-bold">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-lg font-light text-black dark:text-white"
                    placeholder="John Doe"
                  />
                </ScrollRevealItem>
                
                <ScrollRevealItem className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-[0.25em] text-light-secondary dark:text-dark-secondary font-bold">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-lg font-light text-black dark:text-white"
                    placeholder="john@example.com"
                  />
                </ScrollRevealItem>
              </div>
              
              <ScrollRevealItem className="space-y-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-[0.25em] text-light-secondary dark:text-dark-secondary font-bold">Message</label>
                <textarea 
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-lg font-light resize-none text-black dark:text-white"
                  placeholder="Tell us about your project..."
                />
              </ScrollRevealItem>

              <ScrollRevealItem className="pt-8 flex">
                <Magnetic>
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting || isSuccess}
                    whileHover={isSubmitting || isSuccess ? {} : { y: -4 }}
                    whileTap={isSubmitting || isSuccess ? {} : { scale: 0.95 }}
                    className="px-12 py-4 bg-black text-white dark:bg-white dark:text-black uppercase tracking-[0.25em] text-[11px] font-bold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-transparent hover:border-gray-400/50 dark:hover:border-white/30 hover:shadow-lg relative overflow-hidden group disabled:opacity-80 inline-block rounded-md"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                      ) : isSuccess ? (
                        <>
                          <Check className="w-4 h-4" /> Sent Successfully
                        </>
                      ) : 'Send Inquiry'}
                    </span>
                    {!(isSubmitting || isSuccess) && (
                      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    )}
                  </motion.button>
                </Magnetic>
              </ScrollRevealItem>
            </form>
          </ScrollReveal>

          {/* Contact Info & Map */}
          <ScrollReveal className="lg:col-span-2 space-y-12 lg:pl-12 lg:border-l border-gray-200 dark:border-white/10 pt-12 lg:pt-0">
            <div className="space-y-8">
              {(contactInfo.email || contactInfo.phone || contactInfo.address) && (
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-light-secondary dark:text-dark-secondary">Contact Details</h3>
                  <div className="space-y-4 text-black dark:text-white font-light text-sm">
                    {contactInfo.email && (
                      <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a href={`mailto:${contactInfo.email}`} className="hover:opacity-70 transition-opacity">{contactInfo.email}</a>
                      </div>
                    )}
                    {contactInfo.phone && (
                      <div className="flex items-center gap-4">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${contactInfo.phone}`} className="hover:opacity-70 transition-opacity">{contactInfo.phone}</a>
                      </div>
                    )}
                    {contactInfo.address && (
                      <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{contactInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
