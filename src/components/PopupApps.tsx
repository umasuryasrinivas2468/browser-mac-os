import React, { useState, useMemo, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Calculator,
  Clock,
  Calendar,
  FileSpreadsheet,
  Minimize2,
  X,
  Search,
  Users,
  Terminal,
  FileText,
  Folder,
  Globe,
  Settings,
  Building2,
  Code,
  Map
} from 'lucide-react';

// Simple fallback component for missing apps
const FallbackApp: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <p>Loading {title}...</p>
  </div>
);

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

interface PopupAppsProps {
  onWindowOpen?: () => void;
}

const PopupApps: React.FC<PopupAppsProps> = ({ onWindowOpen = () => {} }) => {
  const { isDarkMode } = useOS();
  const [showLauncher, setShowLauncher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [popupApps, setPopupApps] = useState<PopupApp[]>([
    {
      id: 'popup-calculator',
      title: 'Calculator',
      icon: Calculator,
      component: () => <FallbackApp title="Calculator" />,
      color: 'bg-orange-500',
      isOpen: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 480 }
    },
    {
      id: 'popup-clock',
      title: 'Clock',
      icon: Clock,
      component: () => <FallbackApp title="Clock" />,
      color: 'bg-indigo-500',
      isOpen: false,
      position: { x: 150, y: 150 },
      size: { width: 400, height: 300 }
    },
    {
      id: 'popup-maps',
      title: 'Maps',
      icon: Map,
      component: () => <FallbackApp title="Maps" />,
      color: 'bg-green-500',
      isOpen: false,
      position: { x: 200, y: 200 },
      size: { width: 900, height: 600 }
    }
  ]);

  const [anotherApps, setAnotherApps] = useState<PopupApp[]>([
    {
      id: 'popup-terminal',
      title: 'Terminal',
      icon: Terminal,
      component: () => <FallbackApp title="Terminal" />,
      color: 'bg-black',
      isOpen: false,
      position: { x: 350, y: 350 },
      size: { width: 700, height: 500 }
    },
    {
      id: 'popup-notes',
      title: 'Notes',
      icon: FileText,
      component: () => <FallbackApp title="Notes" />,
      color: 'bg-yellow-500',
      isOpen: false,
      position: { x: 400, y: 400 },
      size: { width: 600, height: 500 }
    }
  ]);

  const filteredPopularApps = useMemo(() => {
    if (!searchQuery.trim()) return popupApps;
    return popupApps.filter(app => 
      app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popupApps, searchQuery]);

  const filteredAnotherApps = useMemo(() => {
    if (!searchQuery.trim()) return anotherApps;
    return anotherApps.filter(app => 
      app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [anotherApps, searchQuery]);

  const openPopupApp = (appId: string) => {
    if (popupApps.find(app => app.id === appId)) {
      setPopupApps(prev => prev.map(app => 
        app.id === appId ? { ...app, isOpen: true } : app
      ));
    } else {
      setAnotherApps(prev => prev.map(app => 
        app.id === appId ? { ...app, isOpen: true } : app
      ));
    }
    setShowLauncher(false);
    setSearchQuery('');
  };

  const closePopupApp = (appId: string) => {
    if (popupApps.find(app => app.id === appId)) {
      setPopupApps(prev => prev.map(app => 
        app.id === appId ? { ...app, isOpen: false } : app
      ));
    } else {
      setAnotherApps(prev => prev.map(app => 
        app.id === appId ? { ...app, isOpen: false } : app
      ));
    }
  };

  const handleLauncherClose = () => {
    setShowLauncher(false);
    setSearchQuery('');
  };

  // Listen for toggle event
  useEffect(() => {
    const handleToggle = () => {
      setShowLauncher(prev => !prev);
    };

    window.addEventListener('togglePopularApps', handleToggle);
    return () => window.removeEventListener('togglePopularApps', handleToggle);
  }, []);

  const PopupWindow: React.FC<{ app: PopupApp }> = ({ app }) => {
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
        <div className={`flex items-center justify-between p-3 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-5 h-5 rounded ${app.color} flex items-center justify-center`}>
              <app.icon className="w-3 h-3 text-white" />
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {app.title}
            </span>
          </div>
          <button
            onClick={() => closePopupApp(app.id)}
            className="p-1 rounded hover:bg-red-100 text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden">
          <app.component />
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
            className={`relative w-[600px] h-[400px] p-6 rounded-xl shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-900/80 border border-gray-700/50' 
                : 'bg-white/80 border border-gray-200/50'
            } backdrop-blur-lg`}
            onClick={(e) => e.stopPropagation()}
          >
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

            {/* Popular Apps Section */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Popular Apps
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {filteredPopularApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openPopupApp(app.id)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                      isDarkMode 
                        ? 'hover:bg-gray-800/50' 
                        : 'hover:bg-gray-100/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center shadow-md`}>
                      <app.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs text-center ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Another Apps Section */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Another Apps
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {filteredAnotherApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openPopupApp(app.id)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                      isDarkMode 
                        ? 'hover:bg-gray-800/50' 
                        : 'hover:bg-gray-100/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center shadow-md`}>
                      <app.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs text-center ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Open Popup Apps */}
      {[...popupApps, ...anotherApps].map((app) => (
        <PopupWindow key={app.id} app={app} />
      ))}
    </>
  );
};

export default PopupApps;
