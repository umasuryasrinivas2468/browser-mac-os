
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
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  windows: WindowState[];
  openWindow: (app: { id: string; title: string; component: React.ComponentType<any> }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  currentTime: string;
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
  const [isLocked, setIsLocked] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [currentTime, setCurrentTime] = useState('');

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

  const openWindow = (app: { id: string; title: string; component: React.ComponentType<any> }) => {
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

    setWindows(prev => [...prev, newWindow]);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        position: w.isMaximized ? { x: 100, y: 100 } : { x: 0, y: 0 },
        size: w.isMaximized ? { width: 800, height: 600 } : { width: window.innerWidth, height: window.innerHeight - 80 }
      } : w
    ));
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
    ));
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, size } : w
    ));
  };

  return (
    <OSContext.Provider value={{
      isLocked,
      setIsLocked,
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
    }}>
      {children}
    </OSContext.Provider>
  );
};
