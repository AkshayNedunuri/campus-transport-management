import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import CampusMap from '../../components/map/CampusMap';
import CapacityIndicator from '../../components/common/CapacityIndicator';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Bus,
  Clock,
  Radio,
  Navigation,
  Users,
  Filter,
  Moon,
  Sun,
  Sparkles,
  AlertTriangle,
  PhoneCall,
  Zap,
  Train,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Fleet', icon: Bus },
  { id: 'BUS', label: 'AC Buses (50p)', icon: Bus },
  { id: 'MINI', label: 'Mini Buses (35p)', icon: Bus },
  { id: 'TRAIN', label: 'Buggy Trains (8p)', icon: Train },
  { id: 'RICK', label: 'E-Rickshaws (6p)', icon: Zap },
  { id: 'NIGHT', label: 'Night Shuttles', icon: Moon },
];

export default function LiveTrackingPage() {
  const [searchParams] = useSearchParams();
  const routeParam = searchParams.get('route');

  const { liveShuttles, isSimulating, scheduleStatus: socketSchedule, setTimingMode, joinRoute, leaveRoute } = useSocket();

  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(routeParam || 'all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShuttleId, setSelectedShuttleId] = useState(null);
  const [showTimetable, setShowTimetable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stopsRes, routesRes, shuttlesRes, schedRes] = await Promise.all([
          apiClient.get('/stops?active=true'),
          apiClient.get('/routes?active=true'),
          apiClient.get('/shuttles'),
          apiClient.get('/shuttles/schedule-status'),
        ]);

        setStops(stopsRes.data?.stops || []);
        setRoutes(routesRes.data?.routes || []);
        const fetchedShuttles = shuttlesRes.data?.shuttles || [];
        setShuttles(fetchedShuttles);
        setScheduleStatus(schedRes.data?.schedule || null);

        if (fetchedShuttles.length > 0) {
          setSelectedShuttleId(fetchedShuttles[0]._id);
        }
      } catch (err) {
        console.error('Failed to load tracking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeSchedule = socketSchedule || scheduleStatus;
  const isNightClosed = activeSchedule && !activeSchedule.isWithinOperatingHours && activeSchedule.timingMode === 'OFFICIAL_SCHEDULE';

  // Handle route socket joining
  useEffect(() => {
    if (selectedRouteId && selectedRouteId !== 'all') {
      joinRoute(selectedRouteId);
      return () => leaveRoute(selectedRouteId);
    }
  }, [selectedRouteId]);

  if (loading) {
    return <LoadingSpinner text="Connecting to live GPS transit stream..." />;
  }

  // Filter routes and shuttles based on selection
  const filteredRoutes =
    selectedRouteId === 'all'
      ? routes
      : routes.filter((r) => r._id === selectedRouteId);

  const filteredShuttles = shuttles.filter((s) => {
    // Filter by route
    if (selectedRouteId !== 'all') {
      const matchRoute = s.assignedRoute && (s.assignedRoute._id === selectedRouteId || s.assignedRoute === selectedRouteId);
      if (!matchRoute) return false;
    }
    // Filter by category tab
    if (selectedCategory === 'TRAIN') {
      return s.shuttleNumber.includes('BuggyTrain') || s.shuttleNumber.includes('Train');
    }
    if (selectedCategory === 'MINI') {
      return s.shuttleNumber.includes('Mini');
    }
    if (selectedCategory === 'RICK') {
      return s.shuttleNumber.includes('ERick');
    }
    if (selectedCategory === 'NIGHT') {
      return s.shuttleNumber.includes('Night');
    }
    if (selectedCategory === 'BUS') {
      return s.shuttleNumber.includes('Shuttle');
    }
    return true;
  });

  const activeSelectedShuttle = shuttles.find((s) => s._id === selectedShuttleId);
  const liveSelected = activeSelectedShuttle
    ? liveShuttles[activeSelectedShuttle._id] || activeSelectedShuttle
    : null;

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">LPU Multi-Fleet Live GPS Tracking</h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                Phagwara 600-Acre Campus
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time GPS telemetry for AC Buses, Mini Buses, Buggy Trains & E-Rickshaws</p>
          </div>
        </div>

        {/* Route Filter Dropdown & Timetable Modal Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTimetable((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{showTimetable ? 'Hide Timetable' : 'Fleet Timetable'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Routes ({routes.length})</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.routeNumber} - {r.routeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Timetable & Operating Window Matrix Card */}
      {showTimetable && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Official LPU Campus Transit Timetable & Fleet Operating Windows</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">Current IST: {activeSchedule?.currentTimeIST}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-sky-600" />
                  <span>Campus Buggy Train (LPU Mini-Train)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  08:30 AM – 06:00 PM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Multi-coach electric chain across Central Quad, Library, CSE & Unipolis during daytime class hours. Closed at evenings & nights.</p>
              <div className="mt-2 text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Status at 07:18 PM: OFF-DUTY (Closed after 6 PM)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Campus Express (Large AC Buses)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  07:00 AM – 08:00 PM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">50-seater main arterial loops connecting Gate 1, Uni-Mall, CSE, Academic Blocks, BH & GH clusters to Gate 4.</p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Status: OPERATIONAL (Final loops)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Feeder (Mini Buses)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  07:30 AM – 08:30 PM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">35-seater feeder lines connecting south campus hostels (BH-9 to 12), Sports Arena, Agriculture plots and department quads.</p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Status: OPERATIONAL</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hostel Hop (E-Rickshaws)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  06:30 AM – 10:00 PM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">6-seater high-frequency rapid transit between hostel gates, Uni-Mall food courts, Uni-Hospital and campus exits.</p>
              <div className="mt-2 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Status: OPERATIONAL (High Frequency)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Night Safety Shuttles</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  08:00 PM – 11:00 PM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Dedicated late evening safety buses connecting all Boys & Girls hostels, Uni-Hospital, and Gate 1 with campus security.</p>
              <div className="mt-2 text-[10px] font-semibold text-indigo-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Status: STANDBY (Starts 08:00 PM)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-red-100 bg-red-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Uni-Hospital Emergency Dispatch</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  24/7 Continuous
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Immediate medical ambulance dispatch from Uni-Hospital Block 3 for student healthcare emergencies across campus.</p>
              <div className="mt-2 text-[10px] font-semibold text-red-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Status: 24/7 ON-CALL (+91 1824-517000)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LPU Operating Schedule Notice Banner & Interactive Mode Switch */}
      {activeSchedule && (
        <div className={`p-4 rounded-2xl border shadow-sm transition-all ${
          isNightClosed
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800'
            : 'bg-emerald-50/80 border-emerald-200 text-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                isNightClosed ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isNightClosed ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isNightClosed ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-200 text-emerald-800'
                  }`}>
                    {isNightClosed ? '🌙 Night Hours Staging' : '⚡ LPU Transit Operating Window'}
                  </span>
                  <span className="text-xs opacity-75">
                    IST: <strong>{activeSchedule.currentTimeIST}</strong> | Active Fleet Units: <strong>{shuttles.length} Vehicles</strong>
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isNightClosed ? 'text-slate-300' : 'text-slate-600'}`}>
                  Campus transit follows vehicle category timetables. (Buggy Train runs 08:30 AM – 06:00 PM; E-Rickshaws & Buses run into the evening).
                </p>
              </div>
            </div>

            {/* Timing Mode Switcher */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-black/20 p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setTimingMode('OFFICIAL_SCHEDULE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSchedule.timingMode === 'OFFICIAL_SCHEDULE'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Follow strict LPU operating hours (Buggy train closes 6 PM, night shuttles start 8 PM)"
              >
                Official LPU Timings
              </button>
              <button
                type="button"
                onClick={() => setTimingMode('DEMO_OVERRIDE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSchedule.timingMode === 'DEMO_OVERRIDE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Force simulated live tracking for project presentation & testing at any hour"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>24/7 Demo Simulation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Map + Live Shuttles Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container (2 cols on large screen) */}
        <div className="lg:col-span-2">
          <CampusMap
            stops={stops}
            routes={filteredRoutes}
            shuttles={filteredShuttles}
            liveUpdates={liveShuttles}
            selectedShuttleId={selectedShuttleId}
            onSelectShuttle={(s) => setSelectedShuttleId(s._id)}
            height="580px"
            isSimulating={isSimulating}
          />
        </div>

        {/* Shuttles List & Detail Panel */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Active Shuttles List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-indigo-600" />
                <span>LPU Vehicles ({filteredShuttles.length})</span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
                Live Telemetry
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredShuttles.map((shuttle) => {
                const live = liveShuttles[shuttle._id] || shuttle;
                const isSelected = selectedShuttleId === shuttle._id;
                const isOffDuty = live.status === 'OFF_DUTY' || shuttle.status === 'OFF_DUTY';

                return (
                  <div
                    key={shuttle._id}
                    onClick={() => setSelectedShuttleId(shuttle._id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                        : isOffDuty
                        ? 'border-slate-200 bg-slate-50/80 opacity-75 hover:opacity-100'
                        : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">
                          {shuttle.shuttleNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {shuttle.assignedRoute?.routeNumber || 'Loop'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOffDuty
                          ? 'bg-slate-200 text-slate-700'
                          : live.status === 'DELAYED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOffDuty ? 'OFF-DUTY' : live.eta || 'Active'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mb-1">
                      {isOffDuty
                        ? live.nextStopName || 'Parked: Gate 4 Transport Depot'
                        : live.nextStopName ? `Heading to: ${live.nextStopName}` : 'In Transit'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Speed: {isOffDuty ? '0 km/h' : `${live.speed || 20} km/h`}</span>
                      <span>
                        {isOffDuty ? '0' : (live.currentPassengerCount ?? shuttle.currentPassengerCount)}/{shuttle.capacity} seats
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Shuttle Live Telemetry Card */}
          {liveSelected && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Selected Vehicle</span>
                  <h4 className="text-base font-bold text-slate-900">
                    {liveSelected.shuttleNumber}
                  </h4>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    liveSelected.status === 'OFF_DUTY'
                      ? 'bg-slate-200 text-slate-700'
                      : liveSelected.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {liveSelected.status === 'OFF_DUTY' ? 'OFF-DUTY' : (liveSelected.status || 'Active')}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-semibold text-slate-800">
                    {activeSelectedShuttle?.assignedRoute?.routeName || 'Campus Transit'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    {liveSelected.status === 'OFF_DUTY' ? 'Operating Window:' : 'Estimated Arrival (ETA):'}
                  </span>
                  <span className="font-bold text-indigo-600 text-sm">
                    {liveSelected.status === 'OFF_DUTY'
                      ? (liveSelected.operatingWindow || 'Daytime Class Hours')
                      : (liveSelected.eta || '4 min')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    {liveSelected.status === 'OFF_DUTY' ? 'Current Staging Location:' : 'Next Scheduled Stop:'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {liveSelected.status === 'OFF_DUTY'
                      ? 'Gate 4 Central Transport Depot'
                      : (liveSelected.nextStopName || 'Main Campus Stop')}
                  </span>
                </div>

                {liveSelected.status !== 'OFF_DUTY' && (
                  <div className="pt-2 border-t border-slate-100">
                    <CapacityIndicator
                      currentCount={liveSelected.currentPassengerCount || 0}
                      capacity={activeSelectedShuttle?.capacity || 50}
                    />
                  </div>
                )}

                {activeSelectedShuttle?.driver && (
                  <p className="text-[11px] text-slate-500 mt-2">
                    Driver: {activeSelectedShuttle.driver.name || 'Assigned'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
