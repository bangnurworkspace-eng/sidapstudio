import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function FooterAdmin() {
  const [footerData, setFooterData] = useState<any>({
    logoText: 'Sidap Studio',
    description: 'Creating spaces of profound serenity and timeless elegance. Architecture and interior design for the modern world.',
    copyright: `© ${new Date().getFullYear()} Sidap Studio. All rights reserved.`,
    privacyLink: '#',
    termsLink: '#'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved Changes'>('Saved');

  useEffect(() => {
    const docRef = doc(db, 'settings', 'footer');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && saveStatus === 'Saved') {
        setFooterData(docSnap.data());
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
  }, [footerData, saveStatus]);

  const handleChange = (field: string, value: any) => {
    setFooterData((prev: any) => ({ ...prev, [field]: value }));
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
      await setDoc(doc(db, 'settings', 'footer'), {
        ...footerData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      if (!isAuto) showToast('Footer updated successfully');
      setSaveStatus('Saved');
    } catch (error) {
      console.error(error);
      if (!isAuto) alert('Failed to save changes');
      setSaveStatus('Unsaved Changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1">Footer</h2>
        <p className="text-sm text-gray-500">Manage footer text, links, and copyright.</p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Logo Text</label>
          <input 
            type="text" 
            value={footerData.logoText || ''} 
            onChange={e => handleChange('logoText', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            placeholder="e.g. Sidap Studio" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
          <textarea 
            rows={4} 
            value={footerData.description || ''} 
            onChange={e => handleChange('description', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm resize-none" 
            placeholder="Short footer text..." 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Copyright Text</label>
          <input 
            type="text" 
            value={footerData.copyright || ''} 
            onChange={e => handleChange('copyright', e.target.value)} 
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Privacy Policy Link</label>
            <input 
              type="text" 
              value={footerData.privacyLink || ''} 
              onChange={e => handleChange('privacyLink', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Terms of Service Link</label>
            <input 
              type="text" 
              value={footerData.termsLink || ''} 
              onChange={e => handleChange('termsLink', e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm" 
            />
          </div>
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
