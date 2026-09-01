import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Menu, X, Lock, LayoutDashboard, Database, LogOut } from 'lucide-react';
import { Magnetic } from './ui/Magnetic';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OptimizedImage } from './ui/OptimizedImage';

const navLinks = [
  { name: 'About', href: '/#about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Gallery', href: '/#gallery' },
  { name: 'Team', href: '/#team' },
  { name: 'Services', href: '/#services' },
  { name: 'News', href: '/news' },
  { name: 'Contact', href: '/#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>({ siteName: 'Sidap Studio' });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    }, (err) => console.warn('Settings listener error:', err));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAdminMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = (e: any, href: string) => {
    if (href.startsWith('/#')) {
      if (window.location.pathname === '/') {
        e.preventDefault();
        const id = href.replace('/#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/40 dark:bg-[#0F0F10]/40 backdrop-blur-3xl py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-white/40 dark:border-white/10'
          : 'bg-transparent py-6 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        <a href="/#" className={`flex items-center gap-2 text-xl font-bold tracking-tighter uppercase transition-colors duration-500 ${!isScrolled && 'text-white'}`}>
          {settings.logoUrl && (
             <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-sm p-1 border border-white/20">
                <OptimizedImage src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
             </div>
          )}
          {settings.siteName}
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link, i) => (
            <Magnetic key={link.name}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 active:scale-95 hover:-translate-y-0.5 inline-block ${!isScrolled && hoveredIndex !== i ? 'text-white/80' : 'text-light-secondary dark:text-dark-secondary hover:text-black dark:hover:text-white'}`}
              >
                {hoveredIndex === i && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-full -z-10 shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.05)] border border-gray-200 dark:border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {link.name}
              </a>
            </Magnetic>
          ))}
          <div className={`w-px h-4 mx-4 transition-colors ${!isScrolled ? 'bg-white/20' : 'bg-gray-200 dark:bg-white/10'}`} />
          
          {/* Admin Hamburger Menu */}
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group ${isAdminMenuOpen ? 'bg-white/10 dark:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md rotate-90' : 'hover:bg-white/5 dark:hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:backdrop-blur-md'} ${!isScrolled ? 'text-white' : 'text-gray-900 dark:text-gray-100 hover:shadow-[0_0_15px_rgba(0,0,0,0.05)]'}`}
              aria-label="Admin Menu"
            >
              <Menu className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[15deg] group-hover:scale-110" strokeWidth={1.5} />
            </button>
            
            <AnimatePresence>
              {isAdminMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-4 w-56 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden py-2 z-50 flex flex-col"
                >
                  {!user ? (
                    <Link 
                      to="/login"
                      onClick={() => setIsAdminMenuOpen(false)}
                      className="px-5 py-3 text-sm font-medium flex items-center gap-3 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                    >
                      <Lock className="w-4 h-4" />
                      Admin Login
                    </Link>
                  ) : (
                    <>
                      <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Admin</p>
                        <p className="text-xs text-gray-900 dark:text-gray-100 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link 
                        to="/admin"
                        onClick={() => setIsAdminMenuOpen(false)}
                        className="px-5 py-2.5 text-sm font-medium flex items-center gap-3 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/admin/projects"
                        onClick={() => setIsAdminMenuOpen(false)}
                        className="px-5 py-2.5 text-sm font-medium flex items-center gap-3 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                      >
                        <Database className="w-4 h-4" />
                        Content Manager
                      </Link>
                      <Link 
                        to="/admin/news"
                        onClick={() => setIsAdminMenuOpen(false)}
                        className="px-5 py-2.5 text-sm font-medium flex items-center gap-3 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                      >
                        <Database className="w-4 h-4" />
                        News & Stories
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="px-5 py-2.5 text-sm font-medium flex items-center gap-3 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-colors text-red-500 mt-1 border-t border-gray-100 dark:border-white/5 pt-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className={`p-2 -mr-2 rounded-full border border-transparent hover:border-gray-400/50 dark:hover:border-white/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${!isScrolled ? 'text-white' : ''}`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white/95 dark:bg-[#0F0F10]/95 backdrop-blur-xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif text-2xl font-medium flex items-center gap-2">
                 {settings.logoUrl && (
                    <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/10 p-1 border border-black/10 dark:border-white/20">
                        <OptimizedImage src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                {settings.siteName}
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 rounded-full border border-transparent hover:border-gray-400/50 dark:hover:border-white/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                aria-label="Close mobile menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 items-center flex-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                  className="text-2xl font-serif tracking-wide"
                >
                  {link.name}
                </a>
              ))}
              
              <div className="w-24 h-px bg-gray-200 dark:bg-white/10 my-4" />
              
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Lock className="w-5 h-5" />
                  Admin Login
                </Link>
              ) : (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/projects"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <Database className="w-5 h-5" />
                    Content Manager
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-lg font-medium flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
