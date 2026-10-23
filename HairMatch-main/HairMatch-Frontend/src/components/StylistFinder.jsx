import { useState, useEffect, useRef } from 'react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// SVG Icons
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

// Fetch nearby salons using Google Places API via a CORS proxy approach
// We use the Maps JavaScript API loaded dynamically
const loadGoogleMaps = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function StylistFinder({ faceShape }) {
  const [status, setStatus] = useState('idle'); // idle | locating | loading | success | error | no-key
  const [salons, setSalons] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  // Check if API key is configured
  const hasKey = MAPS_KEY && MAPS_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

  const findSalons = async () => {
    if (!hasKey) { setStatus('no-key'); return; }

    setStatus('locating');
    setSalons([]);

    try {
      // Get user location
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );

      const { latitude: lat, longitude: lng } = position.coords;
      setUserLocation({ lat, lng });
      setStatus('loading');

      // Load Google Maps JS API
      const maps = await loadGoogleMaps(MAPS_KEY);

      // Create a hidden map div for PlacesService (it requires a map instance)
      if (!googleMapRef.current) {
        googleMapRef.current = new maps.Map(document.createElement('div'), {
          center: { lat, lng }, zoom: 14,
        });
      }

      // Search for nearby hair salons
      const service = new maps.places.PlacesService(googleMapRef.current);
      const request = {
        location: new maps.LatLng(lat, lng),
        radius: 5000,
        type: 'hair_care',
        keyword: searchQuery || 'hair salon barber',
      };

      service.nearbySearch(request, (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK && results.length > 0) {
          const formatted = results.slice(0, 8).map((place) => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            openNow: place.opening_hours?.open_now,
            photo: place.photos?.[0]?.getUrl({ maxWidth: 200, maxHeight: 200 }),
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          }));
          setSalons(formatted);

          // Build embed map URL showing all results
          const embedQuery = encodeURIComponent(`hair salon near me`);
          setMapUrl(
            `https://www.google.com/maps/embed/v1/search?key=${MAPS_KEY}&q=${embedQuery}&center=${lat},${lng}&zoom=14`
          );
          setStatus('success');
        } else {
          setErrorMsg('No salons found nearby. Try a different search.');
          setStatus('error');
        }
      });
    } catch (err) {
      if (err.code === 1) {
        setErrorMsg('Location access denied. Please allow location access and try again.');
      } else if (err.code === 2) {
        setErrorMsg('Location unavailable. Please check your device settings.');
      } else {
        setErrorMsg(err.message || 'Failed to find nearby salons.');
      }
      setStatus('error');
    }
  };

  const getDirections = (salon) => {
    if (!userLocation) return;
    window.open(
      `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${salon.lat},${salon.lng}`,
      '_blank'
    );
  };

  return (
    <section className="bg-dark-800 border border-dark-500 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-dark-600">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <ScissorsIcon />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-100">Find a Stylist Near You</h2>
        </div>
        <p className="text-slate-400 text-sm ml-12">
          Discover nearby salons and barbers who can give you your recommended {faceShape}-face hairstyle.
        </p>
      </div>

      <div className="p-6 space-y-5">

        {/* Search bar + button */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder='e.g. "barber", "women salon", "hair spa"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && findSalons()}
              className="w-full bg-dark-700 border border-dark-400 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <button
            onClick={findSalons}
            disabled={status === 'locating' || status === 'loading'}
            className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            {status === 'locating' || status === 'loading' ? (
              <><span className="btn-spinner" /> Searching...</>
            ) : (
              <><LocationIcon /> Find Salons</>
            )}
          </button>
        </div>

        {/* No API key notice */}
        {status === 'no-key' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
            <h4 className="text-yellow-400 font-semibold mb-2">Google Maps API Key Required</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              To use the Stylist Finder, add your Google Maps API key to <code className="text-brand-400 bg-dark-600 px-1.5 py-0.5 rounded text-xs">frontend/.env</code>:
            </p>
            <code className="block bg-dark-700 border border-dark-400 rounded-xl p-3 text-xs text-brand-300 font-mono">
              VITE_GOOGLE_MAPS_KEY=your_api_key_here
            </code>
            <p className="text-slate-500 text-xs mt-3">
              Get a free key at{' '}
              <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
                console.cloud.google.com
              </a>
              {' '}— enable Maps JavaScript API and Places API.
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="text-red-400 font-medium text-sm">{errorMsg}</p>
              <button onClick={findSalons} className="text-brand-400 text-xs mt-1 hover:underline">Try again</button>
            </div>
          </div>
        )}

        {/* Locating / Loading state */}
        {(status === 'locating' || status === 'loading') && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="spinner" />
            <p className="text-slate-400 text-sm">
              {status === 'locating' ? 'Getting your location...' : 'Searching for nearby salons...'}
            </p>
          </div>
        )}

        {/* Results */}
        {status === 'success' && (
          <div className="space-y-5">
            {/* Embedded map */}
            {mapUrl && (
              <div className="rounded-2xl overflow-hidden border border-dark-400 h-64">
                <iframe
                  title="Nearby Salons Map"
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {/* Salon list */}
            <div>
              <p className="text-slate-400 text-sm mb-4">
                Found <span className="text-slate-200 font-semibold">{salons.length}</span> salons near you
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {salons.map((salon) => (
                  <div
                    key={salon.id}
                    className="bg-dark-700 border border-dark-500 hover:border-brand-500/40 rounded-2xl p-4 transition-all group"
                  >
                    <div className="flex gap-3">
                      {/* Photo or placeholder */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-dark-600 border border-dark-400">
                        {salon.photo ? (
                          <img src={salon.photo} alt={salon.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-300">
                            <ScissorsIcon />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-100 text-sm truncate">{salon.name}</h4>
                        <p className="text-slate-500 text-xs truncate mt-0.5">{salon.address}</p>

                        {/* Rating + open status */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {salon.rating && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <StarIcon />
                              <span className="text-yellow-400 font-semibold">{salon.rating.toFixed(1)}</span>
                              {salon.totalRatings && (
                                <span className="text-slate-600">({salon.totalRatings})</span>
                              )}
                            </span>
                          )}
                          {salon.openNow !== undefined && (
                            <span className={`text-xs font-semibold ${salon.openNow ? 'text-emerald-400' : 'text-red-400'}`}>
                              {salon.openNow ? 'Open now' : 'Closed'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => getDirections(salon)}
                        className="flex-1 py-2 bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/20 text-brand-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <LocationIcon /> Directions
                      </button>
                      <a
                        href={salon.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-dark-600 hover:bg-dark-500 border border-dark-400 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalIcon /> View on Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Idle state */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-500 flex items-center justify-center text-slate-500 mb-4">
              <LocationIcon />
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Click <span className="text-slate-200 font-medium">Find Salons</span> to discover nearby hair salons and barbers that can give you your recommended hairstyle.
            </p>
            <p className="text-slate-600 text-xs mt-2">Your location is only used to search — never stored.</p>
          </div>
        )}
      </div>
    </section>
  );
}
