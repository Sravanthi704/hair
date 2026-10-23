import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import BeforeAfter from '../components/BeforeAfter';
import StylistFinder from '../components/StylistFinder';
import HairCareTips from '../components/HairCareTips';
import HairstyleDetailModal from '../components/HairstyleDetailModal';

const SHAPE_LABELS = { oval: 'Oval', round: 'Round', square: 'Square', heart: 'Heart', oblong: 'Oblong', diamond: 'Diamond' };
const SHAPE_DESCRIPTIONS = {
  oval:    'Oval is considered the ideal face shape — balanced proportions with a slightly wider forehead and gently narrowing chin. Almost any hairstyle works beautifully for you.',
  round:   'Round faces have soft, curved lines with similar width and length. The goal is to add height and length to create the illusion of a more elongated face.',
  square:  'Square faces have a strong, defined jawline with equal width at forehead and jaw. Soft, layered styles work best to balance the angular features.',
  heart:   'Heart-shaped faces have a wider forehead and cheekbones that taper to a narrow, pointed chin. The goal is to add width at the jaw and minimize the forehead.',
  oblong:  'Oblong faces are longer than they are wide, with a long straight cheek line. The goal is to add width and reduce the appearance of length.',
  diamond: 'Diamond faces have a narrow forehead and chin with wide cheekbones. The goal is to add width at the forehead and chin while minimizing cheekbone width.',
};

