
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Shield, Dock as DockIcon, Grid3X3 } from 'lucide-react';

interface MenuBarProps {
  onSecurityClick: () => void;
  onPopularAppsClick: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onSecurityClick, onPopularAppsClick }) => {
  const { currentTime, isDarkMode, isDockVisible, setIsDockVisible } = useOS();

  return (
    <div className="fixed top-0 left-0 right-0 h-8 z-40 flex items-center justify-between px-4 text-sm bg-black text-white">
      {/* Left side - Aczen OS menu */}
      <div className="flex items-center space-x-4">
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
        <span className="font-semibold">Aczen OS</span>
      </div>

      {/* Right side - Control buttons and time */}
      <div className="flex items-center space-x-1">
        {/* Popular Apps Button */}
        <button
          onClick={onPopularAppsClick}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          title="Popular Apps"
        >
          <Grid3X3 className="w-3 h-3 text-white" />
        </button>

        {/* Dock Toggle Button */}
        <button
          onClick={() => setIsDockVisible(!isDockVisible)}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          title={isDockVisible ? 'Hide Dock' : 'Show Dock'}
        >
          <DockIcon className={`w-3 h-3 ${isDockVisible ? 'text-blue-400' : 'text-gray-400'}`} />
        </button>

        {/* Security Button */}
        <button
          onClick={onSecurityClick}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          title="Security Center"
        >
          <Shield className="w-3 h-3 text-blue-400" />
        </button>

        {/* Time */}
        <div className="flex items-center px-3">
          <span className="font-mono text-xs">{currentTime}</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
