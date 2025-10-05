
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WindowState {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface OSContextType {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  windows: WindowState[];
  openWindow: (app: { id: string; title: string; component: React.ComponentType<any>; data?: any }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  currentTime: string;
  isDockVisible: boolean;
  setIsDockVisible: (visible: boolean) => void;
  onWindowOpen: (callback: () => void) => () => void;
  currentDesktop: number;
  setCurrentDesktop: (desktop: number) => void;
  desktops: { [key: number]: WindowState[] };
  createNewDesktop: () => number;
  deleteDesktop: (desktopId: number) => void;
  availableDesktops: number[];
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [windowOpenCallbacks, setWindowOpenCallbacks] = useState<(() => void)[]>([]);
  const [currentDesktop, setCurrentDesktop] = useState(1);
  const [desktops, setDesktops] = useState<{ [key: number]: WindowState[] }>({
    1: [],
    2: []
  });
  const [nextDesktopId, setNextDesktopId] = useState(3);

  // Get windows for current desktop
  const windows = desktops[currentDesktop] || [];
  const availableDesktops = Object.keys(desktops).map(Number).sort();

  const createNewDesktop = () => {
    const newId = nextDesktopId;
    setDesktops(prev => ({
      ...prev,
      [newId]: []
    }));
    setNextDesktopId(prev => prev + 1);
    return newId;
  };

  const deleteDesktop = (desktopId: number) => {
    if (availableDesktops.length <= 1) return; // Don't delete the last desktop
    
    setDesktops(prev => {
      const newDesktops = { ...prev };
      delete newDesktops[desktopId];
      return newDesktops;
    });
    
    // Switch to another desktop if current one is being deleted
    if (currentDesktop === desktopId) {
      const remainingDesktops = availableDesktops.filter(id => id !== desktopId);
      setCurrentDesktop(remainingDesktops[0]);
    }
  };

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const openWindow = (app: { id: string; title: string; component: React.ComponentType<any>; data?: any }) => {
    const existingWindow = windows.find(w => w.id === app.id);
    if (existingWindow) {
      focusWindow(app.id);
      return;
    }

    const newWindow: WindowState = {
      id: app.id,
      title: app.title,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
      size: { width: 800, height: 600 },
      zIndex: Math.max(...windows.map(w => w.zIndex), 0) + 1,
    };

    setDesktops(prev => ({
      ...prev,
      [currentDesktop]: [...prev[currentDesktop], newWindow]
    }));
    
    // Hide dock when opening an application
    setIsDockVisible(false);
    
    // Notify listeners that a window was opened
    windowOpenCallbacks.forEach(callback => callback());
  };

  const closeWindow = (id: string) => {
    setDesktops(prev => {
      const remaining = prev[currentDesktop].filter(w => w.id !== id);
      // Show dock when all windows are closed
      if (remaining.length === 0) {
        setIsDockVisible(true);
      }
      return {
        ...prev,
        [currentDesktop]: remaining
      };
    });
  };

  const minimizeWindow = (id: string) => {
    setDesktops(prev => ({
      ...prev,
      [currentDesktop]: prev[currentDesktop].map(w => 
        w.id === id ? { ...w, isMinimized: true } : w
      )
    }));
  };

  const maximizeWindow = (id: string) => {
    setDesktops(prev => ({
      ...prev,
      [currentDesktop]: prev[currentDesktop].map(w => 
        w.id === id ? { 
          ...w, 
          isMaximized: !w.isMaximized,
          position: w.isMaximized ? { x: 100, y: 100 } : { x: 0, y: 0 },
          size: w.isMaximized ? { width: 800, height: 600 } : { width: window.innerWidth, height: window.innerHeight - 80 }
        } : w
      )
    }));
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setDesktops(prev => ({
      ...prev,
      [currentDesktop]: prev[currentDesktop].map(w => 
        w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
      )
    }));
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setDesktops(prev => ({
      ...prev,
      [currentDesktop]: prev[currentDesktop].map(w => 
        w.id === id ? { ...w, position } : w
      )
    }));
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setDesktops(prev => ({
      ...prev,
      [currentDesktop]: prev[currentDesktop].map(w => 
        w.id === id ? { ...w, size } : w
      )
    }));
  };

  const onWindowOpen = (callback: () => void) => {
    setWindowOpenCallbacks(prev => [...prev, callback]);
    
    // Return cleanup function
    return () => {
      setWindowOpenCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  return (
    <OSContext.Provider value={{
      isDarkMode,
      setIsDarkMode,
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      currentTime,
      isDockVisible,
      setIsDockVisible,
      onWindowOpen,
      currentDesktop,
      setCurrentDesktop,
      desktops,
      createNewDesktop,
      deleteDesktop,
      availableDesktops,
    }}>
      {children}
    </OSContext.Provider>
  );
};
