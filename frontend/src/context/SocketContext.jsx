import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:5000');

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveShuttles, setLiveShuttles] = useState({}); // shuttleId -> latest data
  const [isSimulating, setIsSimulating] = useState(true);
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO Connected]:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Disconnected]');
      setIsConnected(false);
    });

    socket.on('simulation:status', (data) => {
      if (data && data.isRunning !== undefined) {
        setIsSimulating(data.isRunning);
      }
    });

    socket.on('schedule:status', (data) => {
      if (data) {
        setScheduleStatus(data);
      }
    });

    // Real-time location & ETA updates from simulated or real drivers
    socket.on('shuttle:location:update', (update) => {
      if (update && update.shuttleId) {
        setLiveShuttles((prev) => ({
          ...prev,
          [update.shuttleId]: {
            ...prev[update.shuttleId],
            ...update,
            lastUpdateReceived: new Date(),
          },
        }));
      }
    });

    // Passenger count updates
    socket.on('shuttle:passenger:update', (update) => {
      if (update && update.shuttleId) {
        setLiveShuttles((prev) => ({
          ...prev,
          [update.shuttleId]: {
            ...prev[update.shuttleId],
            ...update,
          },
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoute = (routeId) => {
    if (socketRef.current && routeId) {
      socketRef.current.emit('join:route', routeId);
    }
  };

  const leaveRoute = (routeId) => {
    if (socketRef.current && routeId) {
      socketRef.current.emit('leave:route', routeId);
    }
  };

  const joinShuttle = (shuttleId) => {
    if (socketRef.current && shuttleId) {
      socketRef.current.emit('join:shuttle', shuttleId);
    }
  };

  const leaveShuttle = (shuttleId) => {
    if (socketRef.current && shuttleId) {
      socketRef.current.emit('leave:shuttle', shuttleId);
    }
  };

  const sendLocationUpdate = (payload) => {
    if (socketRef.current) {
      socketRef.current.emit('driver:location:update', payload);
    }
  };

  const sendPassengerUpdate = (payload) => {
    if (socketRef.current) {
      socketRef.current.emit('driver:passenger:update', payload);
    }
  };

  const toggleSimulation = () => {
    if (socketRef.current) {
      socketRef.current.emit('simulation:toggle', {});
    }
  };

  const setTimingMode = (mode) => {
    if (socketRef.current && mode) {
      socketRef.current.emit('schedule:set-mode', { mode });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        liveShuttles,
        isSimulating,
        scheduleStatus,
        setTimingMode,
        joinRoute,
        leaveRoute,
        joinShuttle,
        leaveShuttle,
        sendLocationUpdate,
        sendPassengerUpdate,
        toggleSimulation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
