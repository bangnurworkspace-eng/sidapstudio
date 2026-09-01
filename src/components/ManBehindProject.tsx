import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { teamMembers as defaultTeam } from '../data';
import { TeamMember } from '../types';
import { ChevronLeft, ChevronRight, Mail, Globe, Quote, Sparkles, ExternalLink, Share2 } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export function ManBehindProject() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    }, (err) => console.warn('Team settings listener error:', err));

    const q = query(collection(db, 'team'), orderBy('order', 'asc'));
    const unsubTeam = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
        setTeam(data);
        setCurrentIndex(prev => (prev >= data.length ? Math.max(0, data.length - 1) : prev));
      } else {
        setTeam([]);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Team collection listener error:', err);
      setTeam([]);
      setLoading(false);
    });

    return () => {
      unsubTeam();
      unsubSettings();
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (team.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % team.length);
    }, 6500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [team.length, isPaused, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? team.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % team.length);
  };

  if (!loading && team.length === 0) {
    return null;
  }

  const currentMember = team[currentIndex] || team[0];

  return (
    <section 
      id="team" 
      className="py-24 md:py-32 border-t border-gray-200 dark:border-white/10 relative overflow-hidden bg-gray-50/50 dark:bg-black/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-light-accent/5 dark:bg-dark-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-gray-400/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          subtitle={settings.teamSubtitle || "Minds & Architects"} 
          title={settings.teamTitle || "Man Behind The Project"} 
        />

        {loading ? (
          <div className="mt-12 bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 aspect-[4/5] rounded-xl overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-3/4 h-10" />
              <Skeleton className="w-full h-24" />
              <Skeleton className="w-1/2 h-8" />
            </div>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No profile data available.</div>
        ) : (
          <div className="mt-12">
            {/* Main Showcase Slide */}
            <div className="bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden relative backdrop-blur-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
                
                {/* Left Column: Portrait Image */}
                <div className="lg:col-span-5 relative bg-gray-100 dark:bg-black/60 overflow-hidden group aspect-[4/5] w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMember?.id || currentIndex}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full relative"
                    >
                      <img
                        src={currentMember?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop'}
                        alt={currentMember?.name || 'Architect'}
                        className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
                      
                      {/* Mobile Overlay Name */}
                      <div className="absolute bottom-4 left-6 right-6 lg:hidden text-white">
                        <span className="text-xs uppercase tracking-widest text-light-accent dark:text-dark-accent font-semibold">{currentMember?.role}</span>
                        <h3 className="text-2xl font-bold">{currentMember?.name}</h3>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Corner Accent Badge */}
                  <div className="absolute top-6 left-6 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-xs font-semibold text-black dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-light-accent dark:text-dark-accent" />
                    <span>Sidap Architect</span>
                  </div>
                </div>

                {/* Right Column: Bio, Philosophy, Details */}
                <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-between relative bg-white dark:bg-[#121214]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMember?.id || currentIndex}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6"
                    >
                      {/* Role & Number */}
                      <div className="flex items-center justify-between">
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent border border-light-accent/20 dark:border-dark-accent/20">
                          {currentMember?.role}
                        </span>
                        <div className="text-xs font-mono font-medium text-gray-400 dark:text-gray-500">
                          {String(currentIndex + 1).padStart(2, '0')} / {String(team.length).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white">
                          {currentMember?.name}
                        </h3>
                      </div>

                      {/* Quote / Philosophy */}
                      {currentMember?.quote && (
                        <div className="relative pl-6 border-l-2 border-light-accent dark:border-dark-accent py-1">
                          <Quote className="w-5 h-5 text-gray-300 dark:text-gray-700 absolute -top-2 left-0 -translate-x-1/2 bg-white dark:bg-[#121214]" />
                          <p className="text-base md:text-lg italic font-serif text-gray-700 dark:text-gray-300 leading-relaxed">
                            "{currentMember.quote}"
                          </p>
                        </div>
                      )}

                      {/* Bio */}
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                        {currentMember?.bio}
                      </p>

                      {/* Specialties / Highlights */}
                      {currentMember?.specialties && currentMember.specialties.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            Core Expertise & Focus
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {currentMember.specialties.map((spec, i) => (
                              <span 
                                key={i}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-white/5"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social & Contact Links */}
                      {currentMember?.socials && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                          {currentMember.socials.instagram && (
                            <a
                              href={currentMember.socials.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${currentMember.name} Social profile`}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                              title="Instagram / Social"
                            >
                              <Share2 className="w-4 h-4" />
                            </a>
                          )}
                          {currentMember.socials.linkedin && (
                            <a
                              href={currentMember.socials.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${currentMember.name} Professional profile`}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                              title="LinkedIn / Professional"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {currentMember.socials.email && (
                            <a
                              href={`mailto:${currentMember.socials.email}`}
                              aria-label={`Email ${currentMember.name}`}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {currentMember.socials.portfolio && (
                            <a
                              href={currentMember.socials.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${currentMember.name} Website`}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                              title="Personal Portfolio"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Slider Controls Bottom Bar */}
                  <div className="pt-8 mt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    {/* Pagination Dots */}
                    <div className="flex items-center gap-2">
                      {team.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentIndex === idx 
                              ? 'w-8 bg-black dark:bg-white' 
                              : 'w-2 bg-gray-200 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        aria-label="Previous profile"
                        className="w-11 h-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        aria-label="Next profile"
                        className="w-11 h-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Thumbnail Preview Strip below */}
            {team.length > 1 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {team.map((member, idx) => (
                  <button
                    key={member.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`text-left p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                      currentIndex === idx
                        ? 'bg-white dark:bg-[#18181B] border-black/40 dark:border-white/40 shadow-sm'
                        : 'bg-white/40 dark:bg-white/[0.02] border-transparent hover:border-gray-200 dark:hover:border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-12 aspect-[4/5] rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-black dark:text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {member.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
