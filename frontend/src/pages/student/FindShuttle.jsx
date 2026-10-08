import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Bus,
  ArrowRight,
  Radio,
  Gauge,
  Compass,
  Users,
  Navigation2,
  Phone,
  Sparkles,
  Zap,
  Train,
  Moon,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

// Distance calculation between two GPS coordinates (Haversine formula in meters)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Categorize stops for optgroup
function groupStopsByCategory(stopsList = []) {
  const groups = {
    boysHostels: [],
    girlsHostels: [],
    academicBlocks: [],
    gates: [],
    amenities: [],
  };

  stopsList.forEach((s) => {
    const c = (s.code || '').toUpperCase();
    const n = (s.name || '').toUpperCase();

    if (c.includes('BH') || n.includes('BOYS HOSTEL')) {
      groups.boysHostels.push(s);
    } else if (c.includes('GH') || n.includes('GIRLS HOSTEL')) {
      groups.girlsHostels.push(s);
    } else if (c.includes('G1') || c.includes('G2') || c.includes('G3') || c.includes('G4') || c.includes('G5') || n.includes('GATE')) {
      groups.gates.push(s);
    } else if (c.includes('BLK') || c.includes('CSE') || c.includes('B13') || c.includes('B38') || c.includes('B40') || c.includes('B55') || c.includes('B60') || c.includes('AGRI-BLK') || c.includes('LIS')) {
      groups.academicBlocks.push(s);
    } else {
      groups.amenities.push(s);
    }
  });

  return groups;
}

