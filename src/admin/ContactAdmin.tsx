import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Mail, Check } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function ContactAdmin() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [contactData, setContactData] = useState<any>({
    phone: '', email: '', whatsapp: '', address: '', googleMaps: '', instagram: '', linkedin: '', twitter: ''
  });
  const [toast, setToast] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved Changes'>('Saved');

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'contact');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && saveStatus === 'Saved') {
        setContactData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [saveStatus]);

  useEffect(() => {
    if (saveStatus !== 'Unsaved Changes') return;

    const timer = setTimeout(() => {
      handleSaveSettings(true);
    }, 30000); 

    return () => clearTimeout(timer);
  }, [contactData, saveStatus]);

  const handleChange = (field: string, value: any) => {
    setContactData((prev: any) => ({ ...prev, [field]: value }));
    setSaveStatus('Unsaved Changes');
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const handleSaveSettings = async (isAuto = false) => {
    setSaveStatus('Saving...');
    try {
      await setDoc(doc(db, 'settings', 'contact'), {
        ...contactData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      if (!isAuto) showToast('Contact settings updated');
      setSaveStatus('Saved');
    } catch (error) {
      console.error(error);
      if (!isAuto) alert('Failed to save settings');
      setSaveStatus('Unsaved Changes');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      showToast('Inquiry deleted');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      showToast('Failed to delete inquiry');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1">Contact</h2>
          <p className="text-sm text-gray-500">Manage contact information and view inquiries.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-8 space-y-6">
        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4">Section Titles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Section Title</label>
            <input type="text" value={contactData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="e.g. Let's build together." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Section Subtitle</label>
            <input type="text" value={contactData.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="e.g. Inquiries" />
          </div>
        </div>

        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4 mt-8">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
            <input type="text" value={contactData.email || ''} onChange={e => handleChange('email', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="e.g. hello@studio.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</label>
            <input type="text" value={contactData.phone || ''} onChange={e => handleChange('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="e.g. +1 234 567 890" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">WhatsApp</label>
            <input type="text" value={contactData.whatsapp || ''} onChange={e => handleChange('whatsapp', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="e.g. +1 234 567 890" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Address</label>
            <input type="text" value={contactData.address || ''} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="e.g. 123 Design St, NY" />
          </div>
        </div>

        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-white/5 pb-4 mt-8">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Instagram</label>
            <input type="text" value={contactData.instagram || ''} onChange={e => handleChange('instagram', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="URL" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">LinkedIn</label>
            <input type="text" value={contactData.linkedin || ''} onChange={e => handleChange('linkedin', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="URL" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Twitter</label>
            <input type="text" value={contactData.twitter || ''} onChange={e => handleChange('twitter', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm" placeholder="URL" />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {saveStatus === 'Saved' && <Check className="w-4 h-4 text-green-500" />}
            {saveStatus === 'Saving...' && <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
            {saveStatus}
          </div>
          <button onClick={() => handleSaveSettings(false)} disabled={saveStatus === 'Saving...' || saveStatus === 'Saved'} className="px-8 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50">
            {saveStatus === 'Saving...' && <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>}
            Save Settings
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg pt-4">Recent Inquiries</h3>
      <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-[24px] shadow-sm overflow-hidden p-2">
        {inquiries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No new inquiries.</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {inquiries.map((inquiry) => (
              <div 
                key={inquiry.id}
                className="flex flex-col sm:flex-row justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-black dark:text-white text-lg">{inquiry.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-black dark:hover:text-white transition-colors">{inquiry.email}</a>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-4 bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex items-start justify-end">
                  <button onClick={() => handleDelete(inquiry.id)} className="p-3 bg-white dark:bg-white/5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-xl transition-colors text-red-500 shadow-sm border border-gray-100 dark:border-transparent">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
