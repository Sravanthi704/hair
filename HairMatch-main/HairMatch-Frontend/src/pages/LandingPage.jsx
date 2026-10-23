import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { title: 'AI Face Analysis', desc: 'Advanced facial landmark detection identifies your unique face shape with high accuracy.' },
  { title: 'Personalized Picks', desc: 'Get curated hairstyle recommendations tailored specifically to your face structure.' },
  { title: 'Men & Women', desc: 'Separate recommendations for men and women, covering all styles from classic to trendy.' },
  { title: 'Save & Revisit', desc: 'Your analysis history is saved so you can revisit recommendations anytime.' },
  { title: 'Privacy First', desc: 'Your photos are processed securely. We never share your data with third parties.' },
  { title: 'Instant Results', desc: 'Get your face shape analysis and hairstyle recommendations in seconds.' },
];

const faceShapes = [
  { shape: 'Oval',    desc: 'Balanced proportions — suits almost any style' },
  { shape: 'Round',   desc: 'Soft curves — styles that add length work best' },
  { shape: 'Square',  desc: 'Strong jaw — soft layers balance the angles' },
  { shape: 'Heart',   desc: 'Wide forehead — add width at the jaw' },
  { shape: 'Oblong',  desc: 'Long face — add width and reduce length' },
  { shape: 'Diamond', desc: 'Wide cheeks — balance forehead and chin' },
];

const steps = [
  { num: '01', title: 'Upload Your Photo',      desc: 'Take or upload a clear, front-facing photo. Good lighting gives the best results.' },
  { num: '02', title: 'AI Analyzes Your Face',  desc: 'Our AI detects facial landmarks and measures your face proportions to determine your face shape.' },
  { num: '03', title: 'Get Recommendations',    desc: 'Receive a curated list of hairstyles that complement your unique face shape, for both men and women.' },
];

// Simple SVG icons
const UploadIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const ScanIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>;
const SparkleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;

const stepIcons = [<UploadIcon key="u" />, <ScanIcon key="s" />, <SparkleIcon key="sp" />];

export default function LandingPage() {
  const { user } = useAuth();
  const ctaTo    = user ? '/analyze' : '/register';
  const ctaLabel = user ? 'Analyze My Face' : 'Get Started Free';

  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-700/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600/20 border border-brand-500/30 rounded-full text-brand-400 text-xs font-semibold mb-6">
              AI-Powered Hairstyle Advisor
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight text-slate-100 mb-6">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                Perfect
              </span>{' '}
              Hairstyle
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              Upload a photo, let our AI analyze your face shape, and get personalized hairstyle
              recommendations that truly flatter you.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Link to={ctaTo} className="px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5">
                {ctaLabel} →
              </Link>
              {!user && (
                <Link to="/login" className="px-7 py-3.5 border border-dark-400 hover:border-brand-500 text-slate-300 hover:text-brand-400 font-semibold rounded-full transition-all">
                  Sign In
                </Link>
              )}
            </div>
            <p className="text-slate-600 text-sm">No credit card required · Free to use · Results in seconds</p>
            <div className="mt-4">
              <Link to="/trending" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-400 text-sm transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                See what's trending right now
              </Link>
            </div>
          </div>

          {/* Visual card */}
          <div className="hidden md:flex justify-center items-center relative h-80">
            <div className="absolute top-4 right-8 w-56 bg-dark-700 border border-dark-500 rounded-2xl p-5 shadow-xl rotate-3 animate-float">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Oval Face</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {['Pompadour', 'Quiff', 'Bob'].map(s => (
                  <span key={s} className="px-2 py-0.5 bg-brand-600/20 text-brand-400 text-xs rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div className="relative w-64 bg-dark-700 border border-brand-500/40 rounded-2xl p-6 shadow-2xl shadow-brand-600/20 -rotate-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Face Analysis</p>
              <div className="w-full bg-dark-500 rounded-full h-2 mb-1">
                <div className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-xs text-slate-500 mb-3">Confidence: 85%</p>
              <p className="text-brand-400 font-semibold text-sm">Square Face Detected</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-dark-800 border-y border-dark-600 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-slate-100 mb-3">How It Works</h2>
            <p className="text-slate-400">Three simple steps to your perfect hairstyle</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-dark-500" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-700 border border-dark-500 group-hover:border-brand-500/50 transition-colors mb-5 text-brand-400">
                  {stepIcons[i]}
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-xs font-bold text-brand-500 bg-dark-800 px-1">
                  {step.num}
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Face shapes ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-slate-100 mb-3">6 Face Shapes We Analyze</h2>
            <p className="text-slate-400">Each shape has unique characteristics and ideal hairstyles</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {faceShapes.map((s) => (
              <div key={s.shape} className="bg-dark-700 border border-dark-500 hover:border-brand-500/50 rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-600/10">
                <div className="w-12 h-12 rounded-xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-brand-400 font-display font-bold text-sm">{s.shape[0]}</span>
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">{s.shape}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-dark-800 border-y border-dark-600 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-slate-100 mb-3">Why HairMatch?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="bg-dark-700 border border-dark-500 rounded-2xl p-6 hover:border-brand-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center mb-4">
                  <span className="text-brand-400 font-bold text-sm">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-brand-600/20 to-purple-600/10 border border-brand-500/30 rounded-3xl p-12">
            <h2 className="font-display text-4xl font-bold text-slate-100 mb-4">
              Ready to find your perfect hairstyle?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of users who've discovered their ideal look with HairMatch.
            </p>
            <Link to={ctaTo} className="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5">
              {user ? 'Start Analyzing' : 'Create Free Account'} →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-dark-600 py-6 text-center text-slate-600 text-sm">
        © 2026 HairMatch · AI-powered hairstyle recommendations · All analysis done securely
      </footer>
    </main>
  );
}
