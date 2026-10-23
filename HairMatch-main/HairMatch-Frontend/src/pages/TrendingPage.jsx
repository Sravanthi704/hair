import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import HairstyleDetailModal from '../components/HairstyleDetailModal';

// ── SVG Icons ──────────────────────────────────────────────────────────────
const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.5-3-1-4 0 0-1 2-2 2s-1-1-1-2c0-2 1-4 1-4z"/>
    <path d="M12 14c0 0-3 1-3 4a3 3 0 0 0 6 0c0-3-3-4-3-4z"/>
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);

// ── Rank badge ─────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return (
    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 z-10">
      <span className="text-dark-900 font-bold text-xs">#1</span>
    </div>
  );
  if (rank === 2) return (
    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center shadow-lg z-10">
      <span className="text-dark-900 font-bold text-xs">#2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30 z-10">
      <span className="text-white font-bold text-xs">#3</span>
    </div>
  );
  return (
    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-dark-600 border border-dark-400 flex items-center justify-center z-10">
      <span className="text-slate-400 font-semibold text-xs">#{rank}</span>
    </div>
  );
}

// ── Hairstyle card ─────────────────────────────────────────────────────────
function TrendingCard({ style, rank, onClick }) {
  const [imgError, setImgError] = useState(false);
  const displayRating = style.avgRating || style.rating;

  const Stars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= Math.round(rating)} />
      ))}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className="bg-dark-700 border border-dark-500 rounded-2xl overflow-hidden hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-dark-600 overflow-hidden">
        {style.imageUrl && !imgError ? (
          <img
            src={style.imageUrl} alt={style.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)} loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-dark-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}

        {/* Rank badge */}
        <RankBadge rank={rank} />

        {/* Trending badge */}
        {style.trending && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500/90 text-white text-xs font-semibold rounded-full">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M12 2c0 0-4 4-4 8a4 4 0 0 0 8 0c0-1.5-.5-3-1-4 0 0-1 2-2 2s-1-1-1-2c0-2 1-4 1-4z"/>
            </svg>
            Hot
          </span>
        )}

        {/* Gradient overlay for bottom info */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-dark-900/80 to-transparent" />

        {/* Rating on image */}
        {displayRating > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-dark-900/80 backdrop-blur-sm rounded-full">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-yellow-400 text-xs font-semibold">{displayRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-100 leading-tight">{style.name}</h3>
          <span className="px-2 py-0.5 bg-brand-600/15 text-brand-400 text-xs rounded-full border border-brand-500/20 capitalize flex-shrink-0">
            {style.gender}
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">{style.description}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Stars */}
          {displayRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Stars rating={displayRating} />
              <span className="text-xs text-slate-500">
                {style.totalRatings > 0 ? `(${style.totalRatings})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Recommendation count + highlight */}
        <div className="flex items-center justify-between">
          {style.recommendationCount > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-brand-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>
                Recommended <span className="text-brand-400 font-semibold">{style.recommendationCount}</span> times
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-600">New style</span>
          )}
        </div>

        {/* Tags */}
        {style.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {style.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-dark-600 border border-dark-500 text-slate-400 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TrendingPage() {
  const [hairstyles, setHairstyles] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy]         = useState('popular');
  const [genderFilter, setGenderFilter] = useState('');
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null); // for detail modal

  const fetchTrending = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortBy, limit: 18 });
      if (genderFilter) params.set('gender', genderFilter);
      const { data } = await api.get(`/hairstyles/trending?${params}`);
      setHairstyles(data.data || []);
      setStats(data.stats);
      setLastUpdated(new Date());
    } catch (err) {
      // Trending is public — show empty state gracefully
      setHairstyles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy, genderFilter]);

  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  const SORT_OPTIONS = [
    { key: 'popular', label: 'Most Popular' },
    { key: 'rating',  label: 'Top Rated' },
    { key: 'reviews', label: 'Most Reviewed' },
  ];

  const GENDER_OPTIONS = [
    { key: '',      label: 'All' },
    { key: 'men',   label: 'Men' },
    { key: 'women', label: 'Women' },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)]">

      {/* Detail modal */}
      {selectedStyle && (
        <HairstyleDetailModal
          style={selectedStyle.style}
          rank={selectedStyle.rank}
          onClose={() => setSelectedStyle(null)}
        />
      )}

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden bg-dark-800 border-b border-dark-600">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-700/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Live Data</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-100 mb-3">
                Trending Hairstyles
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">
                The most popular hairstyles right now — ranked by user ratings, reviews, and how often they're recommended.
              </p>

              {lastUpdated && (
                <p className="text-slate-600 text-xs mt-3">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchTrending(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-brand-500/40 text-slate-300 hover:text-brand-400 text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
            >
              <span className={refreshing ? 'animate-spin' : ''}><RefreshIcon /></span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Stats row removed */}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sticky top-16 z-30 bg-dark-900/90 backdrop-blur-md border-b border-dark-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">

          {/* Sort */}
          <div className="flex items-center gap-1 bg-dark-700 border border-dark-500 rounded-xl p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === opt.key
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-1 bg-dark-700 border border-dark-500 rounded-xl p-1">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setGenderFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  genderFilter === opt.key
                    ? 'bg-dark-500 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Result count */}
          {!loading && (
            <p className="text-slate-500 text-xs ml-auto">
              Showing <span className="text-slate-300 font-semibold">{hairstyles.length}</span> hairstyles
            </p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="spinner" />
            <p className="text-slate-400 text-sm">Loading trending hairstyles...</p>
          </div>
        ) : hairstyles.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <FireIcon />
            </div>
            <h3 className="font-semibold text-slate-200 text-xl mb-2">No hairstyles yet</h3>
            <p className="text-slate-500 mb-6">Be the first to analyze your face and rate hairstyles!</p>
            <Link to="/analyze" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full transition-colors">
              Start Analyzing
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium — featured row */}
            {hairstyles.length >= 3 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="#f59e0b" className="w-4 h-4">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h2 className="font-display text-xl font-bold text-slate-100">Top 3 This Week</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  {hairstyles.slice(0, 3).map((style, i) => (
                    <TrendingCard
                      key={style._id} style={style} rank={i + 1}
                      onClick={() => setSelectedStyle({ style, rank: i + 1 })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {hairstyles.length > 3 && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-dark-600" />
                <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">More Trending Styles</span>
                <div className="flex-1 h-px bg-dark-600" />
              </div>
            )}

            {/* Rest of the grid */}
            {hairstyles.length > 3 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {hairstyles.slice(3).map((style, i) => (
                  <TrendingCard
                    key={style._id} style={style} rank={i + 4}
                    onClick={() => setSelectedStyle({ style, rank: i + 4 })}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA for non-logged-in users */}
        <div className="mt-16 bg-gradient-to-br from-brand-600/15 to-purple-600/10 border border-brand-500/30 rounded-3xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-100 mb-3">
            Find your perfect hairstyle
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Upload a photo or take our style quiz to get personalized recommendations based on your face shape.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/analyze"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5"
            >
              Analyze My Face
            </Link>
            <Link
              to="/quiz"
              className="px-6 py-3 border border-dark-400 hover:border-brand-500 text-slate-300 hover:text-brand-400 font-semibold rounded-full transition-all"
            >
              Take Style Quiz
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
