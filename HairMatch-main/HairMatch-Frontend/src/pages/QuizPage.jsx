import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import HairCareTips from '../components/HairCareTips';

// ── Quiz questions definition ──────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'gender',
    step: 1,
    title: 'First, tell us about yourself',
    subtitle: 'This helps us tailor recommendations specifically for you',
    type: 'single',
    options: [
      { value: 'men',   label: 'Male',   desc: 'Hairstyles for men' },
      { value: 'women', label: 'Female', desc: 'Hairstyles for women' },
    ],
  },
  {
    id: 'faceShape',
    step: 2,
    title: 'What is your face shape?',
    subtitle: "Not sure? Pick the one that sounds most like you, or choose 'Not sure' and we'll figure it out",
    type: 'single',
    options: [
      { value: 'oval',    label: 'Oval',    desc: 'Balanced, slightly wider forehead, gentle chin' },
      { value: 'round',   label: 'Round',   desc: 'Soft curves, similar width and length' },
      { value: 'square',  label: 'Square',  desc: 'Strong jawline, equal width at forehead and jaw' },
      { value: 'heart',   label: 'Heart',   desc: 'Wider forehead, narrow pointed chin' },
      { value: 'oblong',  label: 'Oblong',  desc: 'Longer than wide, straight cheek line' },
      { value: 'diamond', label: 'Diamond', desc: 'Narrow forehead and chin, wide cheekbones' },
      { value: 'unsure',  label: 'Not sure', desc: "We'll determine it from your other answers" },
    ],
  },
  {
    id: 'lifestyle',
    step: 3,
    title: 'How would you describe your lifestyle?',
    subtitle: 'Your daily routine shapes what hairstyle works best for you',
    type: 'single',
    options: [
      { value: 'professional', label: 'Professional', desc: 'Office, meetings, formal settings' },
      { value: 'casual',       label: 'Casual',       desc: 'Relaxed, everyday, laid-back' },
      { value: 'active',       label: 'Active',       desc: 'Sports, gym, outdoor activities' },
      { value: 'creative',     label: 'Creative',     desc: 'Arts, fashion, self-expression' },
    ],
  },
  {
    id: 'hairTexture',
    step: 4,
    title: 'What is your natural hair texture?',
    subtitle: 'Your natural texture determines which styles will work with your hair',
    type: 'single',
    options: [
      { value: 'straight', label: 'Straight', desc: 'Naturally flat, smooth, no curl pattern' },
      { value: 'wavy',     label: 'Wavy',     desc: 'Loose S-shaped waves, some volume' },
      { value: 'curly',    label: 'Curly',    desc: 'Defined curls, springy texture' },
      { value: 'coily',    label: 'Coily',    desc: 'Tight coils or kinks, dense texture' },
    ],
  },
  {
    id: 'maintenance',
    step: 5,
    title: 'How much time do you want to spend on your hair?',
    subtitle: 'Be honest — the best hairstyle is one you can actually maintain',
    type: 'single',
    options: [
      { value: 'low',    label: 'Minimal',  desc: 'Under 5 minutes — wash and go' },
      { value: 'medium', label: 'Moderate', desc: '5–15 minutes — some styling needed' },
      { value: 'high',   label: 'Dedicated', desc: '15+ minutes — I enjoy styling my hair' },
    ],
  },
  {
    id: 'vibe',
    step: 6,
    title: 'What style vibe are you going for?',
    subtitle: 'Pick the aesthetic that resonates most with your personality',
    type: 'single',
    options: [
      { value: 'classic', label: 'Classic',  desc: 'Timeless, polished, never goes out of style' },
      { value: 'modern',  label: 'Modern',   desc: 'Contemporary, trendy, up-to-date' },
      { value: 'bold',    label: 'Bold',     desc: 'Edgy, statement-making, stand out' },
      { value: 'natural', label: 'Natural',  desc: 'Effortless, organic, embraces texture' },
    ],
  },
];

const TOTAL_STEPS = QUESTIONS.length;

// ── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ArrowIcon = ({ left }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    {left ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 6 15 12 9 18" />}
  </svg>
);
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ── Result hairstyle card ──────────────────────────────────────────────────
function ResultCard({ style, onFeedback }) {
  const [imgError, setImgError] = useState(false);
  const displayRating = style.avgRating || style.rating;

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-200 group">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        {style.trending && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500/90 text-white text-xs font-semibold rounded-full">Trending</span>
        )}
        {displayRating && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-dark-900/80 text-yellow-400 text-xs font-semibold rounded-full">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {displayRating.toFixed(1)}
          </span>
        )}
      </div>
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
      </div>
    </div>
  );
}