export default function FindShuttle() {
  const navigate = useNavigate();
  const { liveShuttles, isSimulating } = useSocket();

  const [stops, setStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);

  // Form states - initialized with today and current real time
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [travelTime, setTravelTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Search Results
  const [trips, setTrips] = useState([]);
  const [allShuttles, setAllShuttles] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch stops on mount
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const [stopsRes, shuttlesRes] = await Promise.all([
          apiClient.get('/stops?active=true'),
          apiClient.get('/shuttles'),
        ]);

        const stopList = stopsRes.data?.stops || [];
        setStops(stopList);
        setAllShuttles(shuttlesRes.data?.shuttles || []);

        if (stopList.length >= 2) {
          const unipolis = stopList.find((s) => s.code === 'STP-UNIP') || stopList[0];
          const block55 = stopList.find((s) => s.code === 'STP-B55') || stopList[1];
          setFromStop(unipolis._id);
          setToStop(block55._id);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoadingStops(false);
      }
    };
    fetchStops();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setHasSearched(true);

    try {
      const [tripsRes, shuttlesRes] = await Promise.all([
        apiClient.get('/trips/search', {
          params: {
            fromStop,
            toStop,
            date: travelDate,
            time: travelTime,
          },
        }),
        apiClient.get('/shuttles'),
      ]);

      setTrips(tripsRes.data?.trips || []);
      setAllShuttles(shuttlesRes.data?.shuttles || []);
    } catch (err) {
      console.error('Search failed:', err);
      setTrips([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (stops.length > 0 && !hasSearched && fromStop && toStop) {
      handleSearch();
    }
  }, [stops, fromStop, toStop]);

  const selectedFromStopObj = useMemo(
    () => stops.find((s) => s._id === fromStop),
    [stops, fromStop]
  );
  const selectedToStopObj = useMemo(
    () => stops.find((s) => s._id === toStop),
    [stops, toStop]
  );

  const groupedStops = useMemo(() => groupStopsByCategory(stops), [stops]);

  const setTimeToNow = () => {
    const d = new Date();
    setTravelTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  };

  // Match live shuttles with the selected search stops
  const matchedShuttles = useMemo(() => {
    if (!allShuttles || allShuttles.length === 0) return [];

    return allShuttles.map((shuttle) => {
      const live = liveShuttles[shuttle._id] || {};
      const route = shuttle.assignedRoute;

      const liveLat = live.latitude ?? shuttle.currentLocation?.latitude ?? 31.2536;
      const liveLng = live.longitude ?? shuttle.currentLocation?.longitude ?? 75.7037;
      const liveSpeed = live.speed ?? shuttle.currentLocation?.speed ?? 22;
      const liveHeading = live.heading ?? shuttle.currentLocation?.heading ?? 90;
      const liveNextStop = live.nextStopName || 'In Transit on Route';
      const currentPassengers = live.currentPassengerCount ?? shuttle.currentPassengerCount ?? 0;
      const capacity = shuttle.capacity || 50;
      const availableSeats = Math.max(0, capacity - currentPassengers);
      const isOffDuty = live.status === 'OFF_DUTY' || shuttle.status === 'OFF_DUTY';

      // Check route match
      const stopIds = route?.stops?.map((s) => (s._id ? s._id.toString() : s.toString())) || [];
      const servesFromStop = fromStop ? stopIds.includes(fromStop) : true;
      const servesToStop = toStop ? stopIds.includes(toStop) : true;
      const isDirectMatch = servesFromStop && servesToStop;

      let distanceToPickupMeters = null;
      let etaToPickupMinutes = 4;
      if (selectedFromStopObj?.latitude && selectedFromStopObj?.longitude && !isOffDuty) {
        distanceToPickupMeters = getDistanceMeters(
          liveLat,
          liveLng,
          selectedFromStopObj.latitude,
          selectedFromStopObj.longitude
        );
        if (distanceToPickupMeters != null) {
          const speedKmh = Math.max(15, liveSpeed || 22);
          etaToPickupMinutes = Math.max(1, Math.round((distanceToPickupMeters / 1000 / speedKmh) * 60));
        }
      }

      const now = new Date();
      const pickupTimeDate = new Date(now.getTime() + etaToPickupMinutes * 60000);
      const tripDurationMinutes = route?.estimatedDuration || 15;
      const dropoffTimeDate = new Date(pickupTimeDate.getTime() + tripDurationMinutes * 60000);

      const dynamicDeparture = pickupTimeDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dynamicArrival = dropoffTimeDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        ...shuttle,
        liveLat,
        liveLng,
        liveSpeed,
        liveHeading,
        liveNextStop,
        currentPassengers,
        capacity,
        availableSeats,
        isDirectMatch,
        isOffDuty,
        distanceToPickupMeters,
        etaToPickupMinutes,
        dynamicDeparture,
        dynamicArrival,
        tripDurationMinutes,
      };
    });
  }, [allShuttles, liveShuttles, fromStop, toStop, selectedFromStopObj]);

  const sortedShuttles = useMemo(() => {
    return [...matchedShuttles].sort((a, b) => {
      // Active direct matches first, then active vehicles, then off-duty
      if (!a.isOffDuty && b.isOffDuty) return -1;
      if (a.isOffDuty && !b.isOffDuty) return 1;
      if (a.isDirectMatch && !b.isDirectMatch) return -1;
      if (!a.isDirectMatch && b.isDirectMatch) return 1;
      return (a.distanceToPickupMeters || 99999) - (b.distanceToPickupMeters || 99999);
    });
  }, [matchedShuttles]);

  return (
    <div className="space-y-6">
      {/* Page Title & Realtime Live Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Find Campus Shuttle & Routes</h2>
          <p className="text-sm text-slate-500">
            Real-time multi-fleet availability, timetable checks, and exact GPS telemetry across 600+ acre LPU campus
          </p>
        </div>

        {/* Live GPS Telemetry Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-sm self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Real-Time GPS Live Stream Active</span>
        </div>
      </div>

      {/* Transit Schedule Guidance Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Clock className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>LPU Transit Fleet Timetables</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-mono">
                  Official Hours
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                • <strong>Buggy Train:</strong> 08:30 AM – 06:00 PM (Class hours) | • <strong>AC Buses:</strong> 07:00 AM – 08:00 PM | • <strong>E-Rickshaws:</strong> 06:30 AM – 10:00 PM | • <strong>Night Shuttles:</strong> 08:00 PM – 11:00 PM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student/tracking')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap self-start sm:self-auto"
          >
            View Live Satellite Map →
          </button>
        </div>
      </div>

      {/* Search Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* From Stop */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>From Stop</span>
            </label>
            <select
              value={fromStop}
              onChange={(e) => setFromStop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <optgroup label="🛏️ Boys Hostels (BH-1 to BH-12)">
                {groupedStops.boysHostels.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌸 Girls Hostels (GH-1 to GH-9)">
                {groupedStops.girlsHostels.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏢 Academic Blocks (1 to 60)">
                {groupedStops.academicBlocks.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🚪 Campus Gates">
                {groupedStops.gates.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="✨ Campus Hubs & Healthcare">
                {groupedStops.amenities.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* To Stop */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>To Stop</span>
            </label>
            <select
              value={toStop}
              onChange={(e) => setToStop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <optgroup label="🏢 Academic Blocks (1 to 60)">
                {groupedStops.academicBlocks.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🛏️ Boys Hostels (BH-1 to BH-12)">
                {groupedStops.boysHostels.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌸 Girls Hostels (GH-1 to GH-9)">
                {groupedStops.girlsHostels.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🚪 Campus Gates">
                {groupedStops.gates.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="✨ Campus Hubs & Healthcare">
                {groupedStops.amenities.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Time with Quick "Now" toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time</span>
              </label>
              <button
                type="button"
                onClick={setTimeToNow}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
              >
                Set to Now
              </button>
            </div>
            <input
              type="time"
              value={travelTime}
              onChange={(e) => setTravelTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={searching}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{searching ? 'Finding Shuttles...' : 'Search Trips'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Selected Route Breadcrumb */}
      {selectedFromStopObj && selectedToStopObj && (
        <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs font-medium text-slate-700">
          <Navigation2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Searching connections from</span>
          <span className="font-bold text-indigo-900">{selectedFromStopObj.name}</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>to</span>
          <span className="font-bold text-emerald-900">{selectedToStopObj.name}</span>
        </div>
      )}

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              Campus Fleet Availability & Live Units ({sortedShuttles.length})
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              Live Stream
            </span>
          </div>
        </div>

        {searching ? (
          <LoadingSpinner text="Scanning live campus shuttles & routes..." />
        ) : sortedShuttles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No active shuttles found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No shuttles found for this stop combination. Try selecting different stops or view the live map.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sortedShuttles.map((shuttle) => {
              const route = shuttle.assignedRoute || {};
              const isDirectMatch = shuttle.isDirectMatch;
              const isOffDuty = shuttle.isOffDuty;
              const isTrain = shuttle.shuttleNumber.includes('BuggyTrain');

              return (
                <div
                  key={shuttle._id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isOffDuty
                      ? 'border-slate-200 bg-slate-50/50 opacity-80'
                      : isDirectMatch
                      ? 'border-indigo-200 ring-1 ring-indigo-500/10'
                      : 'border-slate-200 opacity-95'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Route Badge & Vehicle Number & Live Beacon */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-lg">
                          Route {route.routeNumber || 'Loop'}
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                          {isTrain ? (
                            <Train className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Bus className="w-4 h-4 text-indigo-600" />
                          )}
                          <span>{shuttle.shuttleNumber}</span>
                        </div>
                        {shuttle.registrationNumber && (
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {shuttle.registrationNumber}
                          </span>
                        )}
                      </div>

                      {/* Real-time Status Badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        isOffDuty
                          ? 'bg-slate-200 text-slate-700 border border-slate-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {!isOffDuty && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                        <span>{isOffDuty ? 'OFF-DUTY' : 'LIVE ON ROUTE'}</span>
                      </div>
                    </div>

                    {/* Route Name & Serves Badge */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">
                          {route.routeName || 'LPU Campus Transit'}
                        </h4>
                        {isDirectMatch && !isOffDuty && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            ✓ Direct Route Match
                          </span>
                        )}
                      </div>

                      {route.stops && route.stops.length > 0 && (
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-indigo-600 font-semibold">{route.stops[0]?.name}</span>
                          <span>→</span>
                          {route.stops.length > 2 && (
                            <>
                              <span className="text-slate-400">... ({route.stops.length} stops)</span>
                              <span>→</span>
                            </>
                          )}
                          <span className="text-emerald-600 font-semibold">
                            {route.stops[route.stops.length - 1]?.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Prominent Realtime Telemetry Card with Exact Live Location */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-3.5 space-y-2.5 shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                            <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                              {isOffDuty ? 'Staging Location' : 'Exact Live Location'}
                            </span>
                            <span className="text-xs font-bold text-white block truncate max-w-[240px]">
                              {shuttle.liveNextStop}
                            </span>
                          </div>
                        </div>

                        {/* Speedometer Badge */}
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-[11px] font-bold text-amber-300">
                          <Gauge className="w-3 h-3" />
                          <span>{isOffDuty ? '0 km/h (Idle)' : `${shuttle.liveSpeed} km/h`}</span>
                        </div>
                      </div>

                      {/* GPS Coordinates and Distance */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">
                            Live GPS Coords
                          </span>
                          <span className="font-mono text-slate-200 text-[11px]">
                            {shuttle.liveLat.toFixed(5)}°, {shuttle.liveLng.toFixed(5)}°
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-semibold">
                            Distance to Pickup
                          </span>
                          <span className="font-bold text-emerald-300 text-[11px]">
                            {isOffDuty
                              ? 'Parked at Depot'
                              : shuttle.distanceToPickupMeters != null
                              ? `~${shuttle.distanceToPickupMeters} meters away`
                              : 'Approaching stop'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Real-Time Arrival / Departure Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Pickup Time
                        </span>
                        <span className="text-xs font-bold text-indigo-700 block">
                          {isOffDuty ? '08:30 AM' : shuttle.dynamicDeparture}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {isOffDuty ? '(Next Shift)' : `(in ~${shuttle.etaToPickupMinutes} min)`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Destination ETA
                        </span>
                        <span className="text-xs font-bold text-slate-800 block">
                          {isOffDuty ? '--:--' : shuttle.dynamicArrival}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          (~{shuttle.tripDurationMinutes} min trip)
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Seat Availability
                        </span>
                        <span
                          className={`text-xs font-extrabold block ${
                            isOffDuty
                              ? 'text-slate-400'
                              : shuttle.availableSeats > 10
                              ? 'text-emerald-600'
                              : shuttle.availableSeats > 0
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {isOffDuty ? 'Off-Duty' : `${shuttle.availableSeats} Left`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({shuttle.currentPassengers}/{shuttle.capacity} onboard)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate(`/student/tracking?route=${route._id}`)}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Live Track on Map</span>
                    </button>

                    <button
                      onClick={() => navigate(`/student/booking?route=${route._id}&shuttle=${shuttle._id}`)}
                      disabled={isOffDuty || shuttle.availableSeats === 0}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span>Reserve Seat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
