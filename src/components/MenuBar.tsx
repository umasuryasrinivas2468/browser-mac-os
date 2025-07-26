
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Wifi, Battery, Bluetooth, Volume2, Settings, Bell } from 'lucide-react';

const MenuBar: React.FC = () => {
  const { currentTime, isDarkMode } = useOS();

  return (
    <div className={`fixed top-0 left-0 right-0 h-8 z-40 flex items-center justify-between px-4 text-sm ${
      isDarkMode 
        ? 'bg-black/80 backdrop-blur-md border-b border-white/10 text-white' 
        : 'bg-white/80 backdrop-blur-md border-b border-black/10 text-black'
    }`}>
      {/* Left side - Aczen OS menu */}
      <div className="flex items-center space-x-4">
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
        <span className="font-semibold">Aczen OS</span>
      </div>

      {/* Right side - Status items */}
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-1 hover:bg-white/10 p-1 rounded transition-colors">
          <Bluetooth className="w-4 h-4 text-blue-500" />
        </button>
        
        <button className="flex items-center space-x-1 hover:bg-white/10 p-1 rounded transition-colors">
          <Wifi className="w-4 h-4" />
        </button>
        
        <button className="flex items-center space-x-1 hover:bg-white/10 p-1 rounded transition-colors">
          <Volume2 className="w-4 h-4" />
        </button>
        
        <button className="flex items-center space-x-1 hover:bg-white/10 p-1 rounded transition-colors">
          <Battery className="w-4 h-4" />
          <span className="text-xs">100%</span>
        </button>

        <button className="flex items-center space-x-1 hover:bg-white/10 p-1 rounded transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <button className="flex items-center space-x-1 hover:bg-white/10 p-1 rounded transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 px-2">
          <span className="font-mono">{currentTime}</span>
        </div>

        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
