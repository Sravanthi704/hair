import { useState, useRef, useCallback } from 'react';

// Drag-slider before/after comparison component
export default function BeforeAfter({ userPhoto, stylePhoto, styleName }) {
  const [sliderPos, setSliderPos] = useState(50); // percentage
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const updateSlider = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e) => { setDragging(true); updateSlider(e.clientX); };
  const onMouseMove = (e) => { if (dragging) updateSlider(e.clientX); };
  const onMouseUp   = () => setDragging(false);

  const onTouchStart = (e) => { setDragging(true); updateSlider(e.touches[0].clientX); };
  const onTouchMove  = (e) => { if (dragging) updateSlider(e.touches[0].clientX); };
  const onTouchEnd   = () => setDragging(false);

  return (
    <div className="space-y-3">
      {/* Labels */}
      <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-500" /> Your Photo
        </span>
        <span className="flex items-center gap-1.5">
          {styleName}
          <span className="w-2 h-2 rounded-full bg-purple-500" />
        </span>
      </div>

      {/* Comparison container */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none border border-dark-400 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Right side — hairstyle reference */}
        <div className="absolute inset-0">
          {stylePhoto ? (
            <img src={stylePhoto} alt={styleName} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-dark-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
          {/* Label overlay */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-dark-900/70 backdrop-blur-sm rounded-lg text-xs text-purple-300 font-semibold">
            {styleName}
          </div>
        </div>

        {/* Left side — user photo (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          {userPhoto ? (
            <img
              src={userPhoto} alt="Your photo"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ width: `${10000 / sliderPos}%`, maxWidth: 'none' }}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-dark-700" />
          )}
          {/* Label overlay */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-dark-900/70 backdrop-blur-sm rounded-lg text-xs text-brand-300 font-semibold">
            You
          </div>
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          style={{ left: `${sliderPos}%` }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a24" strokeWidth="2.5" className="w-5 h-5">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 15 12 9 6" transform="translate(0,0)" />
          </svg>
        </div>

        {/* Hint — fades after first drag */}
        {!dragging && sliderPos === 50 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 bg-dark-900/60 backdrop-blur-sm rounded-full text-xs text-slate-300 font-medium animate-pulse">
              Drag to compare
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
