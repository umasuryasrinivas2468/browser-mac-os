
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Wifi, Battery, Volume2, Search, Camera, Menu, X } from 'lucide-react';
import html2canvas from 'html2canvas';

const MenuBar: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          const reader = new FileReader();
          reader.onload = () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `screenshot-${timestamp}.png`;
            
            // Save to localStorage for file manager
            const existingStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');
            if (!existingStructure.Home?.children?.Pictures) {
              if (!existingStructure.Home) existingStructure.Home = { type: 'folder', children: {} };
              if (!existingStructure.Home.children) existingStructure.Home.children = {};
              if (!existingStructure.Home.children.Pictures) {
                existingStructure.Home.children.Pictures = { type: 'folder', children: {} };
              }
            }
            
            existingStructure.Home.children.Pictures.children[filename] = {
              type: 'file',
              icon: 'Image',
              data: reader.result,
              created: new Date().toISOString()
            };
            
            localStorage.setItem('filemanager_structure', JSON.stringify(existingStructure));
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  return (
    <div className={`top-bar fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-4 transition-all duration-300 rounded-b-xl ${
      isDarkMode 
        ? 'bg-black/60 backdrop-blur-xl border-b border-white/10 text-white' 
        : 'bg-white/60 backdrop-blur-xl border-b border-black/10 text-gray-900'
    }`}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="font-semibold text-sm hidden sm:block">AczenOS</div>
        <button
          className="sm:hidden p-1 rounded-lg hover:bg-black/10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
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
              className={`w-full px-4 py-1 text-sm transition-all rounded-full ${
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
            className={`flex items-center space-x-2 px-4 py-1 transition-all text-sm rounded-full ${
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
          className={`p-2 transition-colors rounded-full ${
            isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'
          }`}
          title="Take Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
        
        <div className="hidden sm:flex items-center space-x-2">
          <button className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'}`}>
            <Wifi className="w-4 h-4" />
          </button>
          <button className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'}`}>
            <Volume2 className="w-4 h-4" />
          </button>
          <button className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'}`}>
            <Battery className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-sm font-medium px-2 py-1 rounded-lg bg-black/10">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`absolute top-full left-0 right-0 p-4 sm:hidden rounded-b-xl ${
          isDarkMode ? 'bg-black/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'
        }`}>
          <div className="flex justify-center space-x-4">
            <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'}`}>
              <Wifi className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'}`}>
              <Volume2 className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-200/50'}`}>
              <Battery className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
