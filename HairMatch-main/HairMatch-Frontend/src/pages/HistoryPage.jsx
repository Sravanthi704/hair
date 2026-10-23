import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const SHAPE_ICONS = { oval: '⬭', round: '⬤', square: '⬛', heart: '♡', oblong: '▬', diamond: '◇' };

// ── SVG Icons ──────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm bg-dark-700 border border-dark-400 rounded-3xl shadow-2xl shadow-black/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:text-slate-200 hover:bg-dark-500 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-5">
            <TrashIcon />
          </div>

          <h2 className="font-display text-xl font-bold text-slate-100 mb-2">
            Delete Analysis?
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This will permanently delete this analysis and its uploaded photo. This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-dark-400 hover:border-dark-300 text-slate-300 hover:text-slate-100 font-semibold rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-red-600/20"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // ID pending delete confirmation
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/analysis/history?page=${page}&limit=9`);
      setAnalyses(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDeleteClick = (id) => setConfirmId(id);

  const handleDeleteConfirm = async () => {
    const id = confirmId;
    setConfirmId(null);
    setDeleting(id);
    try {
      await api.delete(`/analysis/${id}`);
      toast.success('Analysis deleted.');
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-slate-400">Loading history...</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete confirmation modal */}
      {confirmId && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <main className="min-h-[calc(100vh-4rem)] py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-100">Analysis History</h1>
              <p className="text-slate-500 text-sm mt-1">
                {pagination.total} total {pagination.total === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
            <Link
              to="/analyze"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-colors"
            >
              + New Analysis
            </Link>
          </div>

          {analyses.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-200 text-xl mb-2">No analyses yet</h3>
              <p className="text-slate-500 mb-6">Upload a photo to get your first hairstyle recommendation.</p>
              <Link to="/analyze" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full transition-colors">
                Start Analyzing
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {analyses.map((analysis) => (
                  <div key={analysis._id} className="bg-dark-700 border border-dark-500 rounded-2xl overflow-hidden hover:border-dark-400 transition-all group">
                    {/* Image */}
                    <div className="relative aspect-video bg-dark-600 overflow-hidden">
                      {analysis.imageUrl ? (
                        <img
                          src={analysis.imageUrl} alt="Face"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-10 h-10 text-dark-400">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      {/* Shape badge */}
                      <div className="absolute top-2 right-2 w-9 h-9 bg-dark-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-lg">
                        {SHAPE_ICONS[analysis.faceShape]}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-100 mb-0.5">
                        {analysis.faceShape.charAt(0).toUpperCase() + analysis.faceShape.slice(1)} Face
                      </h3>
                      {analysis.confidence && (
                        <p className="text-xs text-slate-500 mb-0.5">Confidence: {analysis.confidence}%</p>
                      )}
                      <p className="text-xs text-slate-600 mb-4">
                        {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          to={`/result/${analysis._id}`}
                          className="flex-1 text-center py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          View Results
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(analysis._id)}
                          disabled={deleting === analysis._id}
                          className="w-9 h-9 flex items-center justify-center bg-dark-600 hover:bg-red-500/20 border border-dark-400 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          aria-label="Delete analysis"
                        >
                          {deleting === analysis._id
                            ? <span className="btn-spinner border-red-400/30 border-t-red-400" />
                            : <DeleteIcon />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => fetchHistory(p)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                        p === pagination.page
                          ? 'bg-brand-600 text-white'
                          : 'bg-dark-700 border border-dark-500 text-slate-400 hover:border-brand-500 hover:text-brand-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
