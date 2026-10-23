import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

// ── SVG Icons ──────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const EyeIcon = ({ off }) => off ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  // Profile form state
  const [name, setName]           = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [pwForm, setPwForm]       = useState({ old: '', new: '', confirm: '' });
  const [showPw, setShowPw]       = useState({ old: false, new: false, confirm: false });
  const [savingPw, setSavingPw]   = useState(false);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters.'); return; }
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      if (avatarFile) fd.append('avatar', avatarFile);
      await api.put('/auth/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.old || !pwForm.new || !pwForm.confirm) { toast.error('Fill in all password fields.'); return; }
    if (pwForm.new.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (pwForm.new !== pwForm.confirm) { toast.error('New passwords do not match.'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { oldPassword: pwForm.old, newPassword: pwForm.new });
      toast.success('Password changed successfully!');
      setPwForm({ old: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const pwStrength = pwForm.new.length === 0 ? 0 : pwForm.new.length < 6 ? 1 : pwForm.new.length < 10 ? 2 : 3;
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];

  const inputCls = 'form-input';
  const labelCls = 'form-label';

  return (
    <main className="min-h-[calc(100vh-4rem)] py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-100">Your Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">

          {/* ── Left sidebar ── */}
          <div className="md:col-span-2 space-y-4">

            {/* Avatar card */}
            <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6 text-center">
              {/* Avatar with upload button */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500/40 shadow-lg shadow-brand-600/20">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Camera button */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-700 border-2 border-dark-700 flex items-center justify-center text-white transition-colors shadow-lg"
                  title="Change photo"
                >
                  <CameraIcon />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </div>

              <h2 className="font-semibold text-slate-100 text-lg leading-tight">{user?.name}</h2>
              <p className="text-slate-500 text-sm mt-0.5 mb-1">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="inline-block px-2 py-0.5 bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs font-semibold rounded-full mb-3">
                  Administrator
                </span>
              )}

              {/* Stats */}
              <div className="flex justify-center gap-6 py-4 border-y border-dark-500 mt-3 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-400">{user?.analysisCount || 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Analyses</p>
                </div>
                <div className="w-px bg-dark-500" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Member since</p>
                </div>
              </div>

              {user?.lastAnalysis && (
                <p className="text-xs text-slate-600 mb-4">
                  Last analysis:{' '}
                  {new Date(user.lastAnalysis).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}

              {/* Quick links */}
              <div className="space-y-2">
                <Link
                  to="/analyze"
                  className="block w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  New Analysis
                </Link>
                <Link
                  to="/history"
                  className="block w-full py-2 bg-dark-600 hover:bg-dark-500 border border-dark-400 text-slate-300 text-sm font-medium rounded-xl transition-colors"
                >
                  View History
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block w-full py-2 bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/20 text-brand-400 text-sm font-medium rounded-xl transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ── Right main ── */}
          <div className="md:col-span-3 space-y-5">

            {/* Edit profile */}
            <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <UserIcon />
                </div>
                <h3 className="font-semibold text-slate-100">Edit Profile</h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar upload hint */}
                {avatarFile && (
                  <div className="flex items-center gap-3 p-3 bg-brand-600/10 border border-brand-500/20 rounded-xl">
                    <img src={avatarPreview} alt="" className="w-10 h-10 rounded-full object-cover border border-brand-500/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">{avatarFile.name}</p>
                      <p className="text-xs text-slate-500">New profile photo selected</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatar || null); }}
                      className="text-slate-500 hover:text-red-400 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div>
                  <label className={labelCls}>Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Email address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className={`${inputCls} opacity-50 cursor-not-allowed`}
                  />
                  <p className="text-slate-600 text-xs mt-1">Email cannot be changed.</p>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
                >
                  {savingProfile ? <><span className="btn-spinner" /> Saving...</> : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <ShieldIcon />
                </div>
                <h3 className="font-semibold text-slate-100">Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Old password */}
                <div>
                  <label className={labelCls}>Current password</label>
                  <div className="relative">
                    <input
                      type={showPw.old ? 'text' : 'password'}
                      value={pwForm.old}
                      onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
                      placeholder="Your current password"
                      className={`${inputCls} pr-10`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw({ ...showPw, old: !showPw.old })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <EyeIcon off={showPw.old} />
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className={labelCls}>New password</label>
                  <div className="relative">
                    <input
                      type={showPw.new ? 'text' : 'password'}
                      value={pwForm.new}
                      onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                      placeholder="Min. 6 characters"
                      className={`${inputCls} pr-10`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw({ ...showPw, new: !showPw.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <EyeIcon off={showPw.new} />
                    </button>
                  </div>
                  {/* Strength meter */}
                  {pwForm.new.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? strengthColor[pwStrength] : 'bg-dark-400'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{strengthLabel[pwStrength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirm new password */}
                <div>
                  <label className={labelCls}>Confirm new password</label>
                  <div className="relative">
                    <input
                      type={showPw.confirm ? 'text' : 'password'}
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="Repeat new password"
                      className={`${inputCls} pr-10`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <EyeIcon off={showPw.confirm} />
                    </button>
                  </div>
                  {pwForm.confirm && pwForm.new !== pwForm.confirm && (
                    <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={savingPw}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
                >
                  {savingPw ? <><span className="btn-spinner" /> Updating...</> : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Sign out */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="font-semibold text-red-400 mb-1">Sign Out</h3>
              <p className="text-slate-500 text-sm mb-4">Sign out of your HairMatch account on this device.</p>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-semibold text-sm rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