// ── Main Quiz Page ─────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [answers, setAnswers]         = useState({});
  const [loading, setLoading]         = useState(false);
  const [results, setResults]         = useState(null);

  const question = QUESTIONS[currentStep - 1];
  const progress  = currentStep === 0 ? 0 : Math.round((currentStep / TOTAL_STEPS) * 100);

  const selectAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    return !!answers[question.id];
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      submitQuiz();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else setCurrentStep(0);
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/recommend', answers);
      setResults(data.data);
      setCurrentStep(TOTAL_STEPS + 1); // results step
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setResults(null);
    setCurrentStep(0);
  };

  const SHAPE_LABELS = { oval: 'Oval', round: 'Round', square: 'Square', heart: 'Heart', oblong: 'Oblong', diamond: 'Diamond' };

  // ── Intro screen ──
  if (currentStep === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-600/30 text-white">
            <SparkleIcon />
          </div>
          <h1 className="font-display text-4xl font-bold text-slate-100 mb-4">Style Quiz</h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Not ready to upload a photo? Answer 6 quick questions and we'll recommend the perfect hairstyles for you — no camera needed.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: '6 Questions', sub: 'Quick & easy' },
              { label: 'Personalized', sub: 'Based on you' },
              { label: 'No Photo', sub: 'Privacy first' },
            ].map((item) => (
              <div key={item.label} className="bg-dark-700 border border-dark-500 rounded-2xl p-4 text-center">
                <p className="font-semibold text-slate-100 text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 text-base"
          >
            Start the Quiz
          </button>
          <p className="text-slate-600 text-xs mt-4">Takes about 2 minutes</p>

          <div className="mt-6 pt-6 border-t border-dark-600">
            <p className="text-slate-500 text-sm">
              Prefer to use a photo?{' '}
              <Link to="/analyze" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Try face analysis instead
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Results screen ──
  if (currentStep === TOTAL_STEPS + 1 && results) {
    const genderLabel = results.gender === 'men' ? 'Male' : 'Female';
    return (
      <main className="min-h-[calc(100vh-4rem)] py-10 px-4">
        <div className="max-w-5xl mx-auto animate-slide-up space-y-10">

          {/* Result header */}
          <div className="bg-gradient-to-br from-brand-600/15 to-purple-600/10 border border-brand-500/30 rounded-3xl p-6 sm:p-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                <SparkleIcon />
              </div>
              <div className="flex-1">
                <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-2">Your Quiz Results</p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
                  {SHAPE_LABELS[results.resolvedShape]} Face · {genderLabel}
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Based on your answers, we've curated the best hairstyles that match your face shape, lifestyle, and style preferences.
                </p>
                {/* Answer summary pills */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(answers).filter(([k]) => k !== 'gender' && k !== 'faceShape').map(([key, val]) => (
                    <span key={key} className="px-3 py-1 bg-dark-600 border border-dark-400 text-slate-300 text-xs rounded-full capitalize">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-100">Recommended for You</h2>
                <p className="text-slate-500 text-sm mt-1">{results.recommendations.length} hairstyles matched your profile</p>
              </div>
              <button
                onClick={restart}
                className="px-4 py-2 border border-dark-400 hover:border-brand-500 text-slate-400 hover:text-brand-400 text-sm font-medium rounded-full transition-colors"
              >
                Retake Quiz
              </button>
            </div>

            {results.recommendations.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.recommendations.map((style, i) => (
                  <ResultCard key={style._id || i} style={style} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-dark-700 border border-dark-500 rounded-2xl">
                <p className="text-slate-400 mb-2">No hairstyles found for this combination.</p>
                <button onClick={restart} className="text-brand-400 text-sm hover:underline">Try different answers</button>
              </div>
            )}
          </section>

          {/* CTA to photo analysis */}
          <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 mb-1">Want more accurate results?</h3>
              <p className="text-slate-400 text-sm">Upload a photo for AI-powered face shape detection and precise recommendations.</p>
            </div>
            <Link
              to="/analyze"
              className="flex-shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Try Face Analysis
            </Link>
          </div>

          {/* Hair care tips */}
          <HairCareTips />
        </div>
      </main>
    );
  }

  // ── Question screen ──
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-fade-in">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Question {currentStep} of {TOTAL_STEPS}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {QUESTIONS.map((q, i) => (
              <div
                key={q.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i + 1 < currentStep
                    ? 'bg-brand-500'
                    : i + 1 === currentStep
                    ? 'bg-brand-400 scale-125'
                    : 'bg-dark-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-dark-700 border border-dark-500 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
            {question.title}
          </h2>
          <p className="text-slate-400 text-sm mb-7">{question.subtitle}</p>

          {/* Options grid */}
          <div className={`grid gap-3 ${question.options.length <= 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectAnswer(question.id, opt.value)}
                  className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                    selected
                      ? 'border-brand-500 bg-brand-600/15 shadow-lg shadow-brand-600/10'
                      : 'border-dark-400 bg-dark-600 hover:border-dark-300 hover:bg-dark-500'
                  }`}
                >
                  {/* Check indicator */}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected ? 'bg-brand-600 border-brand-500 text-white' : 'border-dark-300'
                  }`}>
                    {selected && <CheckIcon />}
                  </div>

                  <p className={`font-semibold text-sm mb-0.5 pr-6 ${selected ? 'text-brand-300' : 'text-slate-200'}`}>
                    {opt.label}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 border border-dark-400 hover:border-dark-300 text-slate-400 hover:text-slate-200 font-medium rounded-xl transition-colors text-sm"
          >
            <ArrowIcon left /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 text-sm shadow-lg shadow-brand-600/20"
          >
            {loading ? (
              <><span className="btn-spinner" /> Getting results...</>
            ) : currentStep === TOTAL_STEPS ? (
              <><SparkleIcon /> Get My Recommendations</>
            ) : (
              <>Next <ArrowIcon /></>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
