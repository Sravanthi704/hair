import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TIPS = [
  'Use a clear, front-facing photo',
  'Good lighting gives better results',
  'Keep a neutral expression',
  'Avoid hats or hair covering your face',
  'Face the camera directly',
];

const SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];

// ── SVG Icons ──────────────────────────────────────────────────────────────
const MaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
  </svg>
);
const FemaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
    <circle cx="12" cy="7" r="4" />
    <path d="M12 11v6M9 17h6" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-slate-500">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const FaceOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
  </svg>
);

// ── No Face Detected Modal ─────────────────────────────────────────────────
function NoFaceModal({ onClose, onRetry }) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-md bg-dark-700 border border-dark-400 rounded-3xl shadow-2xl shadow-black/50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:text-slate-200 hover:bg-dark-500 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
            <FaceOffIcon />
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl font-bold text-slate-100 mb-3">
            No Face Detected
          </h2>

          {/* Message */}
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            We couldn't detect a human face in the uploaded image.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Please make sure your photo shows a clear, front-facing view of your face with good lighting.
          </p>

          {/* Tips */}
          <div className="bg-dark-600 border border-dark-400 rounded-2xl p-4 mb-8 text-left space-y-2">
            {[
              'Use a clear, front-facing photo',
              'Ensure your face is fully visible',
              'Avoid sunglasses, masks or hats',
              'Use good lighting — avoid dark photos',
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-dark-400 hover:border-dark-300 text-slate-300 font-semibold rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onRetry}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-brand-600/20"
            >
              Try Another Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gender, setGender] = useState('men');
  const [showNoFaceModal, setShowNoFaceModal] = useState(false);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file (JPG, PNG, WEBP).'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large. Maximum size is 10MB.'); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const reset = () => {
    setFile(null); setPreview(null); setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRetry = () => {
    setShowNoFaceModal(false);
    reset();
    // Open file picker after a short delay
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a photo first.'); return; }
    setLoading(true); setProgress(10);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('gender', gender);
    try {
      setProgress(30);
      const { data } = await api.post('/analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(30 + Math.round((e.loaded / e.total) * 50)),
      });
      setProgress(100);
      toast.success('Analysis complete!');
      navigate(`/result/${data.data.analysisId}`, { state: { defaultGender: gender } });
    } catch (err) {
      setProgress(0);
      // Show modal for face detection failure, toast for everything else
      const msg = err.message || '';
      if (msg.toLowerCase().includes('no face') || msg.toLowerCase().includes('face detected')) {
        setShowNoFaceModal(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* No Face Detected Modal */}
      {showNoFaceModal && (
        <NoFaceModal
          onClose={() => setShowNoFaceModal(false)}
          onRetry={handleRetry}
        />
      )}

      <main className="min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <h1 className="font-display text-4xl font-bold text-slate-100 mb-3">Analyze Your Face Shape</h1>
            <p className="text-slate-400">Upload a clear, front-facing photo to get personalized hairstyle recommendations</p>
            <p className="text-slate-500 text-sm mt-2">
              No photo?{' '}
              <Link to="/quiz" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Try the Style Quiz instead
              </Link>
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── Left panel ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Gender selection */}
              <div className="bg-dark-700 border border-dark-500 rounded-2xl p-5">
                <p className="text-sm font-semibold text-slate-200 mb-4">Select your gender</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'men',   label: 'Male',   Icon: MaleIcon },
                    { key: 'women', label: 'Female', Icon: FemaleIcon },
                  ].map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGender(key)}
                      className={`flex flex-col items-center gap-3 py-5 px-4 rounded-xl border-2 transition-all duration-200 ${
                        gender === key
                          ? 'border-brand-500 bg-brand-600/15 text-brand-400'
                          : 'border-dark-400 bg-dark-600 text-slate-400 hover:border-dark-300 hover:text-slate-200'
                      }`}
                    >
                      <Icon />
                      <span className="font-semibold text-sm">{label}</span>
                      {gender === key && (
                        <span className="text-xs text-brand-400 font-medium">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => !preview && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !preview && fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
                  ${dragging ? 'border-brand-500 bg-brand-600/10' : 'border-dark-400 bg-dark-700 hover:border-dark-300'}
                  ${!preview ? 'cursor-pointer' : ''}
                `}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full max-h-80 object-contain" />
                    <div className="absolute inset-0 bg-dark-900/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-400 text-slate-200 text-sm font-medium rounded-full hover:border-brand-500 transition-colors"
                      >
                        <RefreshIcon /> Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                    <UploadIcon />
                    <p className="text-slate-200 font-semibold mt-4 mb-1">Drop your photo here</p>
                    <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                    <span className="px-3 py-1 bg-dark-600 border border-dark-400 rounded-full text-slate-500 text-xs">
                      JPG, PNG, WEBP · Max 10MB
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef} type="file" accept="image/*" hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {!preview && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-dark-600 hover:bg-dark-500 border border-dark-400 hover:border-dark-300 text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Browse Photo
                </button>
              )}

              {/* Progress bar */}
              {loading && (
                <div className="space-y-1.5">
                  <div className="w-full bg-dark-500 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {progress < 80 ? 'Uploading photo...' : 'Analyzing face shape...'}
                  </p>
                </div>
              )}

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <><span className="btn-spinner" /> Analyzing...</>
                ) : (
                  <><SearchIcon /> Analyze My Face Shape</>
                )}
              </button>

              <p className="text-center text-slate-600 text-xs">
                Your photo is uploaded securely and only used for analysis.
              </p>
            </div>

            {/* ── Right panel ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Tips */}
              <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-100 mb-4">Tips for Best Results</h3>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs flex items-center justify-center font-semibold mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats */}
              <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-brand-400">{user?.analysisCount || 0}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Analyses</p>
                  </div>
                  <div className="border-x border-dark-500">
                    <p className="text-2xl font-bold text-brand-400">6</p>
                    <p className="text-xs text-slate-500 mt-0.5">Face Shapes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-400">24+</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hairstyles</p>
                  </div>
                </div>
              </div>

              {/* Face shapes */}
              <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6">
                <p className="text-sm font-medium text-slate-300 mb-3">We detect these face shapes:</p>
                <div className="grid grid-cols-3 gap-2">
                  {SHAPES.map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1 py-2.5 px-1 bg-dark-600 rounded-xl">
                      <span className="text-xs font-medium text-slate-300">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
