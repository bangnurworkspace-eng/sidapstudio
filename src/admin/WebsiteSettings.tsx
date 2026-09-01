import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, UploadCloud } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { compressImage } from '../lib/imageUtils';
import { db, storage } from '../lib/firebase';
import { OptimizedImage } from '../components/ui/OptimizedImage';

export function WebsiteSettings() {
  const [settings, setSettings] = useState<any>({
    siteName: 'Sidap Studio',
    siteDescription: 'Creating spaces of profound serenity.',
    seoKeywords: '',
    googleAnalyticsId: '',
    faviconUrl: '',
    logoUrl: '',
    adminId: 'admin',
    adminPassword: 'admin 123'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved Changes'>('Saved');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && saveStatus === 'Saved') {
        setSettings(docSnap.data());
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
  }, [settings, saveStatus]);

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
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
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      if (!isAuto) showToast('Settings updated successfully');
      setSaveStatus('Saved');
    } catch (error) {
      console.error(error);
      if (!isAuto) alert('Failed to save changes');
      setSaveStatus('Unsaved Changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
    if (!e.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const url = await compressImage(file);
      handleChange(field, url);
      showToast('Image uploaded successfully');
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1">Settings</h2>
        <p className="text-sm text-gray-500">Manage global website settings and SEO.</p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-8 space-y-6">
        
        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4">General Details</h3>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Site Name</label>
          <input 
            type="text" 
            value={settings.siteName || ''} 
            onChange={e => handleChange('siteName', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Global Description (SEO)</label>
          <textarea 
            rows={3} 
            value={settings.siteDescription || ''} 
            onChange={e => handleChange('siteDescription', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm resize-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Keywords (Comma separated)</label>
          <input 
            type="text" 
            value={settings.seoKeywords || ''} 
            onChange={e => handleChange('seoKeywords', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Google Analytics ID</label>
          <input 
            type="text" 
            value={settings.googleAnalyticsId || ''} 
            onChange={e => handleChange('googleAnalyticsId', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            placeholder="e.g. G-XXXXXXXXXX"
          />
        </div>

        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4 mt-8">Branding</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Navbar Logo</label>
            <div className="flex items-center gap-6">
              {settings.logoUrl && (
                <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-100 dark:bg-white/5">
                  <OptimizedImage src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <label className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} disabled={uploadingImage} />
                <UploadCloud className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Upload Logo</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Favicon</label>
            <div className="flex items-center gap-6">
              {settings.faviconUrl && (
                <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-100 dark:bg-white/5">
                  <OptimizedImage src={settings.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'faviconUrl')} disabled={uploadingImage} />
                <UploadCloud className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Upload Favicon</span>
              </label>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4 mt-8">Admin Security</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Admin Login ID</label>
            <input 
              type="text" 
              value={settings.adminId || ''} 
              onChange={e => handleChange('adminId', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Admin Login Password</label>
            <input 
              type="text" 
              value={settings.adminPassword || ''} 
              onChange={e => handleChange('adminPassword', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
        </div>

        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4 mt-8">Section Titles & Subtitles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Projects Section Title</label>
            <input 
              type="text" 
              value={settings.projectsTitle || 'Projects'} 
              onChange={e => handleChange('projectsTitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Projects Section Subtitle</label>
            <input 
              type="text" 
              value={settings.projectsSubtitle || 'Selected Works'} 
              onChange={e => handleChange('projectsSubtitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Services Section Title</label>
            <input 
              type="text" 
              value={settings.servicesTitle || 'Our Services'} 
              onChange={e => handleChange('servicesTitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Services Section Subtitle</label>
            <input 
              type="text" 
              value={settings.servicesSubtitle || 'Expertise'} 
              onChange={e => handleChange('servicesSubtitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gallery Section Title</label>
            <input 
              type="text" 
              value={settings.galleryTitle || 'Gallery'} 
              onChange={e => handleChange('galleryTitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Gallery Section Subtitle</label>
            <input 
              type="text" 
              value={settings.gallerySubtitle || 'Visual Archive'} 
              onChange={e => handleChange('gallerySubtitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Team / Creator Section Title</label>
            <input 
              type="text" 
              value={settings.teamTitle || 'Man Behind The Project'} 
              onChange={e => handleChange('teamTitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Team / Creator Section Subtitle</label>
            <input 
              type="text" 
              value={settings.teamSubtitle || 'Minds & Architects'} 
              onChange={e => handleChange('teamSubtitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Testimonials Section Title</label>
            <input 
              type="text" 
              value={settings.testimonialsTitle || 'Testimonials'} 
              onChange={e => handleChange('testimonialsTitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Testimonials Section Subtitle</label>
            <input 
              type="text" 
              value={settings.testimonialsSubtitle || 'Client Words'} 
              onChange={e => handleChange('testimonialsSubtitle', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between mt-8">
          <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {saveStatus === 'Saved' && <Check className="w-4 h-4 text-green-500" />}
            {saveStatus === 'Saving...' && <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
            {saveStatus}
          </div>
          <button onClick={() => handleSave(false)} disabled={isSaving || saveStatus === 'Saved'} className="px-8 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50">
            {isSaving && <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
            Save Settings
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
