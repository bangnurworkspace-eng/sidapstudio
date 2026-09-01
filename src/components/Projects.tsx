import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SectionHeading } from './SectionHeading';
import { useNavigate, Link } from 'react-router-dom';
import { Skeleton } from './ui/Skeleton';
import { ArrowRight } from 'lucide-react';

const ProjectItem: React.FC<{ project: any; index: number; onClick: () => void; }> = ({ project, index, onClick }) => {
  return (
    <div 
      className="relative flex-shrink-0 w-[320px] md:w-[480px] aspect-[16/9] overflow-hidden rounded-sm group cursor-pointer border border-gray-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-white/10"
      onClick={onClick}
    >
      <img 
        src={project.image} 
        alt={project.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
        <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">{project.category}</span>
        <h3 className="text-white text-xl md:text-2xl font-serif">{project.title}</h3>
      </div>
    </div>
  );
};

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    }, (err) => console.warn('Projects settings listener error:', err));

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
      setLoading(false);
    }, (err) => {
      console.warn('Projects collection listener error:', err);
      setProjects([]);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const handleOpenProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  if (loading || projects.length === 0) return null;

  const row1 = projects.slice(0, Math.ceil(projects.length / 2));
  const row2 = projects.slice(Math.ceil(projects.length / 2));
  
  // Create longer arrays for the marquee effect
  const marquee1 = [...row1, ...row1, ...row1, ...row1];
  const marquee2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section id="projects-grid" className="py-24 md:py-32 bg-light-bg dark:bg-dark-bg relative overflow-hidden border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 flex flex-col items-center justify-center gap-6">
        <SectionHeading 
          subtitle={settings.projectsSubtitle || "Selected Works"} 
          title={settings.projectsTitle || "Projects"} 
          align="center"
        />
        <div className="flex-shrink-0 mt-4 hidden md:block">
          <Link 
            to="/projects" 
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            <span>Seluruh Project</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full overflow-hidden">
        {/* Marquee Row 1 */}
        <div className="flex gap-6 w-max animate-marquee-left">
          {marquee1.map((project, idx) => (
            <ProjectItem 
              key={`${project.id}-${idx}`}
              project={project}
              index={idx % projects.length}
              onClick={() => handleOpenProject(project.id)}
            />
          ))}
        </div>

        {/* Marquee Row 2 (Reverse) */}
        {row2.length > 0 && (
          <div className="flex gap-6 w-max animate-marquee-right" style={{ transform: 'translateX(-50%)' }}>
            {marquee2.map((project, idx) => (
              <ProjectItem 
                key={`${project.id}-${idx}`}
                project={project}
                index={idx % projects.length}
                onClick={() => handleOpenProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-6 mt-12 flex justify-center md:hidden">
         <Link 
          to="/projects" 
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:opacity-70 transition-opacity bg-gray-100 dark:bg-white/5 px-6 py-3 rounded-full"
        >
          <span>Lihat Seluruh Project</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
