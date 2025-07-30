import React, { useState, useMemo, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Calculator,
  Clock,
  Calendar,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  X,
  Grid3X3,
  Search
} from 'lucide-react';
import CalculatorApp from '@/components/apps/Calculator';
import ClockApp from '@/components/apps/ClockApp';
import CalendarApp from '@/components/apps/CalendarApp';
import AczenSheetsApp from '@/components/apps/AczenSheetsApp';

interface PopupApp {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  color: string;
  isOpen: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const PopupApps: React.FC = () => {
  const { isDarkMode, isDockVisible, onWindowOpen } = useOS();
  const [showLauncher, setShowLauncher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popupApps, setPopupApps] = useState<PopupApp[]>([
    {
      id: 'popup-calculator',
      title: 'Calculator',
      icon: Calculator,
      component: CalculatorApp,
      color: 'bg-orange-500',
      isOpen: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 480 }
    },
    {
      id: 'popup-clock',
      title: 'Clock',
      icon: Clock,
      component: ClockApp,
      color: 'bg-indigo-500',
      isOpen: false,
      position: { x: 150, y: 150 },
      size: { width: 400, height: 300 }
    },
    {
      id: 'popup-calendar',
      title: 'Calendar',
      icon: Calendar,
      component: CalendarApp,
      color: 'bg-red-500',
      isOpen: false,
      position: { x: 200, y: 200 },
      size: { width: 800, height: 600 }
    },
    {
      id: 'popup-sheets',
      title: 'Aczen Sheets',
      icon: FileSpreadsheet,
      component: AczenSheetsApp,
      color: 'bg-green-600',
      isOpen: false,
      position: { x: 250, y: 250 },
      size: { width: 900, height: 700 }
    }
  ]);

  // Filter apps based on search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return popupApps;
    return popupApps.filter(app => 
      app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popupApps, searchQuery]);

  const openPopupApp = (appId: string) => {
    setPopupApps(prev => prev.map(app => 
      app.id === appId ? { ...app, isOpen: true } : app
    ));
    setShowLauncher(false);
    setSearchQuery(''); // Clear search when opening app
  };

  const handleLauncherClose = () => {
    setShowLauncher(false);
    setSearchQuery(''); // Clear search when closing
  };

  // Close all popup apps when a regular window is opened
  useEffect(() => {
    const cleanup = onWindowOpen(() => {
      setPopupApps(prev => prev.map(app => ({ ...app, isOpen: false })));
      setShowLauncher(false);
      setSearchQuery('');
    });

    return cleanup;
  }, [onWindowOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLauncher) {
        if (e.key === 'Escape') {
          handleLauncherClose();
        } else if (e.key === 'Enter' && filteredApps.length === 1) {
          openPopupApp(filteredApps[0].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLauncher, filteredApps]);

  // Listen for toggle event from MenuBar
  useEffect(() => {
    const handleToggle = () => {
      setShowLauncher(prev => !prev);
    };

    window.addEventListener('togglePopularApps', handleToggle);
    return () => window.removeEventListener('togglePopularApps', handleToggle);
  }, []);

  const closePopupApp = (appId: string) => {
    setPopupApps(prev => prev.map(app => 
      app.id === appId ? { ...app, isOpen: false } : app
    ));
  };

  const minimizePopupApp = (appId: string) => {
    setPopupApps(prev => prev.map(app => 
      app.id === appId ? { ...app, isOpen: false } : app
    ));
  };

  const updateAppPosition = (appId: string, position: { x: number; y: number }) => {
    setPopupApps(prev => prev.map(app => 
      app.id === appId ? { ...app, position } : app
    ));
  };

  const PopupWindow: React.FC<{ app: PopupApp }> = ({ app }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - app.position.x,
        y: e.clientY - app.position.y
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateAppPosition(app.id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, dragOffset]);

    if (!app.isOpen) return null;

    return (
      <div
        className={`fixed z-50 rounded-lg shadow-2xl border flex flex-col ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
        style={{
          left: app.position.x,
          top: app.position.y,
          width: app.size.width,
          height: app.size.height
        }}
      >
        {/* Title Bar */}
        <div
          className={`flex items-center justify-between p-3 border-b cursor-move ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-5 h-5 rounded ${app.color} flex items-center justify-center`}>
              <app.icon className="w-3 h-3 text-white" />
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {app.title}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => minimizePopupApp(app.id)}
              className={`p-1 rounded hover:bg-gray-200 ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => closePopupApp(app.id)}
              className={`p-1 rounded hover:bg-red-100 text-red-500 ${
                isDarkMode ? 'hover:bg-red-900/20' : ''
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
          <app.component isPopupView={true} />
        </div>
      </div>
    );
  };

  return (
    <>

      {/* Popup Apps Launcher */}
      {showLauncher && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={handleLauncherClose}
        >
          <div 
            className={`relative w-80 p-6 rounded-2xl shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-900/90 border border-gray-700' 
                : 'bg-white/90 border border-gray-200'
            } backdrop-blur-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleLauncherClose}
              className={`absolute top-4 right-4 w-6 h-6 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors`}
            >
              <X className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
            </button>

            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Popular Apps
            </h3>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                  } flex items-center justify-center text-xs transition-colors`}
                >
                  ×
                </button>
              )}
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredApps.length > 0 ? filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openPopupApp(app.id)}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'hover:bg-gray-800/50' 
                      : 'hover:bg-gray-100/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg ${app.color} flex items-center justify-center shadow-md`}>
                    <app.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm text-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {app.title}
                  </span>
                  {app.isOpen && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              )) : (
                <div className={`col-span-2 text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No apps found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            <div className={`mt-4 text-xs text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {searchQuery ? 'Search results' : 'Click to open apps in floating windows'}
            </div>
          </div>
        </div>
      )}

      {/* Render Open Popup Apps */}
      {popupApps.map((app) => (
        <PopupWindow key={app.id} app={app} />
      ))}


    </>
  );
};

export default PopupApps;