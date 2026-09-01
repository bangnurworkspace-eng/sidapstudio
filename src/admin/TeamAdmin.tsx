import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit2, Trash2, X, Check, UploadCloud, ArrowUp, ArrowDown,
  Mail, Globe, User, Share2, ExternalLink, Search, AlertTriangle, Loader2
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { compressImage } from '../lib/imageUtils';
import { TeamMember } from '../types';
import { teamMembers as defaultTeam } from '../data';

export function TeamAdmin() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  
  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [specialtiesInput, setSpecialtiesInput] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'team'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
        setItems(data);
        setLoading(false);
      } else {
        // If Firestore team collection is completely empty on initial load, auto-seed defaults once
        try {
          const batch = writeBatch(db);
          defaultTeam.forEach((member, idx) => {
            const docRef = doc(collection(db, 'team'));
            const { id, ...dataWithoutId } = member;
            batch.set(docRef, {
              ...dataWithoutId,
              order: idx,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
          await batch.commit();
        } catch (err) {
          console.warn('Auto-seed default team error:', err);
          setItems(defaultTeam);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3500);
  };

  const handleAddNew = () => {
    setEditingItem({
      name: '',
      role: '',
      bio: '',
      quote: '',
      image: '',
      order: items.length,
      specialties: [],
      socials: {
        instagram: '',
        linkedin: '',
        email: '',
        portfolio: ''
      }
    });
    setSpecialtiesInput('');
    setIsModalOpen(true);
  };

  const handleEdit = (item: TeamMember) => {
    setEditingItem({
      ...item,
      socials: item.socials || { instagram: '', linkedin: '', email: '', portfolio: '' }
    });
    setSpecialtiesInput(item.specialties ? item.specialties.join(', ') : '');
    setIsModalOpen(true);
  };

  // Open in-app modal confirmation
  const handleRequestDelete = (item: TeamMember) => {
    setDeleteTarget(item);
  };

  // Execute deletion from Firestore
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.id) {
        await deleteDoc(doc(db, 'team', deleteTarget.id));
        showToast(`Profil "${deleteTarget.name}" berhasil dihapus`);
      } else {
        // Fallback filter
        setItems(prev => prev.filter(m => m.name !== deleteTarget.name));
        showToast(`Profil "${deleteTarget.name}" berhasil dihapus`);
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
      showToast('Gagal menghapus profil. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    try {
      const itemA = items[index];
      const itemB = items[targetIndex];

      if (!itemA.id || !itemB.id) return;

      const batch = writeBatch(db);
      batch.update(doc(db, 'team', itemA.id), { order: targetIndex });
      batch.update(doc(db, 'team', itemB.id), { order: index });
      await batch.commit();
      showToast('Urutan berhasil dipindahkan');
    } catch (error) {
      console.error('Error reordering team:', error);
      showToast('Gagal mengubah urutan');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const base64 = await compressImage(file, 1000, 0.85);
      setEditingItem((prev: any) => ({ ...prev, image: base64 }));
      showToast('Foto berhasil diunggah & dikompresi');
    } catch (error) {
      console.error(error);
      showToast('Gagal mengunggah foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem?.name?.trim() || !editingItem?.role?.trim()) {
      showToast('Nama Lengkap dan Posisi/Jabatan wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const parsedSpecialties = specialtiesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload = {
        name: editingItem.name.trim(),
        role: editingItem.role.trim(),
        bio: editingItem.bio?.trim() || '',
        quote: editingItem.quote?.trim() || '',
        image: editingItem.image?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
        order: Number(editingItem.order ?? items.length),
        specialties: parsedSpecialties,
        socials: {
          instagram: editingItem.socials?.instagram?.trim() || '',
          linkedin: editingItem.socials?.linkedin?.trim() || '',
          email: editingItem.socials?.email?.trim() || '',
          portfolio: editingItem.socials?.portfolio?.trim() || ''
        },
        updatedAt: new Date().toISOString()
      };

      if (editingItem.id && !['1','2','3','4'].includes(editingItem.id)) {
        // Update existing document
        await updateDoc(doc(db, 'team', editingItem.id), payload);
        showToast('Profil berhasil diperbarui');
      } else {
        // Create new document
        await addDoc(collection(db, 'team'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        showToast('Profil baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving team profile:', error);
      showToast('Gagal menyimpan profil: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.95 }} 
            className="fixed top-8 right-8 z-50 bg-black text-white dark:bg-white dark:text-black px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 text-sm font-semibold border border-white/20"
          >
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#121214] p-6 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
              Man Behind The Project
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent">
              {items.length} Profil
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola profil arsitek, desainer, dan pembuat karya yang tampil pada slide "Man Behind The Project".
          </p>
        </div>

        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Profil
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari profil berdasarkan nama, posisi, atau keahlian..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-black dark:focus:border-white/30 transition-all shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile List Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center gap-3 text-gray-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat data profil...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-white/10">
          <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-black dark:text-white">Tidak ada profil ditemukan</h3>
          <p className="text-xs text-gray-500 mt-1">Coba kata kunci lain atau klik tombol "Tambah Profil".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((member, index) => (
            <motion.div
              key={member.id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white dark:bg-[#18181B] border border-gray-200/90 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-black/40 dark:hover:border-white/30 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-black/50 border border-gray-100 dark:border-white/10 flex-shrink-0 relative">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-light-accent dark:text-dark-accent bg-light-accent/10 dark:bg-dark-accent/10 px-2 py-0.5 rounded">
                        {member.role}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        #{index + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-black dark:text-white truncate mt-1.5">
                      {member.name}
                    </h3>

                    {member.quote && (
                      <p className="text-xs italic font-serif text-gray-600 dark:text-gray-400 border-l-2 border-light-accent dark:border-dark-accent pl-2.5 mt-2 line-clamp-1">
                        "{member.quote}"
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                  {member.bio || 'Belum ada deskripsi profil.'}
                </p>

                {member.specialties && member.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.specialties.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons & Order Controls */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                {/* Social icons */}
                <div className="flex items-center gap-2 text-gray-400">
                  {member.socials?.instagram && (
                    <a href={member.socials.instagram} target="_blank" rel="noreferrer" title="Instagram" className="hover:text-black dark:hover:text-white">
                      <Share2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socials?.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="hover:text-black dark:hover:text-white">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socials?.email && (
                    <a href={`mailto:${member.socials.email}`} title="Email" className="hover:text-black dark:hover:text-white">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socials?.portfolio && (
                    <a href={member.socials.portfolio} target="_blank" rel="noreferrer" title="Portfolio" className="hover:text-black dark:hover:text-white">
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Edit, Delete, Reorder */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Pindah ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Pindah ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-1" />
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all font-semibold flex items-center gap-1 text-xs"
                    title="Edit Profil"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleRequestDelete(member)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Hapus Profil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Profile */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-light-accent dark:text-dark-accent" />
                  {editingItem?.id ? 'Edit Profil Kreator / Arsitek' : 'Tambah Profil Baru'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                
                {/* Photo Upload & Preview */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Foto Potret / Portrait Image * <span className="text-[11px] font-normal normal-case text-gray-400">(Rasio 4:5)</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10 flex-shrink-0 flex items-center justify-center relative">
                      {editingItem?.image ? (
                        <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                          Mengompres...
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-black dark:hover:border-white/50 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors bg-gray-50/50 dark:bg-white/5">
                        <UploadCloud className="w-4 h-4 text-light-accent dark:text-dark-accent" />
                        <span>Upload & Kompres Gambar (JPG/PNG/WebP)</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <input
                        type="text"
                        placeholder="Atau tempel tautan URL gambar (https://...)"
                        value={editingItem?.image || ''}
                        onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ar. Nur Sidap, IAI"
                      value={editingItem?.name || ''}
                      onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-sm outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Posisi / Jabatan *</label>
                    <input
                      type="text"
                      placeholder="e.g. Principal Architect & Founder"
                      value={editingItem?.role || ''}
                      onChange={e => setEditingItem({ ...editingItem, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-sm outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Quote / Design Philosophy */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Kutipan / Filosofi Desain</label>
                  <input
                    type="text"
                    placeholder="e.g. Arsitektur bukan sekadar bentuk, melainkan koreografi cahaya dan ketenangan jiwa."
                    value={editingItem?.quote || ''}
                    onChange={e => setEditingItem({ ...editingItem, quote: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-sm outline-none italic font-serif"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Pengenalan Profil (Bio / Cerita Pengalaman)</label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan peran arsitek, fokus desain, serta dedikasinya dalam pengerjaan proyek-proyek Sidap Studio..."
                    value={editingItem?.bio || ''}
                    onChange={e => setEditingItem({ ...editingItem, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-sm outline-none leading-relaxed"
                  />
                </div>

                {/* Specialties */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Keahlian Utama (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="Tropical Modernism, Spatial Concept, Material Curation"
                    value={specialtiesInput}
                    onChange={e => setSpecialtiesInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-sm outline-none"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tautan Kontak & Media Sosial</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus-within:border-black dark:focus-within:border-white/20">
                      <Share2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Instagram / Medsos URL"
                        value={editingItem?.socials?.instagram || ''}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          socials: { ...editingItem.socials, instagram: e.target.value }
                        })}
                        className="bg-transparent text-xs outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus-within:border-black dark:focus-within:border-white/20">
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="LinkedIn / Portfolio URL"
                        value={editingItem?.socials?.linkedin || ''}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          socials: { ...editingItem.socials, linkedin: e.target.value }
                        })}
                        className="bg-transparent text-xs outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus-within:border-black dark:focus-within:border-white/20">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="email"
                        placeholder="Alamat Email"
                        value={editingItem?.socials?.email || ''}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          socials: { ...editingItem.socials, email: e.target.value }
                        })}
                        className="bg-transparent text-xs outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-transparent focus-within:border-black dark:focus-within:border-white/20">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Website Pribadi"
                        value={editingItem?.socials?.portfolio || ''}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          socials: { ...editingItem.socials, portfolio: e.target.value }
                        })}
                        className="bg-transparent text-xs outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Urutan Tampil (Nomor Urut)</label>
                  <input
                    type="number"
                    value={editingItem?.order ?? 0}
                    onChange={e => setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 0 })}
                    className="w-24 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3 bg-gray-50 dark:bg-[#121214]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    Hapus Profil?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Apakah Anda yakin ingin menghapus profil <strong className="text-black dark:text-white font-semibold">"{deleteTarget.name}"</strong> ({deleteTarget.role})? Tindakan ini akan menghapus data secara permanen.
                  </p>
                </div>
              </div>

              {/* Profile mini preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <img 
                  src={deleteTarget.image} 
                  alt={deleteTarget.name} 
                  className="w-10 aspect-[4/5] rounded-lg object-cover bg-gray-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-black dark:text-white truncate">{deleteTarget.name}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{deleteTarget.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Profil</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
