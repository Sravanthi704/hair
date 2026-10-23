import { useState } from 'react';

// ── Hair care data ─────────────────────────────────────────────────────────
const HAIR_CARE_DATA = {
  straight: {
    label: 'Straight',
    tagline: 'Smooth, sleek, and naturally flat',
    color: 'brand',
    washFrequency: {
      title: 'Wash Frequency',
      value: 'Every 1–2 days',
      detail: 'Straight hair tends to get oily quickly as sebum travels easily down the shaft. Washing every 1–2 days keeps it fresh without stripping natural oils.',
    },
    routine: [
      {
        step: '01',
        phase: 'Cleanse',
        title: 'Clarifying or Balancing Shampoo',
        desc: 'Use a lightweight, sulfate-free shampoo that removes oil buildup without over-drying. Focus on the scalp, not the ends.',
        products: ['Lightweight shampoo', 'Clarifying shampoo (weekly)', 'Dry shampoo for in-between days'],
      },
      {
        step: '02',
        phase: 'Condition',
        title: 'Lightweight Conditioner',
        desc: 'Apply a light conditioner from mid-length to ends only. Heavy conditioners will weigh straight hair down and make it look flat.',
        products: ['Lightweight conditioner', 'Leave-in conditioner spray', 'Detangling spray'],
      },
      {
        step: '03',
        phase: 'Protect',
        title: 'Heat Protectant',
        desc: 'Straight hair is often heat-styled. Always apply a heat protectant spray before using any hot tools to prevent breakage and split ends.',
        products: ['Heat protectant spray', 'Smoothing serum', 'Anti-frizz spray'],
      },
      {
        step: '04',
        phase: 'Style',
        title: 'Smoothing & Shine Products',
        desc: 'Use a small amount of shine serum or light pomade to add gloss and control flyaways. Avoid heavy waxes that cause buildup.',
        products: ['Shine serum', 'Light pomade', 'Finishing spray'],
      },
    ],
    tips: [
      'Brush from ends to roots to prevent breakage',
      'Use a boar bristle brush to distribute natural oils',
      'Sleep on a silk pillowcase to reduce friction',
      'Trim every 6–8 weeks to prevent split ends',
      'Avoid touching your hair throughout the day — oils from hands cause greasiness',
    ],
    avoid: [
      'Heavy creams and butters',
      'Washing with very hot water',
      'Skipping heat protectant',
      'Over-brushing when wet',
    ],
  },

  wavy: {
    label: 'Wavy',
    tagline: 'Natural S-waves with volume and movement',
    color: 'purple',
    washFrequency: {
      title: 'Wash Frequency',
      value: 'Every 2–3 days',
      detail: 'Wavy hair benefits from some natural oil to define waves. Washing every 2–3 days maintains moisture balance and enhances wave pattern.',
    },
    routine: [
      {
        step: '01',
        phase: 'Cleanse',
        title: 'Moisturizing Shampoo',
        desc: 'Use a sulfate-free, moisturizing shampoo. Wavy hair needs hydration to prevent frizz. Scrunch the shampoo in rather than rubbing.',
        products: ['Sulfate-free shampoo', 'Co-wash (conditioner wash)', 'Scalp scrub (weekly)'],
      },
      {
        step: '02',
        phase: 'Condition',
        title: 'Medium-Weight Conditioner',
        desc: 'Apply conditioner generously from mid-length to ends. Use a wide-tooth comb to distribute evenly. Leave on for 2–3 minutes before rinsing.',
        products: ['Moisturizing conditioner', 'Deep conditioning mask (weekly)', 'Leave-in conditioner'],
      },
      {
        step: '03',
        phase: 'Define',
        title: 'Wave-Enhancing Products',
        desc: 'Apply a curl/wave cream or mousse to soaking wet hair. Scrunch upward to encourage wave formation. Avoid touching until fully dry.',
        products: ['Wave cream', 'Light-hold mousse', 'Sea salt spray for texture'],
      },
      {
        step: '04',
        phase: 'Dry',
        title: 'Diffuse or Air Dry',
        desc: 'Air drying is best for wavy hair. If using a diffuser, use low heat and low speed. Scrunch out the crunch once fully dry.',
        products: ['Microfiber towel', 'Diffuser attachment', 'Anti-frizz oil (finishing)'],
      },
    ],
    tips: [
      'Scrunch — never rub — your hair with a towel',
      'Apply products to soaking wet hair for best wave definition',
      'Plop your hair in a microfiber towel for 20 minutes after washing',
      'Refresh waves on day 2–3 with a water + conditioner spray',
      'Sleep in a loose pineapple bun to preserve waves overnight',
    ],
    avoid: [
      'Brushing dry wavy hair (causes frizz)',
      'Terry cloth towels',
      'Heavy oils on the scalp',
      'Skipping conditioner',
    ],
  },

  curly: {
    label: 'Curly',
    tagline: 'Defined springy curls with natural bounce',
    color: 'emerald',
    washFrequency: {
      title: 'Wash Frequency',
      value: 'Every 3–5 days',
      detail: 'Curly hair is naturally drier because sebum has difficulty traveling down the spiral shaft. Washing less frequently preserves essential moisture.',
    },
    routine: [
      {
        step: '01',
        phase: 'Pre-Wash',
        title: 'Pre-Poo Treatment',
        desc: 'Apply a nourishing oil (coconut, olive, or argan) to dry hair 30 minutes before washing. This protects curls from losing too much moisture during cleansing.',
        products: ['Coconut oil', 'Argan oil', 'Pre-poo treatment mask'],
      },
      {
        step: '02',
        phase: 'Cleanse',
        title: 'Gentle Sulfate-Free Shampoo',
        desc: 'Use a gentle, sulfate-free shampoo or co-wash. Focus on the scalp only. Curly hair needs its natural oils — harsh shampoos strip them away.',
        products: ['Sulfate-free shampoo', 'Co-wash', 'Clarifying shampoo (monthly)'],
      },
      {
        step: '03',
        phase: 'Deep Condition',
        title: 'Weekly Deep Conditioning',
        desc: 'Deep condition every wash day. Apply generously, cover with a shower cap, and leave for 20–30 minutes. This is the most important step for curly hair.',
        products: ['Deep conditioner', 'Protein treatment (monthly)', 'Leave-in conditioner'],
      },
      {
        step: '04',
        phase: 'Style',
        title: 'Curl Cream + Gel',
        desc: 'Apply curl cream to soaking wet hair section by section, then seal with a light gel. This creates definition and holds the curl pattern.',
        products: ['Curl defining cream', 'Light-hold gel', 'Curl refresher spray'],
      },
    ],
    tips: [
      'Follow the Curly Girl Method for best results',
      'Detangle only with conditioner in the shower using fingers or a wide-tooth comb',
      'Use the "praying hands" method to apply products without disturbing curl clumps',
      'Diffuse on low heat or air dry completely before touching',
      'Pineapple your hair at night and use a satin bonnet or pillowcase',
    ],
    avoid: [
      'Sulfates and silicones (they dry out and coat curls)',
      'Brushing dry curly hair',
      'Skipping deep conditioning',
      'Towel-drying with terry cloth',
    ],
  },

  coily: {
    label: 'Coily',
    tagline: 'Tight coils and kinks with dense texture',
    color: 'yellow',
    washFrequency: {
      title: 'Wash Frequency',
      value: 'Every 7–10 days',
      detail: 'Coily hair is the most fragile and driest hair type. Washing weekly or less preserves moisture and minimizes manipulation that can cause breakage.',
    },
    routine: [
      {
        step: '01',
        phase: 'Pre-Wash',
        title: 'Hot Oil Treatment',
        desc: 'Apply warm oil (castor, jojoba, or olive oil) to your scalp and hair. Massage gently and leave for at least 1 hour or overnight before washing.',
        products: ['Castor oil', 'Jojoba oil', 'Hot oil treatment kit'],
      },
      {
        step: '02',
        phase: 'Cleanse',
        title: 'Moisturizing Co-Wash or Gentle Shampoo',
        desc: 'Co-washing (washing with conditioner) is ideal for coily hair. If using shampoo, choose a very gentle, moisturizing formula. Wash in sections.',
        products: ['Co-wash', 'Moisturizing shampoo', 'Scalp oil for between washes'],
      },
      {
        step: '03',
        phase: 'Deep Condition',
        title: 'Intensive Deep Conditioning',
        desc: 'Deep condition every single wash day without exception. Use a rich, creamy deep conditioner with heat (shower cap + warm towel) for 30–45 minutes.',
        products: ['Rich deep conditioner', 'Protein-moisture balance treatment', 'Leave-in conditioner'],
      },
      {
        step: '04',
        phase: 'Moisturize',
        title: 'LOC or LCO Method',
        desc: 'Apply products in layers: Liquid (water or leave-in), Oil (to seal), Cream (to lock in moisture). This method keeps coily hair moisturized for days.',
        products: ['Leave-in conditioner', 'Natural oil (sealing)', 'Butter or cream (locking)'],
      },
    ],
    tips: [
      'Moisturize daily — coily hair loses moisture fastest',
      'Protective styles (braids, twists, buns) reduce daily manipulation',
      'Detangle in small sections with lots of conditioner and a wide-tooth comb',
      'Stretch hair before styling to reduce single-strand knots',
      'Use a satin bonnet or pillowcase every night without exception',
    ],
    avoid: [
      'Sulfates, parabens, and mineral oils',
      'Combing or brushing without moisture',
      'Skipping deep conditioning',
      'Tight hairstyles that stress the hairline',
    ],
  },
};

