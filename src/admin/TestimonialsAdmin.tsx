import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Check, GripVertical } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function TestimonialsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      showToast('Testimonial deleted');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete testimonial');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem({
      author: '', role: '', quote: '', order: items.length
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem.author || !editingItem.quote) {
      alert("Author and quote are required.");
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingItem.id) {
        const { id, ...data } = editingItem;
        await updateDoc(doc(db, 'testimonials', id), { ...data, updatedAt: new Date().toISOString() });
        showToast('Testimonial updated');
      } else {
        await addDoc(collection(db, 'testimonials'), { 
          ...editingItem, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        showToast('Testimonial added');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = items.findIndex(i => i.id === draggedId);
    const targetIndex = items.findIndex(i => i.id === targetId);

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setItems(newItems);

    const batch = writeBatch(db);
    newItems.forEach((item, index) => {
      batch.update(doc(db, 'testimonials', item.id), { order: index });
    });
    await batch.commit();
    showToast('Order updated');
    setDraggedId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1">Testimonials</h2>
          <p className="text-sm text-gray-500">Manage client testimonials. Drag to reorder.</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-2xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-2">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No testimonials found.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors ${draggedId === item.id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="cursor-grab p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">{item.author}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">"{item.quote.replace(/<[^>]+>/g, '')}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors text-blue-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-[#18181B] rounded-[24px] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                <h2 className="text-lg font-bold">{editingItem?.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Author</label>
                  <input type="text" value={editingItem?.author || ''} onChange={e => setEditingItem({...editingItem, author: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Role / Company</label>
                  <input type="text" value={editingItem?.role || ''} onChange={e => setEditingItem({...editingItem, role: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" placeholder="e.g. CEO at ACME Corp" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Quote</label>
                  <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden text-black dark:text-white">
                    <ReactQuill 
                      theme="snow"
                      value={editingItem?.quote || ''} 
                      onChange={content => setEditingItem({...editingItem, quote: content})} 
                      className="w-full text-sm h-48 pb-12"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                          ['link', 'clean']
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
                  {isSaving && <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
