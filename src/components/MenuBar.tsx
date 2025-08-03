
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Wifi, Battery, Volume2, Search, Shield, TrendingUp, Camera, Menu } from 'lucide-react';

interface MenuBarProps {
  onSecurityClick: () => void;
  onPopularAppsClick: () => void;
  onSearchClick: () => void;
  onCameraClick?: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  onSecurityClick, 
  onPopularAppsClick, 
  onSearchClick,
  onCameraClick 
}) => {
  const { isDarkMode, currentTime, currentDesktop, availableDesktops, setCurrentDesktop } = useOS();
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Simulate battery level changes
    const interval = setInterval(() => {
      setBatteryLevel(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(20, Math.min(100, prev + change));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-2 sm:px-4 text-xs sm:text-sm z-50 backdrop-blur-md ${
      isDarkMode 
        ? 'bg-black/30 text-white border-b border-white/10' 
        : 'bg-white/30 text-black border-b border-black/10'
    }`}>
      {/* Left side - App menu */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="font-medium hover:bg-white/10 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm">
          AczenOS
        </button>
        
        {/* Desktop switcher - hidden on very small screens */}
        <div className="hidden sm:flex items-center space-x-1">
          {availableDesktops.map((desktop) => (
            <button
              key={desktop}
              onClick={() => setCurrentDesktop(desktop)}
              className={`w-5 h-5 sm:w-6 sm:h-6 text-xs rounded ${
                currentDesktop === desktop
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {desktop}
            </button>
          ))}
        </div>
      </div>

      {/* Right side - System icons */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        {/* Mobile menu button */}
        <button
          className="sm:hidden hover:bg-white/10 p-1 rounded transition-colors"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop icons - hidden on mobile unless menu is open */}
        <div className={`${showMobileMenu ? 'flex' : 'hidden'} sm:flex items-center space-x-1 sm:space-x-3`}>
          <button
            onClick={onCameraClick}
            className="hover:bg-white/10 p-1 rounded transition-colors"
            title="Take Screenshot"
          >
            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={onSearchClick}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={onSecurityClick}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={onPopularAppsClick}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <div className="flex items-center space-x-1">
              <Battery className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs hidden sm:inline">{batteryLevel}%</span>
            </div>
          </div>
        </div>

        <span className="font-mono text-xs">
          {currentTime}
        </span>
      </div>

      {/* Mobile dropdown menu */}
      {showMobileMenu && (
        <div className={`absolute top-8 right-0 w-48 rounded-lg shadow-lg border z-50 sm:hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-2 space-y-1">
            {availableDesktops.map((desktop) => (
              <button
                key={desktop}
                onClick={() => {
                  setCurrentDesktop(desktop);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  currentDesktop === desktop
                    ? 'bg-blue-500 text-white'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                Desktop {desktop}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
