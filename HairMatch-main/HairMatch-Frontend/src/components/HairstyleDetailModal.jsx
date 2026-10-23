import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── Hair care tips generator ───────────────────────────────────────────────
export const getHairCareTips = (style) => {
  const tags = (style.tags || []).map(t => t.toLowerCase());
  const name = (style.name || '').toLowerCase();
  const tips = [];

  // Wash frequency
  if (tags.some(t => ['short','buzz','crew','fade'].includes(t)) || name.includes('buzz') || name.includes('crew'))
    tips.push({ icon: '💧', label: 'Wash Frequency', value: 'Every 1–2 days — short styles collect oil quickly.' });
  else if (tags.some(t => ['curly','coily','afro'].includes(t)))
    tips.push({ icon: '💧', label: 'Wash Frequency', value: 'Every 3–5 days — curly hair needs moisture retention.' });
  else if (tags.some(t => ['wavy','waves'].includes(t)))
    tips.push({ icon: '💧', label: 'Wash Frequency', value: 'Every 2–3 days — preserve natural wave pattern.' });
  else
    tips.push({ icon: '💧', label: 'Wash Frequency', value: 'Every 2–3 days — balance cleanliness and moisture.' });

  // Product
  if (tags.includes('sleek') || tags.includes('slick') || name.includes('slick'))
    tips.push({ icon: '🧴', label: 'Product', value: 'Use a medium-hold pomade or gel for a polished, sleek finish.' });
  else if (tags.some(t => ['volume','pompadour','quiff'].includes(t)))
    tips.push({ icon: '🧴', label: 'Product', value: 'Use a volumizing mousse or light-hold wax to build height.' });
  else if (tags.some(t => ['curly','wavy','waves'].includes(t)))
    tips.push({ icon: '🧴', label: 'Product', value: 'Use a curl cream or sea salt spray to define texture.' });
  else if (tags.some(t => ['textured','shaggy','fringe'].includes(t)))
    tips.push({ icon: '🧴', label: 'Product', value: 'Use a matte clay or texture paste for a natural, lived-in look.' });
  else
    tips.push({ icon: '🧴', label: 'Product', value: 'Use a lightweight styling cream or serum for shine and control.' });

  // Heat styling
  if (tags.some(t => ['straight','sleek','blowout'].includes(t)))
    tips.push({ icon: '🔥', label: 'Heat Styling', value: 'Always apply heat protectant before blow-drying or straightening.' });
  else if (tags.some(t => ['curly','wavy','waves','natural'].includes(t)))
    tips.push({ icon: '🔥', label: 'Heat Styling', value: 'Air dry or diffuse on low heat to preserve natural texture.' });
  else
    tips.push({ icon: '🔥', label: 'Heat Styling', value: 'Use heat protectant spray before any hot tool styling.' });

  // Trim schedule
  if (tags.some(t => ['short','buzz','crew','fade'].includes(t)))
    tips.push({ icon: '✂️', label: 'Trim Schedule', value: 'Every 3–4 weeks to keep the shape sharp and clean.' });
  else if (tags.some(t => ['long','layers','lob','bob'].includes(t)))
    tips.push({ icon: '✂️', label: 'Trim Schedule', value: 'Every 8–10 weeks to remove split ends and maintain shape.' });
  else
    tips.push({ icon: '✂️', label: 'Trim Schedule', value: 'Every 6–8 weeks to keep the style looking fresh.' });

  // Overnight care
  if (tags.some(t => ['curly','wavy','waves','coily'].includes(t)))
    tips.push({ icon: '🌙', label: 'Overnight Care', value: 'Sleep on a satin pillowcase or use a satin bonnet to preserve texture.' });
  else if (tags.some(t => ['long','layers'].includes(t)))
    tips.push({ icon: '🌙', label: 'Overnight Care', value: 'Loosely braid or tie hair before bed to prevent tangles and breakage.' });
  else
    tips.push({ icon: '🌙', label: 'Overnight Care', value: 'Use a satin pillowcase to reduce friction and frizz overnight.' });

  return tips;
};

// ── Close icon ─────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Shared Detail Modal ────────────────────────────────────────────────────
// Props:
//   style      — hairstyle object
//   rank       — optional rank number (shown on trending page)
//   onClose    — close handler
export default function HairstyleDetailModal({ style, rank, onClose }) {
  const [imgError, setImgError] = useState(false);
  const displayRating = style.avgRating || style.rating;
  const tips = getHairCareTips(style);

  const Stars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} viewBox="0 0 24 24" className="w-4 h-4"
          fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-dark-700 border border-dark-500 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark-600/80 backdrop-blur-sm text-slate-400 hover:text-slate-100 hover:bg-dark-500 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {/* Full image — no crop */}
        <div className="relative w-full bg-dark-600 overflow-hidden rounded-t-3xl">
          {style.imageUrl && !imgError ? (
            <img
              src={style.imageUrl} alt={style.name}
              className="w-full max-h-[70vh] object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 text-dark-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          )}

          {/* Rank badge — only shown when rank is provided */}
          {rank != null && (
            <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10 ${
              rank === 1 ? 'bg-yellow-500 text-dark-900 shadow-yellow-500/40' :
              rank === 2 ? 'bg-slate-400 text-dark-900' :
              rank === 3 ? 'bg-orange-600 text-white shadow-orange-600/40' :
              'bg-dark-600 border border-dark-400 text-slate-300'
            }`}>
              #{rank}
            </div>
          )}

          {/* Trending badge */}
          {style.trending && (
            <span className="absolute top-4 right-14 flex items-center gap-1 px-3 py-1 bg-orange-500/90 text-white text-xs font-semibold rounded-full z-10">
              Hot
            </span>
          )}

          {/* Subtle bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-dark-700/60 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Title + rating */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">{style.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-brand-600/20 text-brand-400 text-xs font-semibold rounded-full border border-brand-500/20 capitalize">
                  {style.gender}
                </span>
                {style.suitableFor?.map(s => (
                  <span key={s} className="px-2.5 py-0.5 bg-dark-600 border border-dark-400 text-slate-400 text-xs rounded-full capitalize">
                    {s} face
                  </span>
                ))}
              </div>
            </div>
            {displayRating > 0 && (
              <div className="text-center flex-shrink-0">
                <p className="text-2xl font-bold text-yellow-400">{displayRating.toFixed(1)}</p>
                <Stars rating={displayRating} />
                {style.totalRatings > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">{style.totalRatings} reviews</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-300 leading-relaxed">{style.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-600 border border-dark-500 rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-brand-400">{style.recommendationCount || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Times Recommended</p>
            </div>
            <div className="bg-dark-600 border border-dark-500 rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-brand-400">{style.totalRatings || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">User Reviews</p>
            </div>
          </div>

          {/* Tags */}
          {style.tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Style Tags</p>
              <div className="flex flex-wrap gap-2">
                {style.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-brand-600/15 text-brand-400 text-xs font-medium rounded-full border border-brand-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hair care tips */}
          <div className="bg-dark-600 border border-dark-500 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-brand-400">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-slate-100">How to Maintain This Style</h3>
            </div>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{tip.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide">{tip.label}</p>
                    <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{tip.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-1">
            <Link
              to="/analyze"
              onClick={onClose}
              className="flex-1 text-center py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Analyze My Face Shape
            </Link>
            <Link
              to="/quiz"
              onClick={onClose}
              className="flex-1 text-center py-3 border border-dark-400 hover:border-brand-500 text-slate-300 hover:text-brand-400 font-semibold rounded-xl transition-colors text-sm"
            >
              Take Style Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
