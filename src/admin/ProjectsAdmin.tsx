import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Filter, Edit2, Trash2, Eye, ArrowUpDown, ChevronLeft, ChevronRight, UploadCloud, X, Check } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { compressImage } from '../lib/imageUtils';
import { db, storage } from '../lib/firebase';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function ProjectsAdmin() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      showToast('Project deleted successfully');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete project');
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject({
      ...project,
      tags: project.tags || [],
      gallery: project.gallery || []
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProject({
      title: '', slug: '', category: 'Architecture', location: '', year: new Date().getFullYear().toString(), description: '', content: '', image: '', isPublished: true, isFeatured: false, tags: [], gallery: []
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const url = await compressImage(file);
    try {
      setEditingProject({ ...editingProject, image: url });
    } catch (error) {
      console.error('Error uploading image', error);
      showToast('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        return await compressImage(file);
      });
      const urls = await Promise.all(uploadPromises);
      setEditingProject({ ...editingProject, gallery: [...(editingProject.gallery || []), ...urls] });
    } catch (error) {
      console.error('Error uploading gallery images', error);
      showToast('Gallery upload failed');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...editingProject.gallery];
    newGallery.splice(index, 1);
    setEditingProject({ ...editingProject, gallery: newGallery });
  };

  const handleSave = async () => {
    if (!editingProject?.title) return showToast('Title is required');
    
    setIsSaving(true);
    try {
      const projectData = {
        ...editingProject,
        slug: editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        updatedAt: new Date().toISOString()
      };

      // Clean up empty tags
      if (projectData.tags && typeof projectData.tags === 'string') {
        projectData.tags = projectData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      }

      if (editingProject.id) {
        const { id, ...updateData } = projectData;
        await updateDoc(doc(db, 'projects', id), updateData);
        showToast('Project updated successfully');
      } else {
        projectData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'projects'), projectData);
        showToast('Project created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      showToast('Error saving project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black dark:text-white mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Manage your portfolio projects and case studies.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              aria-label="Search projects"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 text-sm w-full md:w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table/List Area */}
      <div className="flex-1 bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] overflow-hidden flex flex-col shadow-sm">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2 cursor-pointer hover:text-black dark:hover:text-white">Project <ArrowUpDown className="w-3 h-3"/></div></th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? filteredProjects.map((project, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={project.id} 
                  className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                        {project.image && <OptimizedImage src={project.image} alt={project.title} className="w-full h-full object-cover" containerClassName="w-full h-full" priority={false} />}
                      </div>
                      <span className="font-medium text-sm text-black dark:text-white">{project.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{project.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{project.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{project.location}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(project)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-blue-500" title="Edit" aria-label="Edit project">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500" title="Delete" aria-label="Delete project">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm">No projects found</p>
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
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#18181B] rounded-[24px] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                <h2 className="text-lg font-bold">{editingProject?.id ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={() => setIsModalOpen(false)} aria-label="Close modal" className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-gray-500">Project Title</label>
                    <input id="title" type="text" value={editingProject?.title || ''} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" placeholder="e.g. The Serenity Villa" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                    <select 
                      id="category" 
                      value={editingProject?.category || 'Architecture'} 
                      onChange={e => setEditingProject({...editingProject, category: e.target.value})} 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm"
                    >
                      <option value="Architecture">Architecture</option>
                      <option value="Interior">Interior</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-gray-500">Location</label>
                    <input id="location" type="text" value={editingProject?.location || ''} onChange={e => setEditingProject({...editingProject, location: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" placeholder="e.g. Kyoto, Japan" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label htmlFor="year" className="text-xs font-bold uppercase tracking-widest text-gray-500">Year</label>
                    <input id="year" type="text" value={editingProject?.year || ''} onChange={e => setEditingProject({...editingProject, year: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" placeholder="e.g. 2025" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-gray-500">Ringkasan Singkat (Short Description)</label>
                  <textarea 
                    id="description"
                    rows={2}
                    value={editingProject?.description || ''} 
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
                    placeholder="Ringkasan singkat tentang proyek..." 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-gray-500">Penjelasan Teks Panjang (Full Long-Form Story & Details)</label>
                  <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden text-black dark:text-white">
                    <ReactQuill 
                      theme="snow"
                      value={editingProject?.content || ''} 
                      onChange={content => setEditingProject({...editingProject, content})} 
                      className="w-full text-sm h-52 pb-12"
                      placeholder="Penjelasan detail filosofi, desain, struktur, dan konsep arsitektur proyek..."
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

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Media Gallery</label>
                  <label className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    {uploadingImage ? (
                      <div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium mb-1">Click to upload image</p>
                      </>
                    )}
                  </label>
                  
                  {/* Thumbnail Preview Area */}
                  {editingProject?.image && (
                     <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group">
                           <OptimizedImage src={editingProject.image} alt="Preview" className="w-full h-full object-cover" containerClassName="w-full h-full" priority={false} />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Trash2 className="w-4 h-4 text-white cursor-pointer hover:scale-110 transition-transform" onClick={() => setEditingProject({...editingProject, image: ''})} />
                           </div>
                        </div>
                     </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSaving && <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
                  Save Changes
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
