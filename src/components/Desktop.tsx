import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import MenuBar from './MenuBar';
import Dock from './Dock';
import Window from './Window';
import SpotlightSearch from './SpotlightSearch';
import { Folder, Trash2, FileText } from 'lucide-react';
import TextEditor from './apps/TextEditor';

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

  return (
    <>
      <style>{`
        * {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>') 12 12, auto;
        }
        
        .desktop-cursor {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1.5"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>') 12 12, auto;
        }
        
        .mountain-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
          background-size: 400% 400%;
          animation: gradient-shift 20s ease infinite;
        }
        
        .mountain-overlay {
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
          animation: mountain-float 25s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes mountain-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        
        .glass-icon {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        
        .glass-icon:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
        }
      `}</style>

      <div 
        className="fixed inset-0 overflow-hidden desktop-cursor mountain-bg"
        onContextMenu={handleRightClick}
        onClick={handleClickOutside}
      >
        <div className="absolute inset-0 mountain-overlay"></div>

        <MenuBar />
        
        {/* Desktop Icons */}
        <div className="absolute top-20 left-6 space-y-6 z-10">
          <div className="flex flex-col items-center space-y-2 group cursor-pointer">
            <div className="w-16 h-16 glass-icon rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <Folder className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg">Documents</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2 group cursor-pointer">
            <div className="w-16 h-16 glass-icon rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <Trash2 className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg">Trash</span>
          </div>

          {/* TextEdit App */}
          <div 
            className="flex flex-col items-center space-y-2 group cursor-pointer"
            onClick={handleTextEditorClick}
          >
            <div className="w-16 h-16 glass-icon rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl"></div>
              <FileText className="w-9 h-9 text-white drop-shadow-lg relative z-10" />
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg">TextEdit</span>
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
