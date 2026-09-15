import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Camera, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  UploadCloud, 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  KeyRound,
  User as UserIcon
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AdminUser } from '../types';
import { compressImage } from '../lib/imageUtils';
import { OptimizedImage } from '../components/ui/OptimizedImage';

const ROLE_OPTIONS = [
  'Super Administrator',
  'Administrator',
  'Principal Architect',
  'Studio Manager',
  'Content Editor',
  'Viewer'
];

export function UsersAdmin() {
  const { currentUser, updateCurrentUser } = useAuth();

  // Active tab: 'profile' | 'all-users'
  const [activeTab, setActiveTab] = useState<'profile' | 'all-users'>('profile');

  // Profile Form state (for logged in user)
  const [profileForm, setProfileForm] = useState<Partial<AdminUser>>({
    name: '',
    username: '',
    email: '',
    role: 'Super Administrator',
    avatarUrl: '',
    password: '',
    phone: '',
    bio: ''
  });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // All Users List state
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState<Partial<AdminUser>>({
    name: '',
    username: '',
    email: '',
    role: 'Administrator',
    avatarUrl: '',
    password: '',
    phone: '',
    bio: '',
    status: 'active'
  });
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [uploadingModalAvatar, setUploadingModalAvatar] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; show: boolean; type?: 'success' | 'error' }>({
    message: '',
    show: false,
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, show: true, type });
    setTimeout(() => setToast({ message: '', show: false }), 3500);
  };

  // Sync profile form with currentUser
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        role: currentUser.role || 'Super Administrator',
        avatarUrl: currentUser.avatarUrl || '',
        password: currentUser.password || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  // Subscribe to all users in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users: AdminUser[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data() } as AdminUser);
      });

      // If database has no users yet, seed current user or default admin
      if (users.length === 0 && currentUser) {
        const seedUser: AdminUser = {
          id: currentUser.id || 'admin-default',
          username: currentUser.username || 'admin',
          name: currentUser.name || 'Super Admin',
          email: currentUser.email || 'admin@sidapstudio.com',
          role: currentUser.role || 'Super Administrator',
          avatarUrl: currentUser.avatarUrl || '',
          password: currentUser.password || 'admin 123',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDoc(doc(db, 'users', seedUser.id), seedUser, { merge: true }).catch(console.error);
        users.push(seedUser);
      }

      setUsersList(users);
    }, (error) => {
      console.warn('Error loading users collection:', error);
    });

    return () => unsub();
  }, [currentUser]);

  // Handle Profile avatar upload
  const handleProfileAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const base64Url = await compressImage(file, 400, 0.85);
      setProfileForm(prev => ({ ...prev, avatarUrl: base64Url }));
      showToast('Avatar image selected. Click Save to apply.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to compress avatar image', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Modal avatar upload
  const handleModalAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingModalAvatar(true);
    try {
      const base64Url = await compressImage(file, 400, 0.85);
      setModalForm(prev => ({ ...prev, avatarUrl: base64Url }));
    } catch (err) {
      console.error(err);
      showToast('Failed to process image', 'error');
    } finally {
      setUploadingModalAvatar(false);
    }
  };

  // Save current user profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.username?.trim()) {
      showToast('Username/Login ID is required', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateCurrentUser({
        name: profileForm.name || profileForm.username,
        username: profileForm.username.trim(),
        email: profileForm.email?.trim() || '',
        role: profileForm.role || 'Super Administrator',
        avatarUrl: profileForm.avatarUrl || '',
        password: profileForm.password || '',
        phone: profileForm.phone || '',
        bio: profileForm.bio || ''
      });

      showToast('Profile updated successfully! Top right corner updated.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Modal for Create or Edit
  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setModalForm({
      name: '',
      username: '',
      email: '',
      role: 'Administrator',
      avatarUrl: '',
      password: '',
      phone: '',
      bio: '',
      status: 'active'
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUserId(user.id);
    setModalForm({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'Administrator',
      avatarUrl: user.avatarUrl || '',
      password: user.password || '',
      phone: user.phone || '',
      bio: user.bio || '',
      status: user.status || 'active'
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  // Submit Modal Form (Add / Edit User)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.username?.trim()) {
      showToast('Username is required', 'error');
      return;
    }
    if (!modalForm.password?.trim() && !editingUserId) {
      showToast('Password is required for new user', 'error');
      return;
    }

    setIsSubmittingModal(true);
    try {
      const id = editingUserId || `user-${Date.now()}`;
      const payload: AdminUser = {
        id,
        name: modalForm.name?.trim() || modalForm.username!.trim(),
        username: modalForm.username!.trim(),
        email: modalForm.email?.trim() || '',
        role: modalForm.role || 'Administrator',
        avatarUrl: modalForm.avatarUrl || '',
        password: modalForm.password || '',
        phone: modalForm.phone?.trim() || '',
        bio: modalForm.bio?.trim() || '',
        status: modalForm.status || 'active',
        updatedAt: new Date().toISOString(),
        createdAt: editingUserId ? (usersList.find(u => u.id === editingUserId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
      };

      await setDoc(doc(db, 'users', id), payload, { merge: true });

      // If user edited their own record via table, update current user state
      if (currentUser?.id === id) {
        await updateCurrentUser(payload);
      }

      showToast(editingUserId ? 'User updated successfully' : 'New user account created', 'success');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save user account', 'error');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userToDelete: AdminUser) => {
    if (currentUser?.id === userToDelete.id || currentUser?.username === userToDelete.username) {
      showToast('You cannot delete your own active account!', 'error');
      return;
    }

    if (usersList.length <= 1) {
      showToast('Cannot delete the last remaining administrator account.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user account "${userToDelete.name || userToDelete.username}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      showToast('User account deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user account', 'error');
    }
  };

  // Filtered users list
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-1 flex items-center gap-3">
            <Users className="w-7 h-7 text-black dark:text-white" />
            User Management & Profile
          </h2>
          <p className="text-sm text-gray-500">
            Manage admin users, roles, system access, and customize your profile photo and identity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('all-users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all-users'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            All Accounts ({usersList.length})
          </button>
        </div>
      </div>

      {/* TAB 1: MY PROFILE */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Avatar & Quick Preview Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-gray-900 via-gray-800 to-black dark:from-white/10 dark:via-white/5 dark:to-transparent" />
              
              <div className="relative pt-6 flex flex-col items-center">
                <div className="relative group mb-4">
                  {profileForm.avatarUrl ? (
                    <OptimizedImage 
                      src={profileForm.avatarUrl} 
                      alt="Avatar" 
                      className="w-28 h-28 rounded-full object-cover shadow-xl border-4 border-white dark:border-[#18181B]"
                      containerClassName="w-28 h-28 rounded-full"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 dark:from-white/20 dark:to-white/10 flex items-center justify-center text-white font-bold text-3xl uppercase shadow-xl border-4 border-white dark:border-[#18181B]">
                      {(profileForm.name || profileForm.username || 'A').slice(0, 2)}
                    </div>
                  )}

                  {/* Upload Avatar Overlay Button */}
                  <label 
                    className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                    title="Change Avatar"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Upload</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleProfileAvatarUpload} 
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-black dark:text-white">
                    {profileForm.name || profileForm.username || 'Admin'}
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Active" />
                </div>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 mb-3">
                  <Shield className="w-3.5 h-3.5" />
                  {profileForm.role || 'Super Administrator'}
                </span>

                <p className="text-xs text-gray-400 max-w-[240px] truncate mb-4">
                  {profileForm.email || 'admin@sidapstudio.com'}
                </p>

                <div className="w-full pt-4 border-t border-gray-100 dark:border-white/5 text-left space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Username / ID</span>
                    <span className="font-mono font-medium text-black dark:text-white">{profileForm.username || 'admin'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Status</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                </div>

                {profileForm.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setProfileForm(p => ({ ...p, avatarUrl: '' }))}
                    className="mt-4 text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Avatar Photo
                  </button>
                )}
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex gap-3.5">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Live Header Synchronization</span>
                Foto profil, nama lengkap, dan status role Anda akan langsung tersinkronisasi di pojok kanan atas Admin Header setelah Anda menekan tombol simpan.
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                <h3 className="text-lg font-bold text-black dark:text-white">Account Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">Edit your primary identity and login credentials</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Full Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name || ''}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Nur Hidayat"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Username / Login ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.username || ''}
                    onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="e.g. admin"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="admin@sidapstudio.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Role & Permissions
                  </label>
                  <select
                    value={profileForm.role || 'Super Administrator'}
                    onChange={e => setProfileForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm font-medium"
                  >
                    {ROLE_OPTIONS.map(role => (
                      <option key={role} value={role} className="bg-white dark:bg-[#18181B]">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={profileForm.phone || ''}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+62 812 3456 7890"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showProfilePassword ? "text" : "password"}
                      value={profileForm.password || ''}
                      onChange={e => setProfileForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePassword(!showProfilePassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Short Bio / Note
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio || ''}
                  onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell something about your role in Sidap Studio..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 focus:bg-white dark:focus:bg-[#18181B] outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-8 py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save & Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* TAB 2: ALL USER ACCOUNTS DIRECTORY */}
      {activeTab === 'all-users' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#18181B] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, username, or role..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-xs font-medium"
                />
              </div>

              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                <option value="ALL">All Roles</option>
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Admin User
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#18181B] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">User Account</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Role / Title</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Contact</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                        No user accounts found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isMe = currentUser?.id === u.id || currentUser?.username === u.username;
                      return (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                          {/* User Avatar & Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <OptimizedImage 
                                  src={u.avatarUrl} 
                                  alt={u.name} 
                                  className="w-10 h-10 rounded-full object-cover"
                                  containerClassName="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 dark:from-white/20 dark:to-white/10 flex items-center justify-center text-white font-bold text-xs uppercase border border-white/10">
                                  {(u.name || u.username || 'A').slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-black dark:text-white flex items-center gap-2">
                                  {u.name || u.username}
                                  {isMe && (
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">@{u.username}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                              <Shield className="w-3 h-3 text-gray-500" />
                              {u.role || 'Administrator'}
                            </span>
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-6 text-xs text-gray-500 space-y-0.5">
                            <div>{u.email || '-'}</div>
                            {u.phone && <div className="text-[11px] text-gray-400">{u.phone}</div>}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(u)}
                                className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              {!isMe && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#18181B] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/10">
                    <UserPlus className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black dark:text-white">
                      {editingUserId ? 'Edit User Account' : 'Add New Admin User'}
                    </h3>
                    <p className="text-xs text-gray-500">Configure credentials and permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleModalSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 custom-scrollbar">
                {/* Avatar Preview & Upload */}
                <div className="flex items-center gap-4">
                  {modalForm.avatarUrl ? (
                    <OptimizedImage 
                      src={modalForm.avatarUrl} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover"
                      containerClassName="w-16 h-16 rounded-full border border-gray-200 dark:border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 dark:from-white/20 dark:to-white/10 flex items-center justify-center text-white font-bold text-lg uppercase">
                      {(modalForm.name || modalForm.username || 'U').slice(0, 2)}
                    </div>
                  )}

                  <div>
                    <label className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-gray-500" />
                      <span>{uploadingModalAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleModalAvatarUpload} 
                        disabled={uploadingModalAvatar}
                      />
                    </label>
                    {modalForm.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setModalForm(m => ({ ...m, avatarUrl: '' }))}
                        className="block text-[11px] text-red-500 hover:underline mt-1 font-medium"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.name || ''}
                    onChange={e => setModalForm(m => ({ ...m, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Username / Login ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={modalForm.username || ''}
                      onChange={e => setModalForm(m => ({ ...m, username: e.target.value }))}
                      placeholder="e.g. johndoe"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Role
                    </label>
                    <select
                      value={modalForm.role || 'Administrator'}
                      onChange={e => setModalForm(m => ({ ...m, role: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm font-medium"
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={modalForm.email || ''}
                    onChange={e => setModalForm(m => ({ ...m, email: e.target.value }))}
                    placeholder="john@sidapstudio.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Login Password {!editingUserId && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? "text" : "password"}
                      value={modalForm.password || ''}
                      onChange={e => setModalForm(m => ({ ...m, password: e.target.value }))}
                      placeholder={editingUserId ? "Leave empty to keep existing password" : "Enter password"}
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black dark:focus:border-white/20 outline-none text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingModal}
                    className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    {isSubmittingModal ? 'Saving...' : (editingUserId ? 'Save Changes' : 'Create User')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-black text-white dark:bg-white dark:text-black'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-white" />
            ) : (
              <Check className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
