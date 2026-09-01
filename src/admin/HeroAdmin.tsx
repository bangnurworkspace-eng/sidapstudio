import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Check } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { compressImage } from '../lib/imageUtils';
import { db, storage } from '../lib/firebase';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function HeroAdmin() {
  const [heroData, setHeroData] = useState<any>({
    title: '', subtitle: '', description: '', buttonText: '', buttonLink: '', image: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved Changes'>('Saved');

  useEffect(() => {
    const docRef = doc(db, 'hero', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        if (saveStatus === 'Saved') {
          setHeroData(docSnap.data());
        }
      }
    });
    return () => unsubscribe();
  }, [saveStatus]);

  useEffect(() => {
    if (saveStatus !== 'Unsaved Changes') return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, 30000); 

    return () => clearTimeout(timer);
  }, [heroData, saveStatus]);

  const handleChange = (field: string, value: any) => {
    setHeroData((prev: any) => ({ ...prev, [field]: value }));
    setSaveStatus('Unsaved Changes');
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const handleSave = async (isAuto = false) => {
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      await setDoc(doc(db, 'hero', 'main'), {
        ...heroData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      if (!isAuto) showToast('Hero section updated successfully');
      setSaveStatus('Saved');
    } catch (error) {
      console.error(error);
      if (!isAuto) alert('Failed to save changes');
      setSaveStatus('Unsaved Changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await compressImage(file);
      handleChange('image', url);
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1">Hero Section</h2>
        <p className="text-sm text-gray-500">Manage the main landing area of your website.</p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title</label>
          <input 
            type="text" 
            value={heroData.title || ''} 
            onChange={e => handleChange('title', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            placeholder="e.g. Lumina Studio" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subtitle</label>
          <input 
            type="text" 
            value={heroData.subtitle || ''} 
            onChange={e => handleChange('subtitle', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            placeholder="e.g. Crafting Digital Experiences" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden text-black dark:text-white">
            <ReactQuill 
              theme="snow"
              value={heroData.description || ''} 
              onChange={content => handleChange('description', content)} 
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

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Button Text</label>
            <input 
              type="text" 
              value={heroData.buttonText || ''} 
              onChange={e => handleChange('buttonText', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
              placeholder="e.g. View Projects" 
            />
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Button Link</label>
            <input 
              type="text" 
              value={heroData.buttonLink || ''} 
              onChange={e => handleChange('buttonLink', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
              placeholder="e.g. #projects" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Background Image</label>
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
          
          {heroData.image && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 max-h-64 relative group">
              <OptimizedImage src={heroData.image} alt="Hero Background" className="w-full h-full object-cover" containerClassName="w-full h-full" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button onClick={(e) => { e.preventDefault(); setHeroData({...heroData, image: ''}); }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Remove Image</button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {saveStatus === 'Saved' && <Check className="w-4 h-4 text-green-500" />}
            {saveStatus === 'Saving...' && <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
            {saveStatus}
          </div>
          <button onClick={() => handleSave(false)} disabled={isSaving || saveStatus === 'Saved'} className="px-8 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50">
            {isSaving && <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
            Save Changes
          </button>
        </div>
      </div>

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
