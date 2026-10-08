import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import CapacityIndicator from '../../components/common/CapacityIndicator';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Bus,
  Play,
  Square,
  Users,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  Radio,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { isConnected, sendLocationUpdate, sendPassengerUpdate } = useSocket();

  const [loading, setLoading] = useState(true);
  const [myShuttle, setMyShuttle] = useState(null);
  const [myTrip, setMyTrip] = useState(null);
  const [passengerCount, setPassengerCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // Get shuttles assigned to this driver
        const shuttlesRes = await apiClient.get('/shuttles');
        const all = shuttlesRes.data?.shuttles || [];
        const mine = all.find(
          (s) => s.driver && (s.driver._id === user._id || s.driver === user._id)
        );
        setMyShuttle(mine || null);

        if (mine) {
          setPassengerCount(mine.currentPassengerCount || 0);
          // Find active or scheduled trip for this shuttle
          const tripsRes = await apiClient.get('/trips', {
            params: { shuttle: mine._id, status: 'IN_PROGRESS' },
          });
          const trips = tripsRes.data?.trips || [];
          if (trips.length > 0) setMyTrip(trips[0]);
          else {
            const scheduled = await apiClient.get('/trips', {
              params: { shuttle: mine._id, status: 'SCHEDULED' },
            });
            const sched = scheduled.data?.trips || [];
            if (sched.length > 0) setMyTrip(sched[0]);
          }
        }
      } catch (err) {
        console.error('Driver data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [user]);

  const startLocationSharing = () => {
    if (locationIntervalRef.current) return;

    // Base coordinates of campus
    let lat = 12.9716 + (Math.random() - 0.5) * 0.005;
    let lng = 77.5946 + (Math.random() - 0.5) * 0.005;

    locationIntervalRef.current = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.0005;
      lng += (Math.random() - 0.5) * 0.0005;
      const speed = Math.floor(Math.random() * 15) + 18;

      if (myShuttle) {
        sendLocationUpdate({
          shuttleId: myShuttle._id,
          latitude: lat,
          longitude: lng,
          speed,
          heading: Math.floor(Math.random() * 360),
        });
      }
    }, 3000);
  };

  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopLocationSharing();
  }, []);

  const handleStartTrip = async () => {
    if (!myTrip) return;
    setActionLoading(true);
    try {
      const res = await apiClient.put(`/trips/${myTrip._id}/start`);
      setMyTrip(res.data?.trip || myTrip);
      setStatusMsg('Trip started successfully! Location sharing is active.');
      startLocationSharing();
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!myTrip) return;
    setActionLoading(true);
    try {
      const res = await apiClient.put(`/trips/${myTrip._id}/end`);
      setMyTrip(res.data?.trip || myTrip);
      stopLocationSharing();
      setStatusMsg('Trip completed. Location sharing stopped.');
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePassengerUpdate = async (newCount) => {
    const clampedCount = Math.max(0, Math.min(myShuttle?.capacity || 50, newCount));
    setPassengerCount(clampedCount);
    if (myShuttle) {
      try {
        sendPassengerUpdate({ shuttleId: myShuttle._id, passengerCount: clampedCount });
        await apiClient.put(`/shuttles/${myShuttle._id}/status`, {
          currentPassengerCount: clampedCount,
        });
      } catch (err) {
        console.error('Passenger update error:', err);
      }
    }
  };

  const handleReportStatus = async (status) => {
    if (!myShuttle) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/shuttles/${myShuttle._id}/status`, { status });
      setMyShuttle((prev) => ({ ...prev, status }));
      setStatusMsg(`Shuttle status updated to: ${status}`);
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading driver console..." />;

  if (!myShuttle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
        <Bus className="w-14 h-14 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-700">No Shuttle Assigned</h3>
        <p className="text-sm text-slate-500">
          Contact the transport administrator to assign you a shuttle.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Driver Console
            </span>
            <h2 className="text-xl font-bold mt-1">Welcome, {user?.name?.split(' ')[0]}</h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{isConnected ? 'Dispatch Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-slate-300 font-medium">Vehicle</p>
            <p className="text-lg font-extrabold">{myShuttle.shuttleNumber}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-slate-300 font-medium">Route</p>
            <p className="text-lg font-extrabold">
              {myShuttle.assignedRoute?.routeNumber || 'N/A'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-slate-300 font-medium">Status</p>
            <p className={`text-sm font-extrabold ${
              myShuttle.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {myShuttle.status}
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800 font-medium">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Passenger Count Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span>Passenger Count</span>
        </h3>

        <CapacityIndicator
          currentCount={passengerCount}
          capacity={myShuttle.capacity}
        />

        <div className="flex items-center justify-center gap-6 mt-5">
          <button
            onClick={() => handlePassengerUpdate(passengerCount - 5)}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <span className="text-lg font-bold">-5</span>
          </button>
          <button
            onClick={() => handlePassengerUpdate(passengerCount - 1)}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="text-3xl font-extrabold text-slate-900 w-16 text-center">
            {passengerCount}
          </div>
          <button
            onClick={() => handlePassengerUpdate(passengerCount + 1)}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => handlePassengerUpdate(passengerCount + 5)}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <span className="text-lg font-bold">+5</span>
          </button>
        </div>
        <p className="text-xs text-center text-slate-400 mt-2">
          Capacity: {myShuttle.capacity} passengers
        </p>
      </div>

      {/* Trip Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-600" />
          <span>Trip Controls</span>
        </h3>

        {myTrip ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-semibold text-slate-800">
                  {myTrip.route?.routeName || 'Campus Route'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trip Status:</span>
                <StatusBadge status={myTrip.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Start:</span>
                <span className="font-medium">
                  {new Date(myTrip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {myTrip.status === 'SCHEDULED' && (
                <button
                  onClick={handleStartTrip}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition col-span-2 shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{actionLoading ? 'Starting...' : 'Start Trip'}</span>
                </button>
              )}

              {myTrip.status === 'IN_PROGRESS' && (
                <button
                  onClick={handleEndTrip}
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition col-span-2 shadow-md"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>{actionLoading ? 'Ending...' : 'End Trip'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            No active or scheduled trip. Contact dispatch for assignment.
          </p>
        )}
      </div>

      {/* Report Status Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Report Shuttle Status</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleReportStatus('DELAYED')}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-amber-200 hover:bg-amber-50 text-amber-700 rounded-xl font-semibold text-sm transition"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Delayed</span>
          </button>
          <button
            onClick={() => handleReportStatus('MAINTENANCE')}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl font-semibold text-sm transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Breakdown</span>
          </button>
          <button
            onClick={() => handleReportStatus('ACTIVE')}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm transition col-span-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Operational</span>
          </button>
        </div>
      </div>
    </div>
  );
}
