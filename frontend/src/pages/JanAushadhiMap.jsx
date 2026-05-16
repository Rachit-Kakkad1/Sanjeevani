import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Phone, Map as MapIcon, ChevronRight, Loader2, X, Info, LocateFixed, Star, Clock, Route } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import useGeolocation from '../hooks/useGeolocation';
import { loadMapplsMapSDK, loadMapplsPlugins, searchNearbyStores, findNearestStore, haversineDistance } from '../services/mappls.service';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 }
};

export default function JanAushadhiMap({
  onLogout, onNavigateToUpload, onNavigateToDashboard, onNavigateToReports,
  onNavigateToInsights, onNavigateToGovData, onNavigateToProfile,
  onNavigateToNotifications, onNavigateToCghsRates, currentPage
}) {
  const { location: userLocation, error: geoError, loading: geoLoading, isFallback } = useGeolocation();

  const [stores, setStores] = useState([]);
  const [nearestStore, setNearestStore] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [searchStatus, setSearchStatus] = useState('Initializing...');

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const nearestMarkerRef = useRef(null);
  const directionRef = useRef(null);

  // ── Initialize Map ──────────────────────────────────────────
  const initMap = useCallback(async (lat, lng) => {
    try {
      setSearchStatus('Loading Mappls SDK...');
      await loadMapplsMapSDK();
      setSearchStatus('Loading search plugins...');
      await loadMapplsPlugins();

      if (!window.mappls || !mapRef.current) {
        setError('Mappls SDK failed to initialize');
        setIsLoading(false);
        return;
      }

      setSearchStatus('Rendering map...');
      mapInstance.current = new window.mappls.Map('mappls-map-container', {
        center: { lat, lng },
        zoom: 13,
        zoomControl: true,
        hybrid: false,
      });

      const onLoad = () => {
        setMapReady(true);
        addUserMarker(lat, lng);
        searchStores(lat, lng);
      };

      if (mapInstance.current.on) {
        mapInstance.current.on('load', onLoad);
      } else if (mapInstance.current.addListener) {
        mapInstance.current.addListener('load', onLoad);
      } else {
        setTimeout(onLoad, 1000);
      }
    } catch (err) {
      console.error('Map init error:', err);
      setError('Failed to load map. Please refresh.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLocation && !mapInstance.current) {
      initMap(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, initMap]);

  // ── Add User Marker ─────────────────────────────────────────
  const addUserMarker = (lat, lng) => {
    if (!window.mappls || !mapInstance.current) return;
    try {
      userMarkerRef.current = new window.mappls.Marker({
        map: mapInstance.current,
        position: { lat, lng },
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        width: 44, height: 44,
        popupHtml: `<div style="padding:8px;font-family:Inter,sans-serif;font-weight:600;color:#1e40af;background:#fff;border-radius:8px">📍 Your Location</div>`
      });
    } catch (e) {
      console.error('User marker error:', e);
    }
  };

  // ── Search Stores via Mappls Nearby Plugin ──────────────────
  const searchStores = async (lat, lng) => {
    setSearchStatus('Searching Jan Aushadhi stores...');
    try {
      const results = await searchNearbyStores(mapInstance.current, lat, lng);
      if (results.length > 0) {
        setStores(results);
        plotStoreMarkers(results, lat, lng);
        const nearest = findNearestStore(results, lat, lng);
        if (nearest) {
          setNearestStore(nearest.store);
          setSelectedStore(nearest.store);
          highlightNearest(nearest.store);
          drawRoute(lat, lng, nearest.store);
        }
        setSearchStatus(`Found ${results.length} stores`);
      } else {
        setSearchStatus('No stores found within 10km');
      }
    } catch (err) {
      console.error('Store search failed:', err);
      setSearchStatus('Search completed');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Plot Store Markers ──────────────────────────────────────
  const plotStoreMarkers = (storesData, userLat, userLng) => {
    if (!window.mappls || !mapInstance.current) return;
    markersRef.current.forEach(m => m.remove && m.remove());
    markersRef.current = [];

    storesData.forEach(store => {
      try {
        const dist = haversineDistance(userLat, userLng, store.lat, store.lng);
        const marker = new window.mappls.Marker({
          map: mapInstance.current,
          position: { lat: store.lat, lng: store.lng },
          title: store.placeName,
          width: 32, height: 32,
          popupHtml: `<div style="padding:10px;font-family:Inter,sans-serif;max-width:220px;background:#fff;border-radius:8px;color:#1a1a1a">
            <b style="color:#065f46;font-size:13px">${store.placeName}</b>
            <p style="font-size:11px;color:#6b7280;margin:4px 0">${store.placeAddress}</p>
            <span style="font-size:11px;color:#0284c7;font-weight:600">${dist.toFixed(1)} km away</span>
          </div>`
        });
        marker.addListener('click', () => handleStoreSelect(store));
        markersRef.current.push(marker);
      } catch (e) {
        console.error('Marker error:', e);
      }
    });
  };

  // ── Highlight Nearest ───────────────────────────────────────
  const highlightNearest = (store) => {
    if (!window.mappls || !mapInstance.current) return;
    try {
      if (nearestMarkerRef.current && nearestMarkerRef.current.remove) {
        nearestMarkerRef.current.remove();
      }
      nearestMarkerRef.current = new window.mappls.Marker({
        map: mapInstance.current,
        position: { lat: store.lat, lng: store.lng },
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        width: 48, height: 48,
        popupHtml: `<div style="padding:12px;font-family:Inter,sans-serif;max-width:240px;background:#fff;border-radius:8px;color:#1a1a1a">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:16px">⭐</span>
            <b style="color:#065f46;font-size:14px">NEAREST STORE</b>
          </div>
          <b style="font-size:13px">${store.placeName}</b>
          <p style="font-size:11px;color:#6b7280;margin:4px 0">${store.placeAddress}</p>
        </div>`
      });
    } catch (e) {
      console.error('Nearest marker error:', e);
    }
  };

  // ── Draw Route ──────────────────────────────────────────────
  const drawRoute = (userLat, userLng, store) => {
    if (!window.mappls || !mapInstance.current) return;

    const dist = haversineDistance(userLat, userLng, store.lat, store.lng);
    const estimatedMins = Math.round(dist * 3);

    setRouteInfo({ distance: dist.toFixed(1), duration: estimatedMins });

    if (typeof window.mappls.direction !== 'function') {
      console.warn('Direction plugin unavailable, using Haversine fallback');
      return;
    }

    try {
      if (directionRef.current && directionRef.current.remove) {
        directionRef.current.remove();
      }

      window.mappls.direction({
        map: mapInstance.current,
        start: { lat: userLat, lng: userLng },
        end: { lat: store.lat, lng: store.lng },
        callback: (res) => {
          if (res && res.routes && res.routes.length > 0) {
            const route = res.routes[0];
            setRouteInfo({
              distance: (route.distance / 1000).toFixed(1),
              duration: Math.round(route.duration / 60)
            });
          }
        }
      }, (dirInstance) => {
        directionRef.current = dirInstance;
      });
    } catch (e) {
      console.error('Direction error:', e);
    }
  };

  // ── Store Selection ─────────────────────────────────────────
  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    if (userLocation) {
      drawRoute(userLocation.lat, userLocation.lng, store);
    }
    if (mapInstance.current && mapInstance.current.setCenter) {
      mapInstance.current.setCenter({ lat: store.lat, lng: store.lng });
      mapInstance.current.setZoom(15);
    }
  };

  const getDistanceForStore = (store) => {
    if (!userLocation) return '—';
    return haversineDistance(userLocation.lat, userLocation.lng, store.lat, store.lng).toFixed(1);
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}
      className="min-h-screen bg-background transition-colors duration-300">
      <Helmet>
        <title>Jan Aushadhi Map | MedClear - Find Generic Medicines</title>
        <meta name="description" content="Locate nearby Jan Aushadhi generic medicine stores to save up to 80% on your healthcare costs." />
      </Helmet>
      <Navbar
        onLogout={onLogout} onNavigateToUpload={onNavigateToUpload}
        onNavigateToDashboard={onNavigateToDashboard} onNavigateToReports={onNavigateToReports}
        onNavigateToInsights={onNavigateToInsights} onNavigateToGovData={onNavigateToGovData}
        onNavigateToProfile={onNavigateToProfile} onNavigateToNotifications={onNavigateToNotifications}
        onNavigateToCghsRates={onNavigateToCghsRates}
        onNavigateToJanAushadhi={() => {}} currentPage={currentPage}
      />

      <main className="pt-20 h-screen flex flex-col md:flex-row overflow-hidden">
        {/* ── Sidebar ── */}
        <div className="w-full md:w-[420px] bg-card border-r border-border flex flex-col z-10 shadow-xl transition-colors duration-300">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-2xl text-text-main flex items-center gap-2">
              <MapIcon className="text-primary" /> Jan Aushadhi Finder
            </h2>
            <p className="text-text-muted text-sm mt-1">Find affordable medicine stores near you</p>
            {isFallback && (
              <div className="mt-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs flex items-center gap-1.5 transition-colors duration-300">
                <Info size={14} /> Using default location (Delhi). Enable GPS for accuracy.
              </div>
            )}
          </div>

          {/* Status Bar */}
          {(isLoading || geoLoading) && (
            <div className="px-6 py-3 bg-primary/5 border-b border-border flex items-center gap-3 transition-colors duration-300">
              <Loader2 className="animate-spin text-primary" size={16} />
              <span className="text-sm text-text-muted font-medium">{searchStatus}</span>
            </div>
          )}

          {/* Store List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {error || geoError ? (
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex items-start gap-3">
                <Info className="text-red-500 shrink-0" size={20} />
                <p className="text-red-500 text-sm">{error || geoError}</p>
              </div>
            ) : !isLoading && stores.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="mx-auto text-primary/30 mb-4" size={56} />
                <p className="text-text-main font-semibold text-lg">No stores found</p>
                <p className="text-text-muted text-sm mt-1">Try again or check a different area</p>
              </div>
            ) : (
              stores.map((store, idx) => {
                const isNearest = nearestStore?.id === store.id;
                const isSelected = selectedStore?.id === store.id;
                const dist = getDistanceForStore(store);

                return (
                  <motion.div
                    key={store.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStoreSelect(store)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
                      isSelected
                        ? 'bg-primary border-primary shadow-lg shadow-primary/20 text-white'
                        : isNearest
                        ? 'bg-accent-green/10 border-accent-green/40 text-text-main'
                        : 'bg-background border-border text-text-main hover:border-primary/40'
                    }`}
                  >
                    {isNearest && !isSelected && (
                      <div className="absolute top-0 right-0 bg-accent-green text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        ⭐ NEAREST
                      </div>
                    )}
                    {isSelected && isNearest && (
                      <div className="absolute top-0 right-0 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        ⭐ NEAREST
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-semibold leading-tight text-sm pr-16">{store.placeName}</h3>
                      <Navigation size={14} className={isSelected ? 'text-white/60' : 'text-text-muted'} />
                    </div>
                    <p className={`text-xs mb-2.5 leading-relaxed ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                      {store.placeAddress || 'Address not available'}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 font-semibold ${isSelected ? 'text-white/90' : 'text-primary'}`}>
                        <Route size={12} /> {dist} km
                      </span>
                      {store.phone && (
                        <span className={`flex items-center gap-1 ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                          <Phone size={11} /> {store.phone}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Route Info Footer */}
          <AnimatePresence>
            {selectedStore && routeInfo && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="p-5 bg-gradient-to-r from-primary to-secondary text-white border-t border-white/10 transition-colors duration-300"
              >
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">
                      {nearestStore?.id === selectedStore?.id ? '⭐ Nearest Route' : 'Route Info'}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight">{routeInfo.distance}</span>
                      <span className="text-sm opacity-70">km</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">Est. Time</p>
                    <div className="flex items-baseline gap-1 justify-end">
                      <Clock size={14} className="opacity-60" />
                      <span className="text-2xl font-bold">{routeInfo.duration}</span>
                      <span className="text-sm opacity-70">min</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-white/15 hover:bg-white/25 backdrop-blur rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm border border-white/10"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedStore.lat},${selectedStore.lng}&travelmode=driving`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation size={16} /> Start Navigation <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Map Container ── */}
        <div className="flex-1 relative">
          <div id="mappls-map-container" ref={mapRef} className="w-full h-full" />

          {(isLoading || geoLoading) && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-20 transition-colors duration-300">
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center max-w-xs">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
                    <MapPin className="text-white" size={28} />
                  </div>
                  <Loader2 className="absolute -bottom-1 -right-1 animate-spin text-primary" size={20} />
                </div>
                <h3 className="font-serif text-xl text-text-main mb-1">Initializing Map</h3>
                <p className="text-text-muted text-sm text-center">{searchStatus}</p>
              </div>
            </div>
          )}

          {/* Floating store count badge */}
          {!isLoading && stores.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 z-20 glass-card px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <LocateFixed size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-main">{stores.length} stores found</span>
            </motion.div>
          )}

          {selectedStore && (
            <button
              onClick={() => { setSelectedStore(null); setRouteInfo(null); }}
              className="absolute top-4 right-4 p-2.5 glass-card rounded-xl shadow-lg text-text-main hover:bg-primary hover:text-white transition-all z-20"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--secondary); }
        #mappls-map-container .mappls-logo,
        #mappls-map-container .mappls-ctrl-logo { opacity: 0.6; }
      `}</style>
    </motion.div>
  );
}
