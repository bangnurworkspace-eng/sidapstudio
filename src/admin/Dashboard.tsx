import { motion } from 'motion/react';
import { 
  Plus, 
  Settings, 
  ExternalLink, 
  Newspaper, 
  Briefcase, 
  Users, 
  LayoutTemplate, 
  Image, 
  Info, 
  Layers, 
  ImagePlus, 
  MessageSquare, 
  HelpCircle, 
  Mail, 
  ChevronRight,
  Sparkles,
  Sliders,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Dashboard() {
  const [projectCount, setProjectCount] = useState<number>(0);
  const [newsCount, setNewsCount] = useState<number>(0);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [testimonialsCount, setTestimonialsCount] = useState<number>(0);
  const [faqCount, setFaqCount] = useState<number>(0);
  
  const [heroExists, setHeroExists] = useState<boolean>(false);
  const [aboutExists, setAboutExists] = useState<boolean>(false);
  const [contactExists, setContactExists] = useState<boolean>(false);
  const [footerExists, setFooterExists] = useState<boolean>(false);

  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, 'projects'), (s) => setProjectCount(s.size), (err) => console.warn('Projects listener:', err));
    const unsubNews = onSnapshot(collection(db, 'news'), (s) => setNewsCount(s.size), (err) => console.warn('News listener:', err));
    const unsubTeam = onSnapshot(collection(db, 'team'), (s) => setTeamCount(s.size), (err) => console.warn('Team listener:', err));
    const unsubServices = onSnapshot(collection(db, 'services'), (s) => setServicesCount(s.size), (err) => console.warn('Services listener:', err));
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (s) => setTestimonialsCount(s.size), (err) => console.warn('Testimonials listener:', err));
    const unsubFaq = onSnapshot(collection(db, 'faq'), (s) => setFaqCount(s.size), (err) => console.warn('FAQ listener:', err));

    const unsubHero = onSnapshot(doc(db, 'hero', 'main'), (d) => setHeroExists(d.exists() && !!d.data()?.title), (err) => console.warn('Hero listener:', err));
    const unsubAbout = onSnapshot(doc(db, 'about', 'main'), (d) => setAboutExists(d.exists() && !!d.data()?.title), (err) => console.warn('About listener:', err));
    const unsubContact = onSnapshot(doc(db, 'settings', 'contact'), (d) => setContactExists(d.exists() && !!d.data()?.email), (err) => console.warn('Contact listener:', err));
    const unsubFooter = onSnapshot(doc(db, 'settings', 'footer'), (d) => setFooterExists(d.exists() && !!d.data()?.copyright), (err) => console.warn('Footer listener:', err));

    return () => {
      unsubProjects();
      unsubNews();
      unsubTeam();
      unsubServices();
      unsubTestimonials();
      unsubFaq();
      unsubHero();
      unsubAbout();
      unsubContact();
      unsubFooter();
    };
  }, []);

  const websiteSections = [
    { 
      id: 1, 
      name: 'Hero Section', 
      path: '/admin/hero', 
      icon: Image, 
      description: 'Gambar utama, judul besar & tombol navigasi arsitektur',
      count: heroExists ? 'Terkonfigurasi' : 'Belum diisi',
      isReady: heroExists 
    },
    { 
      id: 2, 
      name: 'Project Showcase', 
      path: '/admin/projects', 
      icon: Briefcase, 
      description: 'Slider layar penuh karya unggulan pada homepage',
      count: `${projectCount} Proyek`,
      isReady: projectCount > 0 
    },
    { 
      id: 3, 
      name: 'About Studio', 
      path: '/admin/about', 
      icon: Info, 
      description: 'Filosofi desain, visi studio, statistik pengalaman & tanda tangan',
      count: aboutExists ? 'Terkonfigurasi' : 'Belum diisi',
      isReady: aboutExists 
    },
    { 
      id: 4, 
      name: 'Projects Portfolio', 
      path: '/admin/projects', 
      icon: Compass, 
      description: 'Portofolio lengkap arsitektur & interior berstruktur rapi',
      count: `${projectCount} Proyek`,
      isReady: projectCount > 0 
    },
    { 
      id: 5, 
      name: 'News & Stories', 
      path: '/admin/news', 
      icon: Newspaper, 
      description: 'Artikel, publikasi media, berita penghargaan & riset studio',
      count: `${newsCount} Artikel`,
      isReady: newsCount > 0 
    },
    { 
      id: 6, 
      name: 'Visual Gallery Archive', 
      path: '/admin/gallery', 
      icon: ImagePlus, 
      description: 'Galeri foto masonry resolusi tinggi terintegrasi dari portofolio',
      count: `${projectCount} Proyek`,
      isReady: projectCount > 0 
    },
    { 
      id: 7, 
      name: 'Man Behind The Project (Team)', 
      path: '/admin/team', 
      icon: Users, 
      description: 'Profil principal architect, tim ahli, kutipan & kontak profesional',
      count: `${teamCount} Profil`,
      isReady: teamCount > 0 
    },
    { 
      id: 8, 
      name: 'Services & Expertise', 
      path: '/admin/services', 
      icon: Layers, 
      description: 'Layanan arsitektur, interior, space planning & custom furnishing',
      count: `${servicesCount} Layanan`,
      isReady: servicesCount > 0 
    },
    { 
      id: 9, 
      name: 'Testimonials', 
      path: '/admin/testimonials', 
      icon: MessageSquare, 
      description: 'Ulasan & testimoni dari klien residensial maupun korporat',
      count: `${testimonialsCount} Ulasan`,
      isReady: testimonialsCount > 0 
    },
    { 
      id: 10, 
      name: 'FAQ (Frequently Asked Questions)', 
      path: '/admin/faq', 
      icon: HelpCircle, 
      description: 'Tanya jawab seputar konsultasi, anggaran & proses desain',
      count: `${faqCount} Pertanyaan`,
      isReady: faqCount > 0 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Personalized Greeting Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0F0F10] via-[#1A1A1D] to-[#121214] text-white p-8 md:p-10 border border-white/10 shadow-xl"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-widest text-[#D9C5B2]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Command Center</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-white">
              hai <span className="font-semibold text-[#D9C5B2]">ANDHIKA</span>
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-light max-w-2xl leading-relaxed">
              Selamat datang kembali di panel administrasi website. Seluruh data dummy telah dibersihkan sehingga Anda dapat mengisi konten asli studio dengan leluasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>Lihat Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link 
              to="/admin/projects"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black hover:bg-gray-100 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proyek</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Real-time Content Count Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Proyek', count: projectCount, icon: Briefcase, path: '/admin/projects', color: 'text-blue-500' },
          { label: 'News / Artikel', count: newsCount, icon: Newspaper, path: '/admin/news', color: 'text-amber-500' },
          { label: 'Tim / Arsitek', count: teamCount, icon: Users, path: '/admin/team', color: 'text-emerald-500' },
          { label: 'Layanan', count: servicesCount, icon: Layers, path: '/admin/services', color: 'text-purple-500' },
          { label: 'Testimoni', count: testimonialsCount, icon: MessageSquare, path: '/admin/testimonials', color: 'text-rose-500' },
          { label: 'FAQ', count: faqCount, icon: HelpCircle, path: '/admin/faq', color: 'text-indigo-500' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm hover:border-black dark:hover:border-white/30 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-black dark:text-white">{item.count}</div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate uppercase tracking-wider">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Two-Column Structure */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Comprehensive Homepage Section Map */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-light text-black dark:text-white">Daftar Seluruh Isi Halaman Website</h2>
              <p className="text-xs text-gray-500 mt-1">Kelola konten per bagian secara berurutan sesuai tata letak di halaman utama.</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] overflow-hidden shadow-sm">
            {websiteSections.map((section, idx) => (
              <Link 
                key={section.id} 
                to={section.path}
                className={`flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${
                  idx !== websiteSections.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors flex-shrink-0">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-400">{String(section.id).padStart(2, '0')}</span>
                      <h3 className="text-sm font-bold text-black dark:text-white truncate">{section.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{section.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    section.isReady 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>
                    {section.count}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
            
            {/* Global & Footer Sections */}
            <div className="bg-gray-50/70 dark:bg-black/40 p-6 border-t border-gray-100 dark:border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Pengaturan Global & Footer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/admin/contact" className="flex items-center gap-3 p-4 bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-white/10 rounded-2xl hover:border-black dark:hover:border-white transition-all group shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black dark:text-white">Kontak & Lokasi</h3>
                    <p className="text-[11px] text-gray-500">Email, Telp, WhatsApp & Alamat</p>
                  </div>
                </Link>
                <Link to="/admin/footer" className="flex items-center gap-3 p-4 bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-white/10 rounded-2xl hover:border-black dark:hover:border-white transition-all group shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black dark:text-white">Footer & Copyright</h3>
                    <p className="text-[11px] text-gray-500">Teks hak cipta & tautan navigasi</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Traffic Analytics */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] p-6 md:p-8 shadow-sm flex flex-col">
            <h2 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span>Aksi Cepat Admin</span>
            </h2>
            <div className="flex flex-col gap-3">
              <Link 
                to="/admin/projects" 
                className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek Baru</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/admin/news" 
                className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all text-xs font-semibold bg-gray-100 text-black dark:bg-white/5 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <Newspaper className="w-4 h-4" />
                  <span>Tulis Artikel / Berita</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link 
                to="/admin/team" 
                className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all text-xs font-semibold bg-gray-100 text-black dark:bg-white/5 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Atur Profil Tim & Arsitek</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link 
                to="/admin/settings" 
                className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all text-xs font-semibold bg-gray-100 text-black dark:bg-white/5 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan Umum Website</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>
          </div>

          {/* Database & Cloud Connection Status */}
          <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-black dark:text-white">Firestore Database</div>
                <div className="text-[10px] text-gray-500">Koneksi Real-time Aktif</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-gray-400">v2.4.0</span>
          </div>

        </div>

      </div>
    </div>
  );
}
