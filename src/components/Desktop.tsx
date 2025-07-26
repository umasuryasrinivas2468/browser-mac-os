
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
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 8 8, auto;
        }
        
        .desktop-cursor {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 8 8, auto;
        }
        
        .mountain-wallpaper {
          background: linear-gradient(180deg, 
            #87CEEB 0%,           /* Sky blue */
            #98D8E8 15%,          /* Light sky */
            #B8E6B8 25%,          /* Light green hills */
            #90EE90 35%,          /* Light green */
            #228B22 50%,          /* Forest green */
            #006400 65%,          /* Dark green */
            #2F4F2F 80%,          /* Dark slate gray */
            #1C1C1C 100%          /* Dark base */
          );
          animation: mountain-breathe 15s ease-in-out infinite;
        }
        
        .mountain-peaks {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: 
            /* Mountain layers */
            radial-gradient(ellipse at 20% 100%, rgba(139, 69, 19, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 100%, rgba(160, 82, 45, 0.7) 0%, transparent 60%),
            radial-gradient(ellipse at 60% 100%, rgba(105, 105, 105, 0.6) 0%, transparent 70%),
            radial-gradient(ellipse at 80% 100%, rgba(119, 136, 153, 0.5) 0%, transparent 80%);
          animation: mountain-drift 25s linear infinite;
        }
        
        .mountain-overlay {
          background: 
            /* Mist and clouds */
            radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            /* Subtle light rays */
            linear-gradient(135deg, rgba(255, 223, 186, 0.1) 0%, transparent 30%);
          animation: cloud-float 20s ease-in-out infinite;
        }
        
        @keyframes mountain-breathe {
          0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
          50% { transform: scale(1.02); filter: hue-rotate(5deg); }
        }
        
        @keyframes mountain-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-20px); }
        }
        
        @keyframes cloud-float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.8; }
          33% { transform: translateY(-5px) translateX(10px); opacity: 1; }
          66% { transform: translateY(5px) translateX(-5px); opacity: 0.9; }
        }
        
        .glass-icon {
          backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        .glass-icon:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 
            0 15px 40px 0 rgba(31, 38, 135, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div 
        className="fixed inset-0 overflow-hidden desktop-cursor mountain-wallpaper"
        onContextMenu={handleRightClick}
        onClick={handleClickOutside}
      >
        <div className="absolute inset-0 mountain-peaks"></div>
        <div className="absolute inset-0 mountain-overlay"></div>

        <MenuBar />
        
        {/* Desktop Icons */}
        <div className="absolute top-20 left-6 space-y-6 z-10">
          <div className="flex flex-col items-center space-y-2 group cursor-pointer">
            <div className="w-16 h-16 glass-icon rounded-2xl flex items-center justify-center transition-all duration-300">
              <Folder className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg">Documents</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2 group cursor-pointer">
            <div className="w-16 h-16 glass-icon rounded-2xl flex items-center justify-center transition-all duration-300">
              <Trash2 className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg">Trash</span>
          </div>

          <div 
            className="flex flex-col items-center space-y-2 group cursor-pointer"
            onClick={handleTextEditorClick}
          >
            <div className="w-16 h-16 glass-icon rounded-2xl flex items-center justify-center transition-all duration-300 relative">
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
