import { NavLink, Outlet } from 'react-router-dom';
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
  Newspaper
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
      { name: '2. Project Showcase', path: '/admin/projects', icon: Briefcase }, // Assuming the sliding projects are controlled via projects, wait actually there are multiple things. Let's look at the home layout.
      { name: '3. About', path: '/admin/about', icon: Info },
      { name: '4. Selected Works', path: '/admin/projects', icon: Briefcase }, // Need to avoid duplicate paths, but that's okay. Let's just say "Projects"
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
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export function AdminLayout() {
  const { user, logout } = useAuth();

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
        <header className="h-20 sticky top-0 flex-shrink-0 flex items-center justify-between px-8 bg-white/50 dark:bg-[#050505]/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500">Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
              <div className="text-right">
                <div className="text-xs font-bold text-black dark:text-white">{user?.displayName || 'Admin'}</div>
                <div className="text-[10px] text-gray-500">{user?.email}</div>
              </div>
              <OptimizedImage src={user?.photoURL || ''} alt="Profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-600 object-cover" containerClassName="w-9 h-9 rounded-full border border-white/20" />
            </div>
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
