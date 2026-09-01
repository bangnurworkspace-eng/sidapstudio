import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, X, Search, Image as ImageIcon, Trash2, Check, 
  Loader2, GripVertical, Filter, Tag, Edit3, Save, Layers 
} from 'lucide-react';
import { compressImage } from '../lib/imageUtils';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, 
  query, orderBy, writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { GalleryItem } from '../types';

export function GalleryAdmin() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'Architecture' | 'Interior'>('Architecture');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'Architecture' | 'Interior'>('Architecture');
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          name: data.name || '',
          title: data.title || data.name || '',
          category: data.category || 'Architecture',
          order: data.order ?? 0,
          createdAt: data.createdAt,
          ...data
        } as GalleryItem;
      });
      setImages(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    
    try {
      const filesArray = Array.from(e.target.files) as File[];
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const url = await compressImage(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        
        await addDoc(collection(db, 'gallery'), {
          url,
          name: cleanName,
          title: cleanName,
          category: uploadCategory,
          order: images.length + i,
          createdAt: new Date().toISOString()
        });
      }
      showToast(`${filesArray.length} foto berhasil diunggah ke kategori ${uploadCategory}`);
    } catch (error) {
      console.error(error);
      showToast('Upload failed. Silakan coba kembali.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (image: GalleryItem) => {
    try {
      await deleteDoc(doc(db, 'gallery', image.id));
      showToast('Foto berhasil dihapus');
    } catch (error) {
      console.error(error);
      showToast('Gagal menghapus foto');
    }
  };

  const handleQuickCategorySwitch = async (image: GalleryItem, newCategory: 'Architecture' | 'Interior') => {
    try {
      await updateDoc(doc(db, 'gallery', image.id), {
        category: newCategory,
        updatedAt: new Date().toISOString()
      });
      showToast(`Kategori diubah ke ${newCategory}`);
    } catch (error) {
      console.error(error);
      showToast('Gagal mengubah kategori');
    }
  };

  const handleOpenEdit = (image: GalleryItem) => {
    setEditingImage(image);
    setEditTitle(image.title || image.name || '');
    setEditCategory((image.category as 'Architecture' | 'Interior') || 'Architecture');
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    try {
      await updateDoc(doc(db, 'gallery', editingImage.id), {
        title: editTitle,
        category: editCategory,
        updatedAt: new Date().toISOString()
      });
      showToast('Perubahan foto berhasil disimpan');
      setEditingImage(null);
    } catch (error) {
      console.error(error);
      showToast('Gagal menyimpan perubahan');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex || isNaN(dragIndex)) return;

    const newItems = [...images];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setImages(newItems);

    try {
      const batch = writeBatch(db);
      newItems.forEach((item, index) => {
        batch.update(doc(db, 'gallery', item.id), { order: index });
      });
      await batch.commit();
      showToast('Urutan foto berhasil diperbarui');
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Gagal menyimpan urutan foto');
    }
  };

  // Filter images by search and category
  const filteredImages = images.filter(img => {
    const matchesSearch = (img.title || img.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'All' 
      ? true 
      : (img.category || 'Architecture').toLowerCase() === activeCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = {
    All: images.length,
    Architecture: images.filter(i => (i.category || 'Architecture').toLowerCase() === 'architecture').length,
    Interior: images.filter(i => (i.category || 'Architecture').toLowerCase() === 'interior').length,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Upload Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-[#18181B] p-6 sm:p-8 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Visual Archive Manager</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1">Gallery</h2>
          <p className="text-sm text-gray-500">Kelola arsip visual proyek arsitektur dan interior Sidap Studio.</p>
        </div>
        
        {/* Upload Action Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Target Category for Upload */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200/80 dark:border-white/10 text-xs">
            <span className="text-[11px] font-semibold text-gray-400 pl-2 pr-1 uppercase tracking-wider">Kategori Unggah:</span>
            <button
              type="button"
              onClick={() => setUploadCategory('Architecture')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                uploadCategory === 'Architecture'
                  ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={() => setUploadCategory('Interior')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                uploadCategory === 'Interior'
                  ? 'bg-white dark:bg-white/20 text-black dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Interior
            </button>
          </div>

          {/* Upload Button */}
          <label className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl text-sm font-bold tracking-wide uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-initial">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>{uploading ? 'Mengunggah...' : 'Upload Foto'}</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload} 
              disabled={uploading} 
            />
          </label>
        </div>
      </div>

      {/* Main Filter & Gallery Grid Card */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-6 sm:p-8">
        
        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8 border-b border-gray-100 dark:border-white/5 pb-6">
          
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {(['All', 'Architecture', 'Interior'] as const).map((cat) => {
              const isActive = activeCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{cat === 'All' ? 'Semua Kategori' : cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                  }`}>
                    {categoryCounts[cat]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama/judul foto..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent focus:border-black dark:focus:border-white/20 outline-none transition-all text-xs font-medium"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
            <p className="text-xs text-gray-400 uppercase tracking-widest">Memuat Arsip Foto...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-bold">Tidak ada foto ditemukan</p>
            <p className="text-xs text-gray-400 mt-1">Unggah foto baru dengan memilih tombol di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image, i) => {
              const cat = image.category || 'Architecture';

              return (
                <motion.div 
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i % 8) * 0.04 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e as any, i)}
                  className="group relative rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-white/5">
                    <OptimizedImage 
                      src={image.url} 
                      alt={image.title || image.name || 'Gallery photo'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />

                    {/* Drag Handle Floating Button */}
                    <div 
                      className="absolute top-2.5 left-2.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, i)}
                    >
                      <div className="w-7 h-7 bg-black/60 backdrop-blur-md text-white rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Info & Category Switcher Bar */}
                  <div className="p-3.5 bg-white dark:bg-[#18181B] flex flex-col gap-3 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-black dark:text-white truncate flex-1" title={image.title || image.name}>
                        {image.title || image.name || 'Foto Gallery'}
                      </span>
                      <div className="flex items-center gap-1 z-20 relative">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenEdit(image);
                          }}
                          className="w-7 h-7 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-md flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                          title="Edit Judul & Kategori"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(image);
                          }}
                          className="w-7 h-7 bg-gray-100 dark:bg-white/10 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Category Selector Chips */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleQuickCategorySwitch(image, 'Architecture')}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                          cat.toLowerCase() === 'architecture'
                            ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        Architecture
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickCategorySwitch(image, 'Interior')}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                          cat.toLowerCase() === 'interior'
                            ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        Interior
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Image Modal */}
      <AnimatePresence>
        {editingImage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
                <h3 className="text-base font-bold text-black dark:text-white">Edit Detail Foto</h3>
                <button onClick={() => setEditingImage(null)} className="text-gray-400 hover:text-black dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview image */}
              <div className="aspect-[16/9] rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-100 dark:bg-black">
                <img src={editingImage.url} alt="Preview" className="w-full h-full object-cover" />
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Judul / Caption Foto</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Contoh: Villa Kyoto Minimalist"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-black dark:focus:border-white outline-none text-xs font-medium"
                />
              </div>

              {/* Category radio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Kategori</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditCategory('Architecture')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      editCategory === 'Architecture'
                        ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black'
                        : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Architecture
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCategory('Interior')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      editCategory === 'Interior'
                        ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black'
                        : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Interior
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
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
            className="fixed bottom-8 right-8 bg-black text-white dark:bg-white dark:text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
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