// ── SVG Icons ──────────────────────────────────────────────────────────────
const CompareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const StarIcon = ({ filled, half }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ── Before/After Modal ─────────────────────────────────────────────────────
function CompareModal({ userPhoto, style, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/85 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-dark-700 border border-dark-500 rounded-3xl shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <div>
            <h3 className="font-semibold text-slate-100">Before & After</h3>
            <p className="text-slate-500 text-xs mt-0.5">Drag the slider to compare</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-200 hover:bg-dark-500 transition-colors"><CloseIcon /></button>
        </div>
        <div className="p-5">
          <BeforeAfter userPhoto={userPhoto} stylePhoto={style.imageUrl} styleName={style.name} />
        </div>
        <div className="px-5 pb-5">
          <div className="bg-dark-600 border border-dark-400 rounded-2xl p-4">
            <h4 className="font-semibold text-slate-100 mb-1">{style.name}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{style.description}</p>
            {style.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {style.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-brand-600/15 text-brand-400 text-xs rounded-full border border-brand-500/20">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Modal ─────────────────────────────────────────────────────────
function FeedbackModal({ style, onClose }) {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loadingFb, setLoadingFb]   = useState(true);
  const [tab, setTab] = useState('write'); // 'write' | 'read'

  // Load existing feedback
  useEffect(() => {
    if (!style?._id) return;
    api.get(`/hairstyles/${style._id}/feedback`)
      .then(({ data }) => setFeedbacks(data.data || []))
      .catch(() => {})
      .finally(() => setLoadingFb(false));
  }, [style?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating.'); return; }
    if (comment.trim().length < 3) { toast.error('Please write at least a few words.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/hairstyles/${style._id}/rate`, { rating, comment: comment.trim() });
      toast.success(data.message);
      // Refresh feedback list
      const fb = await api.get(`/hairstyles/${style._id}/feedback`);
      setFeedbacks(fb.data.data || []);
      setTab('read');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/85 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md bg-dark-700 border border-dark-500 rounded-3xl shadow-2xl animate-slide-up max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-500 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-slate-100">{style.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5">Rate & leave feedback</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:text-slate-200 hover:bg-dark-500 transition-colors"><CloseIcon /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-500 flex-shrink-0">
          {[{ key: 'write', label: 'Write Review' }, { key: 'read', label: `Reviews (${feedbacks.length})` }].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t.key ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'write' ? (
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Star rating */}
              <div>
                <p className="text-sm font-medium text-slate-300 mb-3">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <StarIcon filled={star <= (hover || rating)} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this hairstyle..."
                  rows={4}
                  className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-slate-600 mt-1 text-right">{comment.length}/500</p>
              </div>

              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? <><span className="btn-spinner" /> Submitting...</> : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="p-5">
              {loadingFb ? (
                <div className="flex justify-center py-8"><div className="spinner" /></div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 text-sm">No reviews yet.</p>
                  <button onClick={() => setTab('write')} className="text-brand-400 text-xs mt-2 hover:underline">Be the first to review</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((fb, i) => (
                    <div key={i} className="bg-dark-600 border border-dark-400 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {fb.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{fb.user?.name || 'User'}</p>
                            <p className="text-xs text-slate-600">
                              {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {/* Stars */}
                        <div className="flex gap-0.5 flex-shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={s <= fb.rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hairstyle Card ─────────────────────────────────────────────────────────
function HairstyleCard({ style, userPhoto, onCompare, onFeedback, onDetail }) {
  const [imgError, setImgError] = useState(false);
  const displayRating = style.avgRating || style.rating;

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-200 group">
      {/* Image — clickable to open detail */}
      <div
        className="relative aspect-[4/3] bg-dark-600 overflow-hidden cursor-pointer"
        onClick={() => onDetail(style)}
      >
        {style.imageUrl && !imgError ? (
          <img
            src={style.imageUrl} alt={style.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)} loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-dark-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        {style.trending && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500/90 text-white text-xs font-semibold rounded-full">Trending</span>
        )}
        {/* Rating badge */}
        {displayRating && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-dark-900/80 text-yellow-400 text-xs font-semibold rounded-full">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {displayRating.toFixed(1)}
            {style.totalRatings > 0 && <span className="text-slate-500">({style.totalRatings})</span>}
          </span>
        )}
        {/* Compare button on hover */}
        {userPhoto && (
          <button
            onClick={() => onCompare(style)}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-dark-900/80 hover:bg-brand-600 backdrop-blur-sm text-slate-200 hover:text-white text-xs font-semibold rounded-full transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200 whitespace-nowrap"
          >
            <CompareIcon /> Before & After
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-100 mb-1">{style.name}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-3">{style.description}</p>

        {style.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {style.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-brand-600/15 text-brand-400 text-xs rounded-full border border-brand-500/20">{tag}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          {userPhoto && (
            <button
              onClick={() => onCompare(style)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-600 hover:bg-brand-600/20 border border-dark-400 hover:border-brand-500/40 text-slate-400 hover:text-brand-400 text-xs font-semibold rounded-xl transition-all"
            >
              <CompareIcon /> Compare
            </button>
          )}
          <button
            onClick={() => onDetail(style)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-600 hover:bg-dark-500 border border-dark-400 hover:border-dark-300 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Details
          </button>
          <button
            onClick={() => onFeedback(style)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-dark-600 hover:bg-yellow-500/10 border border-dark-400 hover:border-yellow-500/30 text-slate-400 hover:text-yellow-400 text-xs font-semibold rounded-xl transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Rate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [compareStyle, setCompareStyle] = useState(null);
  const [feedbackStyle, setFeedbackStyle] = useState(null);
  const [detailStyle, setDetailStyle] = useState(null);

  useEffect(() => {
    api.get(`/analysis/${id}`)
      .then(({ data }) => setResult(data.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <div className="spinner" /><p className="text-slate-400">Loading your results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Analysis not found.</p>
        <Link to="/analyze" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">Try Again</Link>
      </div>
    );
  }

  const { faceShape, confidence, imageUrl, recommendations, stylestoAvoid, createdAt, selectedGender } = result;
  const gender      = selectedGender || 'men';
  const styles      = recommendations?.[gender] || [];
  const genderLabel = gender === 'men' ? 'Male' : 'Female';

  return (
    <>
      {compareStyle && <CompareModal userPhoto={imageUrl} style={compareStyle} onClose={() => setCompareStyle(null)} />}
      {feedbackStyle && <FeedbackModal style={feedbackStyle} onClose={() => setFeedbackStyle(null)} />}
      {detailStyle && <HairstyleDetailModal style={detailStyle} onClose={() => setDetailStyle(null)} />}

      <main className="min-h-[calc(100vh-4rem)] py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-10 animate-slide-up">

          {/* Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link to="/analyze" className="text-slate-400 hover:text-brand-400 text-sm transition-colors">← New Analysis</Link>
            <span className="text-slate-600 text-sm">
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Face shape card */}
          <div className="bg-gradient-to-br from-brand-600/15 to-purple-600/10 border border-brand-500/30 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              {imageUrl && (
                <img src={imageUrl} alt="Your photo" className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-2xl border-2 border-brand-500/30 shadow-xl flex-shrink-0" />
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest">Your Face Shape</p>
                  <span className="px-2 py-0.5 bg-dark-600 border border-dark-400 text-slate-400 text-xs rounded-full">{genderLabel}</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-100 mb-4">{SHAPE_LABELS[faceShape]}</h1>
                {confidence && (
                  <div className="mb-4 max-w-xs mx-auto sm:mx-0">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Confidence</span>
                      <span className="text-brand-400 font-semibold">{confidence}%</span>
                    </div>
                    <div className="w-full bg-dark-500 rounded-full h-2">
                      <div className="h-2 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full" style={{ width: `${confidence}%` }} />
                    </div>
                  </div>
                )}
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-5">{SHAPE_DESCRIPTIONS[faceShape]}</p>
                <div className="flex gap-3 justify-center sm:justify-start">
                  <Link to="/history" className="px-4 py-2 border border-dark-400 hover:border-brand-500 text-slate-300 hover:text-brand-400 text-sm font-medium rounded-full transition-colors">View History</Link>
                  <Link to="/analyze" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-colors">New Analysis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-3xl font-bold text-slate-100">Recommended Hairstyles</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {genderLabel} hairstyles for a <span className="text-brand-400 font-medium">{SHAPE_LABELS[faceShape]}</span> face shape
                </p>
              </div>
            </div>

            {styles.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {styles.map((style, i) => (
                  <HairstyleCard
                    key={style._id || i}
                    style={style}
                    userPhoto={imageUrl}
                    onCompare={setCompareStyle}
                    onFeedback={setFeedbackStyle}
                    onDetail={setDetailStyle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-dark-700 border border-dark-500 rounded-2xl">
                <p className="text-slate-400 font-medium mb-1">No hairstyles found</p>
                <p className="text-slate-500 text-sm">No {genderLabel.toLowerCase()} hairstyles available for {SHAPE_LABELS[faceShape]} face shape yet.</p>
                <Link to="/analyze" className="inline-block mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-colors">Try Again</Link>
              </div>
            )}
          </section>

          {/* Styles to avoid */}
          {stylestoAvoid?.length > 0 && (
            <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-red-400 font-semibold mb-4">Styles to Avoid</h3>
              <div className="flex flex-wrap gap-2">
                {stylestoAvoid.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-full">{item}</span>
                ))}
              </div>
            </section>
          )}

          <StylistFinder faceShape={SHAPE_LABELS[faceShape]} />
          <HairCareTips />
        </div>
      </main>
    </>
  );
}