const HAIR_TYPES = [
  { key: 'straight', label: 'Straight', desc: 'Flat, smooth, no curl' },
  { key: 'wavy',     label: 'Wavy',     desc: 'Loose S-shaped waves' },
  { key: 'curly',    label: 'Curly',    desc: 'Defined springy curls' },
  { key: 'coily',    label: 'Coily',    desc: 'Tight coils or kinks' },
];

const COLOR_MAP = {
  brand:   { border: 'border-brand-500/30',   bg: 'bg-brand-600/10',   text: 'text-brand-400',   badge: 'bg-brand-600/20 text-brand-400 border-brand-500/20',   step: 'bg-brand-600/20 text-brand-400',   active: 'border-brand-500 bg-brand-600/15 text-brand-300' },
  purple:  { border: 'border-purple-500/30',  bg: 'bg-purple-600/10',  text: 'text-purple-400',  badge: 'bg-purple-600/20 text-purple-400 border-purple-500/20',  step: 'bg-purple-600/20 text-purple-400',  active: 'border-purple-500 bg-purple-600/15 text-purple-300' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-600/10', text: 'text-emerald-400', badge: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20', step: 'bg-emerald-600/20 text-emerald-400', active: 'border-emerald-500 bg-emerald-600/15 text-emerald-300' },
  yellow:  { border: 'border-yellow-500/30',  bg: 'bg-yellow-600/10',  text: 'text-yellow-400',  badge: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/20',  step: 'bg-yellow-600/20 text-yellow-400',  active: 'border-yellow-500 bg-yellow-600/15 text-yellow-300' },
};

// ── Icons ──────────────────────────────────────────────────────────────────
const DropIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function HairCareTips() {
  const [selectedType, setSelectedType] = useState(null);
  const [expanded, setExpanded]         = useState(null); // expanded routine step

  const data   = selectedType ? HAIR_CARE_DATA[selectedType] : null;
  const colors = data ? COLOR_MAP[data.color] : null;

  return (
    <section className="bg-dark-800 border border-dark-600 rounded-3xl overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-dark-600">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <DropIcon />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-100">Hair Care Routine</h2>
        </div>
        <p className="text-slate-400 text-sm ml-12">
          Select your natural hair type to get a personalized care routine, product recommendations, and styling tips.
        </p>
      </div>

      <div className="p-6 space-y-6">

        {/* Hair type selector */}
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-3">What is your natural hair type?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HAIR_TYPES.map((type) => {
              const isSelected = selectedType === type.key;
              const typeData   = HAIR_CARE_DATA[type.key];
              const c          = COLOR_MAP[typeData.color];
              return (
                <button
                  key={type.key}
                  onClick={() => { setSelectedType(type.key); setExpanded(null); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected ? c.active : 'border-dark-400 bg-dark-700 hover:border-dark-300'
                  }`}
                >
                  <p className={`font-semibold text-sm mb-0.5 ${isSelected ? '' : 'text-slate-200'}`}>
                    {type.label}
                  </p>
                  <p className="text-slate-500 text-xs">{type.desc}</p>
                  {isSelected && (
                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.badge}`}>
                      <CheckIcon /> Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results — shown after selection */}
        {data && colors && (
          <div className="space-y-6 animate-slide-up">

            {/* Type header */}
            <div className={`${colors.bg} ${colors.border} border rounded-2xl p-5`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className={`font-display text-xl font-bold ${colors.text}`}>{data.label} Hair</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{data.tagline}</p>
                </div>
                {/* Wash frequency badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${colors.badge} border`}>
                  <ClockIcon />
                  <div>
                    <p className="text-xs font-semibold">{data.washFrequency.value}</p>
                    <p className="text-xs opacity-70">wash frequency</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{data.washFrequency.detail}</p>
            </div>

            {/* Step-by-step routine */}
            <div>
              <h4 className="font-semibold text-slate-100 mb-4">Step-by-Step Routine</h4>
              <div className="space-y-3">
                {data.routine.map((step, i) => {
                  const isOpen = expanded === i;
                  return (
                    <div
                      key={i}
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                        isOpen ? `${colors.border} bg-dark-700` : 'border-dark-500 bg-dark-700 hover:border-dark-400'
                      }`}
                    >
                      {/* Step header — always visible */}
                      <button
                        className="w-full flex items-center gap-4 p-4 text-left"
                        onClick={() => setExpanded(isOpen ? null : i)}
                      >
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors.step}`}>
                          {step.step}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>{step.phase}</span>
                          </div>
                          <p className="font-semibold text-slate-100 text-sm">{step.title}</p>
                        </div>
                        <svg
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-4 border-t border-dark-600 pt-4">
                          <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Products</p>
                            <div className="flex flex-wrap gap-2">
                              {step.products.map((product) => (
                                <span
                                  key={product}
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${colors.badge}`}
                                >
                                  {product}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips + Avoid — side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Pro tips */}
              <div className="bg-dark-700 border border-dark-500 rounded-2xl p-5">
                <h4 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${colors.step}`}>
                    <CheckIcon />
                  </span>
                  Pro Tips
                </h4>
                <ul className="space-y-2.5">
                  {data.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        data.color === 'brand' ? 'bg-brand-500' :
                        data.color === 'purple' ? 'bg-purple-500' :
                        data.color === 'emerald' ? 'bg-emerald-500' : 'bg-yellow-500'
                      }`} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to avoid */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <h4 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <XIcon />
                  </span>
                  What to Avoid
                </h4>
                <ul className="space-y-2.5">
                  {data.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* Placeholder when nothing selected */}
        {!selectedType && (
          <div className="text-center py-10 border-2 border-dashed border-dark-500 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <DropIcon />
            </div>
            <p className="text-slate-400 text-sm font-medium">Select your hair type above</p>
            <p className="text-slate-600 text-xs mt-1">to see your personalized care routine</p>
          </div>
        )}
      </div>
    </section>
  );
}
