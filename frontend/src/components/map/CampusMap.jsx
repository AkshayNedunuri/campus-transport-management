import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, MapPin, Navigation, Clock, Users, Radio, Compass, Satellite, Map, Zap, Moon, Train } from 'lucide-react';
import CapacityIndicator from '../common/CapacityIndicator';

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: 'Street',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
    label: 'Satellite',
  },
};

// Component to dynamically re-center/pan map when selected shuttle changes
function MapController({ center, selectedCoords }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords && selectedCoords[0] && selectedCoords[1]) {
      map.panTo(selectedCoords, { animate: true, duration: 1 });
    }
  }, [selectedCoords, map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

// Vehicle classification helper
const getVehicleTypeMeta = (shuttleNumber = '', status = 'ACTIVE') => {
  const isOffDuty = status === 'OFF_DUTY' || status === 'INACTIVE';
  const isDelayed = status === 'DELAYED';

  if (shuttleNumber.includes('BuggyTrain') || shuttleNumber.includes('Train') || shuttleNumber.includes('BT')) {
    return {
      label: 'Campus Buggy Train',
      shortLabel: 'Train',
      bg: isOffDuty ? '#64748b' : isDelayed ? '#f59e0b' : '#0284c7',
      border: isOffDuty ? '#94a3b8' : '#38bdf8',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`,
    };
  }
  if (shuttleNumber.includes('ERick') || shuttleNumber.includes('ER')) {
    return {
      label: 'Hostel E-Rickshaw',
      shortLabel: 'E-Rick',
      bg: isOffDuty ? '#64748b' : isDelayed ? '#f59e0b' : '#d97706',
      border: isOffDuty ? '#94a3b8' : '#fbbf24',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    };
  }
  if (shuttleNumber.includes('Mini') || shuttleNumber.includes('LM')) {
    return {
      label: 'Campus Mini Bus',
      shortLabel: 'Mini',
      bg: isOffDuty ? '#64748b' : isDelayed ? '#f59e0b' : '#059669',
      border: isOffDuty ? '#94a3b8' : '#34d399',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M3 12h18"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M9 18h6"/></svg>`,
    };
  }
  if (shuttleNumber.includes('Night') || shuttleNumber.includes('LN')) {
    return {
      label: 'Night Safety Bus',
      shortLabel: 'Night',
      bg: isOffDuty ? '#64748b' : isDelayed ? '#f59e0b' : '#e11d48',
      border: isOffDuty ? '#94a3b8' : '#fb7185',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    };
  }
  return {
    label: 'Campus AC Shuttle',
    shortLabel: 'Bus',
    bg: isOffDuty ? '#64748b' : isDelayed ? '#f59e0b' : '#4f46e5',
    border: isOffDuty ? '#94a3b8' : '#818cf8',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.7 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`,
  };
};

// Create custom Leaflet div icons for vehicles
const createShuttleIcon = (shuttleNumber, status, isSelected) => {
  const meta = getVehicleTypeMeta(shuttleNumber, status);
  const isOffDuty = status === 'OFF_DUTY' || status === 'INACTIVE';

  return L.divIcon({
    className: 'custom-shuttle-marker',
    html: `
      <div style="
        position: relative;
        background: ${isSelected ? '#1e1b4b' : meta.bg};
        color: white;
        border: 2.5px solid ${isSelected ? '#38bdf8' : 'white'};
        border-radius: 9999px;
        width: ${isSelected ? '42px' : '36px'};
        height: ${isSelected ? '42px' : '36px'};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        opacity: ${isOffDuty ? 0.75 : 1};
      ">
        ${meta.iconSvg}
        ${
          isOffDuty
            ? `<span style="
                position: absolute;
                bottom: -16px;
                background: #334155;
                color: #e2e8f0;
                font-size: 8px;
                font-weight: 700;
                padding: 1px 4px;
                border-radius: 4px;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">OFF-DUTY</span>`
            : ''
        }
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

// Stop marker styling helper based on Stop code / name
const getStopMeta = (code = '', name = '') => {
  const c = code.toUpperCase();
  const n = name.toUpperCase();

  if (c.includes('BH') || n.includes('BOYS HOSTEL')) {
    return { bg: '#2563eb', border: '#1d4ed8', textColor: '#ffffff', type: 'BOYS_HOSTEL' };
  }
  if (c.includes('GH') || n.includes('GIRLS HOSTEL')) {
    return { bg: '#9333ea', border: '#7e22ce', textColor: '#ffffff', type: 'GIRLS_HOSTEL' };
  }
  if (c.includes('G1') || c.includes('G2') || c.includes('G3') || c.includes('G4') || c.includes('G5') || n.includes('GATE')) {
    return { bg: '#1e293b', border: '#0f172a', textColor: '#ffffff', type: 'GATE' };
  }
  if (c.includes('HOSP') || n.includes('HOSPITAL') || n.includes('MEDICAL')) {
    return { bg: '#dc2626', border: '#b91c1c', textColor: '#ffffff', type: 'HOSPITAL' };
  }
  if (c.includes('MALL') || c.includes('UNIP') || c.includes('SPT') || c.includes('SDM')) {
    return { bg: '#059669', border: '#047857', textColor: '#ffffff', type: 'AMENITY' };
  }
  return { bg: '#0d9488', border: '#0f766e', textColor: '#ffffff', type: 'ACADEMIC' };
};

const createStopIcon = (code = 'STP', name = '') => {
  const meta = getStopMeta(code, name);
  const cleanCode = code.replace('STP-', '');

  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background: ${meta.bg};
        color: ${meta.textColor};
        border: 2px solid white;
        border-radius: 9999px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        font-size: 8.5px;
        font-weight: 800;
        transform: translate(-50%, -50%);
        letter-spacing: -0.2px;
      ">
        ${cleanCode}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

export default function CampusMap({
  stops = [],
  routes = [],
  shuttles = [],
  liveUpdates = {},
  selectedShuttleId = null,
  onSelectShuttle = null,
  center = [31.2536, 75.7037], // LPU (Lovely Professional University, Phagwara)
  zoom = 15.5,
  height = '540px',
  isSimulating = true,
}) {
  const [tileMode, setTileMode] = useState('street');
  const currentTile = TILE_LAYERS[tileMode];

  // Merge static shuttles with real-time socket coordinates
  const mergedShuttles = useMemo(() => {
    return shuttles.map((shuttle) => {
      const live = liveUpdates[shuttle._id];
      if (live) {
        return {
          ...shuttle,
          currentLocation: {
            latitude: live.latitude,
            longitude: live.longitude,
            speed: live.speed,
            heading: live.heading,
          },
          currentPassengerCount: live.currentPassengerCount ?? shuttle.currentPassengerCount,
          eta: live.eta,
          nextStopName: live.nextStopName,
          status: live.status || shuttle.status,
          occupancyPercentage: live.occupancyPercentage,
          category: live.category || shuttle.category,
          operatingWindow: live.operatingWindow,
        };
      }
      return shuttle;
    });
  }, [shuttles, liveUpdates]);

  const selectedShuttleCoords = useMemo(() => {
    if (!selectedShuttleId) return null;
    const found = mergedShuttles.find((s) => s._id === selectedShuttleId);
    if (found?.currentLocation?.latitude && found?.currentLocation?.longitude) {
      return [found.currentLocation.latitude, found.currentLocation.longitude];
    }
    return null;
  }, [selectedShuttleId, mergedShuttles]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      {/* Top Overlays */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        {isSimulating && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/90 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-200" />
            <span>LPU LIVE GPS</span>
          </div>
        )}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-white/95 text-slate-800 rounded-full text-xs font-semibold shadow-md backdrop-blur-md border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{mergedShuttles.filter((s) => s.status === 'ACTIVE').length} Active Transit Units</span>
        </div>
      </div>

      {/* Top Right: Campus Label + Satellite Toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900/85 text-white rounded-full text-xs font-medium backdrop-blur-md shadow-md border border-slate-700">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Lovely Professional University (LPU Phagwara)</span>
        </div>

        {/* Satellite / Street Toggle Button */}
        <button
          onClick={() => setTileMode((prev) => (prev === 'street' ? 'satellite' : 'street'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border transition-all hover:scale-105 active:scale-95"
          style={{
            background: tileMode === 'satellite' ? 'rgba(79,70,229,0.92)' : 'rgba(15,23,42,0.88)',
            color: 'white',
            borderColor: tileMode === 'satellite' ? '#818cf8' : '#334155',
          }}
          title="Toggle satellite / street view"
        >
          {tileMode === 'street' ? (
            <>
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite View</span>
            </>
          ) : (
            <>
              <Map className="w-3.5 h-3.5" />
              <span>Street View</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden md:flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-[11px] backdrop-blur-md border border-slate-800 shadow-lg">
        <span className="font-bold text-slate-400">Map Legend:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>BH (1-12)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>GH (1-9)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>Blocks</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>Gates</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Mall/Unipolis</span>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={center} selectedCoords={selectedShuttleCoords} />

        <TileLayer
          key={tileMode}
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={tileMode === 'satellite' ? 19 : 19}
        />

        {/* Route Polylines */}
        {routes.map((route) => {
          if (!route.stops || route.stops.length < 2) return null;
          const positions = route.stops
            .filter((s) => s && s.latitude && s.longitude)
            .map((s) => [s.latitude, s.longitude]);

          if (positions.length < 2) return null;

          return (
            <Polyline
              key={route._id}
              positions={positions}
              pathOptions={{
                color: route.color || '#4f46e5',
                weight: 4,
                opacity: 0.75,
                dashArray: route.active ? undefined : '6, 6',
              }}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-sm text-slate-800">{route.routeName}</h4>
                  <p className="text-xs text-slate-500">Route #{route.routeNumber}</p>
                  <p className="text-xs text-slate-600 mt-1">Duration: ~{route.estimatedDuration} mins</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Stop Markers */}
        {stops.map((stop) => {
          if (!stop.latitude || !stop.longitude) return null;
          return (
            <Marker
              key={stop._id}
              position={[stop.latitude, stop.longitude]}
              icon={createStopIcon(stop.code || 'STP', stop.name)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{stop.code}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{stop.name}</h4>
                  {stop.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{stop.description}</p>
                  )}
                  {stop.facilities && stop.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stop.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shuttle Markers */}
        {mergedShuttles.map((shuttle) => {
          const lat = shuttle.currentLocation?.latitude;
          const lng = shuttle.currentLocation?.longitude;
          if (!lat || !lng) return null;

          const isSelected = selectedShuttleId === shuttle._id;
          const meta = getVehicleTypeMeta(shuttle.shuttleNumber, shuttle.status);

          return (
            <Marker
              key={shuttle._id}
              position={[lat, lng]}
              icon={createShuttleIcon(shuttle.shuttleNumber, shuttle.status, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectShuttle) onSelectShuttle(shuttle);
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[230px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bus className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block leading-tight">{shuttle.shuttleNumber}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{meta.label}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        shuttle.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : shuttle.status === 'DELAYED'
                          ? 'bg-amber-100 text-amber-800'
                          : shuttle.status === 'OFF_DUTY'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {shuttle.status === 'OFF_DUTY' ? 'OFF-DUTY' : shuttle.status}
                    </span>
                  </div>

                  {shuttle.assignedRoute && (
                    <p className="text-xs text-slate-600 font-medium mb-1.5">
                      Route: {shuttle.assignedRoute.routeName || shuttle.assignedRoute.routeNumber || 'Assigned'}
                    </p>
                  )}

                  {shuttle.nextStopName && (
                    <div className="flex items-center gap-1 text-xs text-slate-700 font-medium mb-1 bg-slate-50 p-1.5 rounded-lg">
                      <Navigation className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{shuttle.nextStopName}</span>
                    </div>
                  )}

                  {shuttle.eta && (
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold mb-2 bg-indigo-50 px-2 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{shuttle.eta}</span>
                    </div>
                  )}

                  {shuttle.status !== 'OFF_DUTY' && (
                    <div className="mt-2">
                      <CapacityIndicator
                        currentCount={shuttle.currentPassengerCount || 0}
                        capacity={shuttle.capacity || 50}
                      />
                    </div>
                  )}

                  {shuttle.driver && (
                    <p className="text-[11px] text-slate-500 mt-2">
                      Driver: {shuttle.driver.name || 'Assigned'}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
