
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  window: any;
}

const Window: React.FC<WindowProps> = ({ window }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize, isDarkMode } = useOS();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('window-header')) {
      if (!window.isMaximized) {
        setIsDragging(true);
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }
      }
      focusWindow(window.id);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !window.isMaximized) {
      const newX = e.clientX - dragOffset.x;
      const newY = Math.max(32, e.clientY - dragOffset.y);
      updateWindowPosition(window.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (window.isMinimized) {
    return null;
  }

  const Component = window.component;

  return (
    <div
      ref={windowRef}
      className={`fixed animate-window-open shadow-2xl overflow-hidden ${
        window.isMaximized ? 'rounded-none' : 'rounded-xl'
      } ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}
      style={{
        left: window.isMaximized ? 0 : window.position.x,
        top: window.isMaximized ? 32 : window.position.y,
        width: window.isMaximized ? '100vw' : window.size.width,
        height: window.isMaximized ? 'calc(100vh - 32px)' : window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={() => focusWindow(window.id)}
    >
      {/* Window Header - Always visible with higher z-index */}
      <div
        className={`window-header h-8 flex items-center justify-between px-4 relative z-[9999] ${
          window.isMaximized ? 'cursor-default' : 'cursor-move'
        } ${
          isDarkMode 
            ? 'bg-gray-700 border-b border-gray-600' 
            : 'bg-gray-50 border-b border-gray-200'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {window.title}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => minimizeWindow(window.id)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 z-[9999] ${
              isDarkMode 
                ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }`}
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => maximizeWindow(window.id)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 z-[9999] ${
              isDarkMode 
                ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }`}
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => closeWindow(window.id)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 z-[9999] ${
              isDarkMode 
                ? 'hover:bg-red-600 text-gray-400 hover:text-white' 
                : 'hover:bg-red-500 text-gray-600 hover:text-white'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 32px)' }}>
        <Component />
      </div>
    </div>
  );
};

export default Window;
