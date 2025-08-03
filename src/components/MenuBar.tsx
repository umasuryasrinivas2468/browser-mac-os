
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Wifi, Battery, Volume2, Search, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

const MenuBar: React.FC = () => {
  const { isDarkMode, isMenuBarVisible, wallpaper } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const takeScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        useCORS: true
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `screenshot-${timestamp}.png`;
          
          // Save to Pictures folder in file manager
          const existingStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');
          if (existingStructure.Home?.children?.Pictures) {
            existingStructure.Home.children.Pictures.children[fileName] = {
              type: 'file',
              icon: 'Image',
              data: blob,
              created: new Date().toISOString()
            };
            localStorage.setItem('filemanager_structure', JSON.stringify(existingStructure));
          }

          // Also trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  if (!isMenuBarVisible) return null;

  return (
    <div className={`top-bar fixed top-0 left-0 right-0 z-40 h-8 flex items-center justify-between px-4 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-black/60 backdrop-blur-xl border-b border-white/10 text-white' 
        : 'bg-white/60 backdrop-blur-xl border-b border-black/10 text-gray-900'
    }`}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="font-semibold text-sm hidden sm:block">AczenOS</div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 flex justify-center max-w-md mx-4">
        {showSearch ? (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                setTimeout(() => setShowSearch(false), 100);
              }}
              className={`search-bar w-full px-4 py-1 text-sm transition-all ${
                isDarkMode 
                  ? 'bg-gray-800/80 border border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white/80 border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className={`search-bar flex items-center space-x-2 px-4 py-1 transition-all text-sm ${
              isDarkMode 
                ? 'bg-gray-800/50 hover:bg-gray-800/80 border border-gray-600' 
                : 'bg-white/50 hover:bg-white/80 border border-gray-300'
            }`}
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search</span>
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={takeScreenshot}
          className={`p-1 transition-colors ${
            isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'
          }`}
          title="Take Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
        
        <div className="hidden sm:flex items-center space-x-2">
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </div>
        
        <div className="text-sm font-medium">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
