import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm bg-dark-700 border border-dark-500 rounded-3xl p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
            <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
          </svg>
        </div>
        <h3 className="font-display text-xl font-bold text-slate-100 mb-2">Delete User?</h3>
        <p className="text-slate-400 text-sm mb-6">
          "<span className="text-slate-200 font-medium">{user.name}</span>" and all their analyses will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-dark-400 text-slate-300 font-semibold rounded-xl text-sm hover:border-dark-300 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggling, setToggling] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [search]);

  const handleToggleRole = async (user) => {
    setToggling(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/role`);
      toast.success(`Role updated to ${user.role === 'admin' ? 'user' : 'admin'}.`);
      load(pagination.page);
    } catch (err) { toast.error(err.message); }
    finally { setToggling(null); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success('User deleted.');
      setDeleteTarget(null);
      load(pagination.page);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      {deleteTarget && <DeleteModal user={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-100">Users</h1>
            <p className="text-slate-400 text-sm mt-1">{pagination.total} registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-700 border border-dark-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-dark-800 border border-dark-600 rounded-2xl">
            <p className="text-slate-400">No users found.</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-700 border-b border-dark-600">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyses</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-dark-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-200 font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{u.email}</td>
                      <td className="px-4 py-3 text-center text-slate-300 font-semibold">{u.analysisCount || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20' : 'bg-dark-600 text-slate-400 border border-dark-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={toggling === u._id}
                            className="px-3 py-1.5 bg-dark-600 hover:bg-brand-600/20 border border-dark-400 hover:border-brand-500/40 text-slate-300 hover:text-brand-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            {toggling === u._id ? '...' : u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="px-3 py-1.5 bg-dark-600 hover:bg-red-500/20 border border-dark-400 hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
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
