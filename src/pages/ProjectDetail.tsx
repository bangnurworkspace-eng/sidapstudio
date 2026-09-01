import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft, Calendar, MapPin, Tag, User, ArrowRight, Share2, Check } from 'lucide-react';
import { motion } from 'motion/react';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        let foundData: any = null;

        // 1. Try finding in 'news' collection
        const newsRef = doc(db, 'news', id);
        const newsSnap = await getDoc(newsRef);
        if (newsSnap.exists()) {
          foundData = { id: newsSnap.id, isNewsDoc: true, ...newsSnap.data() };
        } else {
          // 2. Try finding in 'projects' collection
          const projRef = doc(db, 'projects', id);
          const projSnap = await getDoc(projRef);
          if (projSnap.exists()) {
            const projData = projSnap.data();
            foundData = { id: projSnap.id, isNewsDoc: false, ...projData };

            // Check if there is a separate news story linked to this project
            try {
              const qLinkedNews = query(collection(db, 'news'), where('projectId', '==', id), limit(1));
              const linkedSnap = await getDocs(qLinkedNews);
              if (!linkedSnap.empty) {
                const linkedNewsData = linkedSnap.docs[0].data();
                foundData.content = linkedNewsData.content || foundData.content;
                foundData.summary = linkedNewsData.summary || foundData.summary;
                foundData.title = linkedNewsData.title || foundData.title;
              }
            } catch (err) {
              console.warn('Error fetching linked news:', err);
            }
          }
        }

        setItem(foundData);

        // Fetch 3 related items
        if (foundData) {
          try {
            const relatedNewsQuery = query(collection(db, 'news'), limit(4));
            const snap = await getDocs(relatedNewsQuery);
            const others = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(d => d.id !== id)
              .slice(0, 3);
            setRelatedItems(others);
          } catch (e) {
            console.warn('Error fetching related items:', e);
          }
        }
      } catch (error) {
        console.error("Error fetching detail data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg">
        <Navbar />
        <div className="w-10 h-10 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs uppercase tracking-widest text-gray-400 mt-4">Loading article & story...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg text-[#222] dark:text-[#F8F8F8] px-6">
        <Navbar />
        <h1 className="text-3xl md:text-4xl font-serif mb-4 text-center">Story or Project Not Found</h1>
        <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
          The requested article may have been moved or unpublished.
        </p>
        <div className="flex items-center gap-4">
          <Link 
            to="/news" 
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Browse News & Stories
          </Link>
          <Link 
            to="/" 
            className="px-6 py-3 border border-current rounded-full text-xs font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  const rawContent = item.content || item.description || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8]">
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40 md:pb-32">
        <article className="max-w-4xl mx-auto px-6 lg:px-8">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-10 pb-4 border-b border-gray-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <Link 
                to={item.isNewsDoc ? "/news" : "/projects"} 
                className="inline-flex items-center gap-1.5 uppercase tracking-widest font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {item.isNewsDoc ? "News & Stories" : "Projects"}
              </Link>
              <span className="text-gray-300 dark:text-white/20">/</span>
              <span className="uppercase tracking-widest text-gray-400 truncate max-w-[200px]">
                {item.category || (item.isNewsDoc ? 'Article' : 'Project')}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white/30 text-[11px] font-medium tracking-wide transition-colors"
              title="Share article link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 opacity-60" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Article Header */}
          <header className="mb-12 md:mb-16">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-gray-500 mb-6">
              <span className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px]">
                {item.category || 'Architecture'}
              </span>
              {item.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 opacity-60" />
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 opacity-60" />
                  {item.location}
                </span>
              )}
              {item.year && (
                <span>• {item.year}</span>
              )}
              {item.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 opacity-60" />
                  {item.author}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light leading-[1.12] tracking-tight mb-8">
              {item.title}
            </h1>

            {item.summary && (
              <p className="text-lg md:text-xl font-light leading-relaxed text-[#555] dark:text-[#BBB] border-l-2 border-black dark:border-white pl-6 py-1 italic">
                {item.summary}
              </p>
            )}
          </header>

          {/* Hero Media Figure */}
          {item.image && (
            <figure className="mb-14 md:mb-20 w-full overflow-hidden rounded-2xl shadow-xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-auto max-h-[75vh] object-cover"
              />
            </figure>
          )}

          {/* Full Long Text Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none font-light leading-relaxed prose-headings:font-serif prose-headings:font-light prose-headings:tracking-tight prose-a:text-black dark:prose-a:text-white prose-a:underline prose-img:rounded-2xl prose-p:mb-6 prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed text-[#2A2A2A] dark:text-[#E0E0E0]">
            {isHtml ? (
              <div 
                dangerouslySetInnerHTML={{ __html: rawContent }} 
                className="rich-article-content space-y-6"
              />
            ) : rawContent ? (
              <div className="whitespace-pre-line space-y-4">
                {rawContent}
              </div>
            ) : (
              <div className="text-center opacity-60 py-12 italic border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                No detailed text description has been added for this story yet.
              </div>
            )}
          </div>

          {/* Gallery Preview if attached */}
          {item.gallery && item.gallery.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-6">
                Project Gallery & Documentation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.gallery.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <img src={imgUrl} alt={`${item.title} gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Click News for more (if project) */}
          {!item.isNewsDoc && (
            <div className="mt-12 text-center">
              <Link 
                to="/news"
                className="inline-block text-sm font-semibold uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:opacity-60 transition-opacity"
              >
                Click news for more.
              </Link>
            </div>
          )}

          {/* Bottom Back Button & Related Exploration */}
          <div className="mt-20 pt-12 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
              <Link
                to={item.isNewsDoc ? "/news" : "/projects"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full text-xs uppercase tracking-widest font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {item.isNewsDoc ? "All News & Stories" : "Back to Projects"}
              </Link>
              
              <Link
                to="/"
                className="text-xs uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Back to Studio Home
              </Link>
            </div>

            {/* Related Stories */}
            {relatedItems.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-serif">More Stories & Insights</h4>
                  <Link to="/news" className="text-xs uppercase tracking-widest font-bold flex items-center gap-1 hover:opacity-70">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedItems.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/news/${rel.id}`}
                      className="group block p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 hover:border-black dark:hover:border-white/20 transition-all"
                    >
                      {rel.image && (
                        <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-gray-200 dark:bg-white/5">
                          <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">
                        {rel.category || 'News'}
                      </span>
                      <h5 className="font-serif text-sm line-clamp-2 group-hover:opacity-80 transition-opacity">
                        {rel.title}
                      </h5>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
