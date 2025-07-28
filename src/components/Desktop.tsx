
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import MenuBar from './MenuBar';
import Dock from './Dock';
import Window from './Window';
import SpotlightSearch from './SpotlightSearch';
import { Folder, Trash2, FileText, Calculator } from 'lucide-react';
import TextEditor from './apps/TextEditor';
import CalculatorApp from './apps/Calculator';

const Desktop: React.FC = () => {
  const { windows, isDarkMode, openWindow } = useOS();
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

  const handleTextEditorClick = () => {
    openWindow({
      id: 'texteditor',
      title: 'TextEdit',
      component: TextEditor
    });
  };

  const handleCalculatorClick = () => {
    openWindow({
      id: 'calculator',
      title: 'Calculator',
      component: CalculatorApp
    });
  };

  return (
    <>
      <style>{`
        * {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 8 8, auto;
        }
        
        .desktop-cursor {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 8 8, auto;
        }
        
        .custom-wallpaper {
          background-image: url('https://i.ibb.co/WWG3x47/mountain-wallpaper.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .glass-icon {
          backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        .glass-icon:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 12px 35px 0 rgba(31, 38, 135, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
      `}</style>

      <div 
        className="fixed inset-0 overflow-hidden desktop-cursor custom-wallpaper"
        onContextMenu={handleRightClick}
        onClick={handleClickOutside}
      >
        <MenuBar />
        
        {/* Desktop Icons - Fixed z-index */}
        <div className="absolute top-20 left-20 space-y-4 z-10">
          <div className="flex flex-col items-center space-y-1 group cursor-pointer">
            <div className="w-12 h-12 glass-icon rounded-xl flex items-center justify-center transition-all duration-300">
              <Folder className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow-lg">Documents</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1 group cursor-pointer">
            <div className="w-12 h-12 glass-icon rounded-xl flex items-center justify-center transition-all duration-300">
              <Trash2 className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow-lg">Trash</span>
          </div>

          <div 
            className="flex flex-col items-center space-y-1 group cursor-pointer"
            onClick={handleTextEditorClick}
          >
            <div className="w-12 h-12 glass-icon rounded-xl flex items-center justify-center transition-all duration-300 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl"></div>
              <FileText className="w-7 h-7 text-white drop-shadow-lg relative z-10" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow-lg">TextEdit</span>
          </div>

          <div 
            className="flex flex-col items-center space-y-1 group cursor-pointer"
            onClick={handleCalculatorClick}
          >
            <div className="w-12 h-12 glass-icon rounded-xl flex items-center justify-center transition-all duration-300 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl"></div>
              <Calculator className="w-7 h-7 text-white drop-shadow-lg relative z-10" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow-lg">Calculator</span>
          </div>
        </div>

        {/* Windows - Higher z-index */}
        {windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}

        <Dock />
        <SpotlightSearch />

        {/* Context Menu */}
        {contextMenu && (
          <div
            className={`fixed z-50 py-2 rounded-xl shadow-2xl border backdrop-blur-md min-w-[180px] ${
              isDarkMode 
                ? 'bg-gray-800/90 border-gray-700' 
                : 'bg-white/90 border-gray-200'
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
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-white' : 'text-gray-900'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Desktop;
