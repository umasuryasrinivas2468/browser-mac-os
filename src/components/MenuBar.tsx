
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Wifi, Battery, Volume2, Search, Shield, TrendingUp, Camera } from 'lucide-react';

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
    <div className={`fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-sm z-50 backdrop-blur-md ${
      isDarkMode 
        ? 'bg-black/30 text-white border-b border-white/10' 
        : 'bg-white/30 text-black border-b border-black/10'
    }`}>
      {/* Left side - App menu */}
      <div className="flex items-center space-x-4">
        <button className="font-medium hover:bg-white/10 px-2 py-1 rounded">
          AczenOS
        </button>
        
        {/* Desktop switcher */}
        <div className="flex items-center space-x-1">
          {availableDesktops.map((desktop) => (
            <button
              key={desktop}
              onClick={() => setCurrentDesktop(desktop)}
              className={`w-6 h-6 text-xs rounded ${
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
      <div className="flex items-center space-x-3">
        <button
          onClick={onCameraClick}
          className="hover:bg-white/10 p-1 rounded transition-colors"
          title="Take Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
        
        <button
          onClick={onSearchClick}
          className="hover:bg-white/10 p-1 rounded transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        
        <button
          onClick={onSecurityClick}
          className="hover:bg-white/10 p-1 rounded transition-colors"
        >
          <Shield className="w-4 h-4" />
        </button>
        
        <button
          onClick={onPopularAppsClick}
          className="hover:bg-white/10 p-1 rounded transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <div className="flex items-center space-x-1">
            <Battery className="w-4 h-4" />
            <span className="text-xs">{batteryLevel}%</span>
          </div>
        </div>

        <span className="font-mono text-xs">
          {currentTime}
        </span>
      </div>
    </div>
  );
};

export default MenuBar;
