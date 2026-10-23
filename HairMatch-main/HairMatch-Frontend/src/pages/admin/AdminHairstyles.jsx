import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'];
const GENDERS = ['men', 'women'];

const EMPTY_FORM = {
  name: '', description: '', gender: 'men',
  suitableFor: [], tags: '', trending: false, rating: '4.0',
};

// ── Hairstyle Modal ────────────────────────────────────────────────────────
function HairstyleModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    return {
      ...EMPTY_FORM,
      ...initial,
      tags:       Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
      rating:     String(initial.rating ?? '4.0'),
      trending:   !!initial.trending,
      suitableFor: Array.isArray(initial.suitableFor) ? initial.suitableFor : [],
    };
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(initial?.imageUrl || null);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();
  const isEdit  = !!initial?._id;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleShape = (s) =>
    set('suitableFor', form.suitableFor.includes(s)
      ? form.suitableFor.filter((x) => x !== s)
      : [...form.suitableFor, s]);

  const handleImage = (f) => {
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.gender || form.suitableFor.length === 0) {
      toast.error('Fill in all required fields and select at least one face shape.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'suitableFor') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) {
        await api.put(`/admin/hairstyles/${initial._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Hairstyle updated.');
      } else {
        await api.post('/admin/hairstyles', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Hairstyle created.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const ic = 'w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const lc = 'block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl bg-dark-700 border border-dark-500 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600 sticky top-0 bg-dark-700 z-10">
          <h2 className="font-display text-xl font-bold text-slate-100">
            {isEdit ? 'Edit Hairstyle' : 'Add New Hairstyle'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-200 hover:bg-dark-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label className={lc}>Name *</label>
            <input className={ic} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Classic Pompadour" required />
          </div>

          {/* Description */}
          <div>
            <label className={lc}>Description *</label>
            <textarea className={`${ic} resize-none`} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description shown on cards" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className={lc}>Gender *</label>
              <select className={ic} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                {GENDERS.map((g) => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>

            {/* Base Rating */}
            <div>
              <label className={lc}>Base Rating (1–5)</label>
              <input type="number" min="1" max="5" step="0.1" className={ic} value={form.rating} onChange={(e) => set('rating', e.target.value)} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={lc}>Tags (comma separated)</label>
            <input className={ic} value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Classic, Formal, Trendy" />
          </div>

          {/* Trending toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('trending', !form.trending)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.trending ? 'bg-brand-600' : 'bg-dark-400'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.trending ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-slate-300">Mark as Trending</span>
          </div>

          {/* Suitable for */}
          <div>
            <label className={lc}>Suitable For * (select face shapes)</label>
            <div className="flex flex-wrap gap-2">
              {FACE_SHAPES.map((s) => (
                <button
                  key={s} type="button" onClick={() => toggleShape(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.suitableFor.includes(s)
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-dark-600 border-dark-400 text-slate-400 hover:border-brand-500/50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className={lc}>Reference Image</label>
            <div
              className="border-2 border-dashed border-dark-400 hover:border-brand-500/50 rounded-2xl p-4 cursor-pointer transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <div className="flex items-center gap-4">
                  <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-dark-400" />
                  <div>
                    <p className="text-sm text-slate-300 font-medium">Image selected</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 mx-auto mb-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm text-slate-400">Click to upload image</p>
                  <p className="text-xs text-slate-600 mt-0.5">JPG, PNG, WEBP · Max 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleImage(e.target.files[0])} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-dark-400 hover:border-dark-300 text-slate-300 font-semibold rounded-xl transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              {saving ? <><span className="btn-spinner" /> Saving...</> : (isEdit ? 'Save Changes' : 'Create Hairstyle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm bg-dark-700 border border-dark-500 rounded-3xl p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-slate-100 mb-2">Delete Hairstyle?</h3>
        <p className="text-slate-400 text-sm mb-6">
          "<span className="text-slate-200 font-medium">{name}</span>" will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-dark-400 text-slate-300 font-semibold rounded-xl text-sm hover:border-dark-300 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminHairstyles() {
  const [hairstyles, setHairstyles]     = useState([]);
  const [pagination, setPagination]     = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [modal, setModal]               = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search)       params.set('search', search);
      if (genderFilter) params.set('gender', genderFilter);
      const { data } = await api.get(`/admin/hairstyles?${params}`);
      setHairstyles(data.data);
      setPagination(data.pagination);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [search, genderFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/hairstyles/${deleteTarget._id}`);
      toast.success('Hairstyle deleted.');
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      {modal && (
        <HairstyleModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(pagination.page); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-100">Hairstyles</h1>
            <p className="text-slate-400 text-sm mt-1">{pagination.total} styles in database</p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Hairstyle
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Search hairstyles..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition-all"
            />
          </div>
          <select
            value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-brand-500 transition-all"
          >
            <option value="">All Genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : hairstyles.length === 0 ? (
          <div className="text-center py-20 bg-dark-800 border border-dark-600 rounded-2xl">
            <p className="text-slate-400">No hairstyles found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hairstyles.map((h) => (
              <div key={h._id} className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:border-dark-400 transition-all group">
                <div className="aspect-[4/3] bg-dark-700 overflow-hidden relative">
                  {h.imageUrl ? (
                    <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                  {h.trending && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500/90 text-white text-xs font-semibold rounded-full">Trending</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-100 text-sm leading-tight">{h.name}</h3>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-yellow-400 font-semibold">
                        {h.avgRating ? h.avgRating.toFixed(1) : h.rating?.toFixed(1)}
                      </p>
                      {h.totalRatings > 0 && (
                        <p className="text-xs text-slate-600">{h.totalRatings} reviews</p>
                      )}
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 bg-brand-600/15 text-brand-400 text-xs rounded-full border border-brand-500/20 capitalize">{h.gender}</span>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setModal(h)} className="flex-1 py-1.5 bg-dark-600 hover:bg-brand-600/20 border border-dark-400 hover:border-brand-500/40 text-slate-300 hover:text-brand-400 text-xs font-semibold rounded-lg transition-all">Edit</button>
                    <button onClick={() => setDeleteTarget(h)} className="flex-1 py-1.5 bg-dark-600 hover:bg-red-500/20 border border-dark-400 hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-lg transition-all">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => load(p)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                  p === pagination.page ? 'bg-brand-600 text-white' : 'bg-dark-700 border border-dark-500 text-slate-400 hover:border-brand-500'
                }`}
              >{p}</button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
