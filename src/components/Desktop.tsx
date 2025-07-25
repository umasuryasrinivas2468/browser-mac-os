
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import MenuBar from './MenuBar';
import Dock from './Dock';
import Window from './Window';
import SpotlightSearch from './SpotlightSearch';
import { Folder, Trash2 } from 'lucide-react';

const Desktop: React.FC = () => {
  const { windows, isDarkMode } = useOS();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClickOutside = () => {
    setContextMenu(null);
  };

  const contextMenuItems = [
    { label: 'New Folder', icon: Folder, action: () => console.log('New folder') },
    { label: 'Refresh', icon: null, action: () => window.location.reload() },
    { label: 'Empty Trash', icon: Trash2, action: () => console.log('Empty trash') }
  ];

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{
        background: isDarkMode 
          ? `linear-gradient(135deg, #1e1e2e 0%, #2d3748 25%, #4a5568 50%, #2d3748 75%, #1e1e2e 100%)`
          : `linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)`,
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite'
      }}
      onContextMenu={handleRightClick}
      onClick={handleClickOutside}
    >
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <MenuBar />
      
      {/* Desktop Icons */}
      <div className="absolute top-20 left-4 space-y-4">
        <div className="flex flex-col items-center space-y-1 group cursor-pointer">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
            <Folder className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-xs text-center">Documents</span>
        </div>
        
        <div className="flex flex-col items-center space-y-1 group cursor-pointer">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
            <Trash2 className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-xs text-center">Trash</span>
        </div>
      </div>

      {/* Windows */}
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}

      <Dock />
      <SpotlightSearch />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={`fixed z-50 py-2 rounded-lg shadow-lg border min-w-[150px] ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={handleClickOutside}
        >
          {contextMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
                setContextMenu(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-white' : 'text-gray-900'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Desktop;
