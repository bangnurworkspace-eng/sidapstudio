import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit2, Trash2, ArrowUpDown, UploadCloud, X, Check, Eye, Newspaper, ExternalLink, Calendar, Tag } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { compressImage } from '../lib/imageUtils';
import { db } from '../lib/firebase';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface NewsItem {
  id?: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image: string;
  gallery?: string[];
  projectId?: string;
  location?: string;
  year?: string;
  author?: string;
  isPublished: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function NewsAdmin() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // 1. Listen to news collection
    const qNews = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      setNewsList(data);
    });

    // 2. Fetch projects for linking
    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjectsList(data);
    });

    return () => {
      unsubscribeNews();
      unsubscribeProjects();
    };
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const filteredNews = newsList.filter(n => {
    const matchesSearch = 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      n.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setEditingNews({
      title: '',
      category: 'Architecture',
      summary: '',
      content: '',
      image: '',
      gallery: [],
      projectId: '',
      location: '',
      year: new Date().getFullYear().toString(),
      author: 'Studio Editorial',
      isPublished: true,
      isFeatured: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNews({
      ...item,
      gallery: item.gallery || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      showToast('News article deleted successfully');
    } catch (error) {
      console.error('Error deleting news:', error);
      showToast('Failed to delete news article');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingNews) return;

    setUploadingImage(true);
    try {
      const url = await compressImage(file);
      setEditingNews({ ...editingNews, image: url });
      showToast('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image', error);
      showToast('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLinkProject = (projectId: string) => {
    if (!editingNews) return;
    if (!projectId) {
      setEditingNews({ ...editingNews, projectId: '' });
      return;
    }
    const matched = projectsList.find(p => p.id === projectId);
    if (matched) {
      setEditingNews({
        ...editingNews,
        projectId,
        title: editingNews.title || matched.title,
        category: editingNews.category || matched.category || 'Architecture',
        image: editingNews.image || matched.image || '',
        summary: editingNews.summary || (matched.description ? matched.description.replace(/<[^>]*>?/gm, '').slice(0, 160) : ''),
        location: editingNews.location || matched.location || '',
        year: editingNews.year || matched.year || ''
      });
    }
  };

  const handleSave = async () => {
    if (!editingNews?.title?.trim()) {
      showToast('Title is required');
      return;
    }
    if (!editingNews?.content?.trim()) {
      showToast('Full text content is required');
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: any = {
        title: editingNews.title.trim(),
        category: editingNews.category?.trim() || 'General',
        summary: editingNews.summary?.trim() || '',
        content: editingNews.content,
        image: editingNews.image || '',
        gallery: editingNews.gallery || [],
        projectId: editingNews.projectId || '',
        location: editingNews.location || '',
        year: editingNews.year || '',
        author: editingNews.author || 'Studio Editorial',
        isPublished: editingNews.isPublished ?? true,
        isFeatured: editingNews.isFeatured ?? false,
        updatedAt: now
      };

      if (editingNews.id) {
        await updateDoc(doc(db, 'news', editingNews.id), payload);
        
        // Also update linked project content if applicable
        if (editingNews.projectId) {
          try {
            await updateDoc(doc(db, 'projects', editingNews.projectId), {
              content: editingNews.content,
              updatedAt: now
            });
          } catch (err) {
            console.warn('Could not sync to project doc', err);
          }
        }

        showToast('News updated successfully');
      } else {
        payload.createdAt = now;
        const newDocRef = await addDoc(collection(db, 'news'), payload);

        // Also if linked to a project, update project content
        if (editingNews.projectId) {
          try {
            await updateDoc(doc(db, 'projects', editingNews.projectId), {
              content: editingNews.content,
              newsId: newDocRef.id,
              updatedAt: now
            });
          } catch (err) {
            console.warn('Could not sync to project doc', err);
          }
        }

        showToast('News published successfully');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving news:', error);
      showToast('Error saving news article');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(newsList.map(n => n.category).filter(Boolean)))];

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-6 h-6 text-black dark:text-white" />
            <h1 className="text-3xl font-light tracking-tight text-black dark:text-white">News & Project Stories</h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage long-form project articles, architectural insights, and studio news displayed on the website.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search news or stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 text-sm w-full sm:w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Write News / Story
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategoryFilter === cat
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#18181B] text-gray-500 hover:text-black dark:hover:text-white border border-gray-100 dark:border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Main Table/List Area */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 font-medium">Article & Project Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length > 0 ? (
                filteredNews.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    key={item.id} 
                    className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex-shrink-0">
                          {item.image ? (
                            <OptimizedImage 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover" 
                              containerClassName="w-full h-full" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Newspaper className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-black dark:text-white line-clamp-1">{item.title}</span>
                            {item.isFeatured && (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">
                                Featured
                              </span>
                            )}
                          </div>
                          {item.summary && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/news/${item.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-black dark:hover:text-white"
                          title="View on Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => item.id && handleDelete(item.id)} 
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Newspaper className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No news or stories yet</p>
                      <p className="text-xs text-gray-400 max-w-sm mb-4">
                        Start writing your project stories and news with full rich-text explanations.
                      </p>
                      <button
                        onClick={handleAddNew}
                        className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold uppercase tracking-wider"
                      >
                        Create First Story
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && editingNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#18181B] rounded-[24px] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-black dark:text-white">
                      {editingNews.id ? 'Edit News Story' : 'Write New Story / Project Explanation'}
                    </h2>
                    <p className="text-xs text-gray-500">Provide detailed long-form explanations for visitors.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                
                {/* Link to existing Project (Optional) */}
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Hubungkan dengan Project Portofolio (Opsional)
                    </label>
                    {editingNews.projectId && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Terkoneksi ke Project</span>
                    )}
                  </div>
                  <select
                    value={editingNews.projectId || ''}
                    onChange={(e) => handleLinkProject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-white/10 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    <option value="">-- Buat Berita Mandiri (Tidak Terkait Proyek Spesifik) --</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category || 'Architecture'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400">
                    Jika dihubungkan, penjelasan teks panjang ini juga akan otomatis tampil saat pengunjung mengklik project tersebut di halaman depan.
                  </p>
                </div>

                {/* Title & Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Judul Berita / Project *</label>
                    <input 
                      type="text" 
                      value={editingNews.title} 
                      onChange={e => setEditingNews({ ...editingNews, title: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm font-medium" 
                      placeholder="Contoh: The Serenity Villa - Penjelasan Arsitektur & Konsep Ruang" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Kategori</label>
                    <select
                      value={editingNews.category || 'Architecture'}
                      onChange={e => setEditingNews({ ...editingNews, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm"
                    >
                      <option value="Architecture">Architecture</option>
                      <option value="Interior">Interior</option>
                    </select>
                  </div>
                </div>

                {/* Short Excerpt / Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Ringkasan Singkat (Muncul di Daftar Berita)
                  </label>
                  <textarea
                    rows={2}
                    value={editingNews.summary}
                    onChange={e => setEditingNews({ ...editingNews, summary: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm"
                    placeholder="Tuliskan gambaran ringkas tentang proyek ini dalam 1-2 kalimat..."
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Foto Utama (Cover Image)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      {uploadingImage ? (
                        <div className="w-7 h-7 border-3 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5 text-gray-500" />
                          </div>
                          <p className="text-xs font-medium">Klik untuk upload foto cover</p>
                        </>
                      )}
                    </label>

                    {editingNews.image ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-white/5">
                        <OptimizedImage src={editingNews.image} alt="Preview" className="w-full h-full object-cover" containerClassName="w-full h-full" />
                        <button
                          type="button"
                          onClick={() => setEditingNews({ ...editingNews, image: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-full text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingNews.image}
                          onChange={e => setEditingNews({ ...editingNews, image: e.target.value })}
                          placeholder="Atau masukkan URL gambar..."
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-xs"
                        />
                        <p className="text-[10px] text-gray-400">Gunakan upload atau URL gambar beresolusi tinggi.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Long Text Explanation (Rich Text Editor) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Penjelasan Teks Panjang (Full Story / Article Body) *
                    </label>
                    <span className="text-[11px] text-gray-400">Mendukung format heading, bullet points, kutipan, dan link</span>
                  </div>
                  <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden text-black dark:text-white">
                    <ReactQuill 
                      theme="snow"
                      value={editingNews.content || ''} 
                      onChange={content => setEditingNews({ ...editingNews, content })} 
                      className="w-full text-sm min-h-[260px] pb-12"
                      placeholder="Tuliskan penjelasan detail proyek, filosofi desain, material yang digunakan, proses eksekusi, dan cerita di balik karya arsitektur ini..."
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                          ['link', 'clean']
                        ],
                      }}
                    />
                  </div>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Lokasi Proyek</label>
                    <input
                      type="text"
                      value={editingNews.location || ''}
                      onChange={e => setEditingNews({ ...editingNews, location: e.target.value })}
                      placeholder="e.g. Jakarta, Indonesia"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tahun</label>
                    <input
                      type="text"
                      value={editingNews.year || ''}
                      onChange={e => setEditingNews({ ...editingNews, year: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Penulis / Author</label>
                    <input
                      type="text"
                      value={editingNews.author || ''}
                      onChange={e => setEditingNews({ ...editingNews, author: e.target.value })}
                      placeholder="e.g. Studio Editorial"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-xs"
                    />
                  </div>
                </div>

                {/* Published / Featured Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingNews.isPublished}
                      onChange={e => setEditingNews({ ...editingNews, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-black focus:ring-0"
                    />
                    <span className="text-xs font-semibold">Publikasikan Sekarang (Tampil di Website)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingNews.isFeatured || false}
                      onChange={e => setEditingNews({ ...editingNews, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-black focus:ring-0"
                    />
                    <span className="text-xs font-semibold">Tandai sebagai Featured Story</span>
                  </label>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
                  Simpan & Publikasikan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 bg-black text-white dark:bg-white dark:text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
