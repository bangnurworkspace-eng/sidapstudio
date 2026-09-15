import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image, 
  Info, 
  Briefcase, 
  Layers, 
  Users, 
  MessageSquare, 
  HelpCircle,
  Mail, 
  Settings,
  ImagePlus,
  LogOut,
  LayoutTemplate,
  Newspaper,
  UserCheck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

const sidebarGroups = [
  {
    title: 'Overview',
    links: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Home Sections (Top to Bottom)',
    links: [
      { name: '1. Hero', path: '/admin/hero', icon: Image },
      { name: '2. Project Showcase', path: '/admin/projects', icon: Briefcase },
      { name: '3. About', path: '/admin/about', icon: Info },
      { name: '4. Selected Works', path: '/admin/projects', icon: Briefcase },
      { name: '5. News & Stories', path: '/admin/news', icon: Newspaper },
      { name: '6. Gallery', path: '/admin/gallery', icon: ImagePlus },
      { name: '7. Man Behind Project', path: '/admin/team', icon: Users },
      { name: '8. Services', path: '/admin/services', icon: Layers },
      { name: '9. Testimonials', path: '/admin/testimonials', icon: MessageSquare },
      { name: '10. FAQ', path: '/admin/faq', icon: HelpCircle },
    ]
  },
  {
    title: 'Global & Footer',
    links: [
      { name: 'Contact Info', path: '/admin/contact', icon: Mail },
      { name: 'Footer Text', path: '/admin/footer', icon: LayoutTemplate },
      { name: 'User Management', path: '/admin/users', icon: ShieldCheck },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export function AdminLayout() {
  const { user, currentUser, logout } = useAuth();
  const location = useLocation();

  // Determine current section title
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path === '/admin/users') return 'User & Profile Management';
    if (path === '/admin/hero') return 'Hero Section';
    if (path === '/admin/about') return 'About Section';
    if (path === '/admin/services') return 'Services Section';
    if (path === '/admin/projects') return 'Projects & Selected Works';
    if (path === '/admin/news') return 'News & Stories';
    if (path === '/admin/gallery') return 'Gallery Archive';
    if (path === '/admin/team') return 'Man Behind Project';
    if (path === '/admin/testimonials') return 'Testimonials';
    if (path === '/admin/faq') return 'FAQ Section';
    if (path === '/admin/contact') return 'Contact Information';
    if (path === '/admin/footer') return 'Footer Content';
    if (path === '/admin/settings') return 'Global Settings';
    return 'Admin CMS';
  };

  const displayName = currentUser?.name || currentUser?.username || user?.displayName || 'Admin';
  const displayRole = currentUser?.role || 'Administrator';
  const avatarUrl = currentUser?.avatarUrl || user?.photoURL || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] font-sans flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 fixed top-0 left-0 bottom-0 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col transition-colors duration-300 z-20"
      >
        <div className="h-20 flex items-center px-8 border-b border-gray-200 dark:border-white/10">
          <span className="text-xl font-bold tracking-tighter uppercase text-black dark:text-white">Admin CMS</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                {group.title}
              </div>
              {group.links.map((link, linkIdx) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={`${groupIdx}-${linkIdx}`}
                    to={link.path}
                    end={link.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                        <span className="text-[13px] font-medium tracking-wide">{link.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
          <button onClick={logout} aria-label="Logout" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all w-full text-left">
            <LogOut className="w-5 h-5 opacity-70" />
            <span className="text-[13px] font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 ml-64 relative">
        {/* Top Navbar */}
        <header className="h-20 sticky top-0 flex-shrink-0 flex items-center justify-between px-8 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-10 transition-colors">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-black dark:text-white tracking-wide">
              {getCurrentPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            
            {/* Dynamic User Profile in Top Right Corner */}
            <Link 
              to="/admin/users"
              title="Manage User & Profile Settings"
              className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10 group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex items-center justify-end gap-1.5">
                  <span>{displayName}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {displayRole}
                </div>
              </div>

              <div className="relative">
                {avatarUrl ? (
                  <OptimizedImage 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-10 h-10 rounded-full object-cover" 
                    containerClassName="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 shadow-sm" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-white/20 dark:to-white/10 flex items-center justify-center text-white font-bold text-xs uppercase border border-white/20 shadow-sm">
                    {displayName.slice(0, 2)}
                  </div>
                )}
                {/* Active Online Status Badge */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0A0A0A] rounded-full" title="Online" />
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-8 lg:p-12 relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

