
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Camera } from 'lucide-react';

const WallpaperCredits: React.FC = () => {
  const { isDarkMode } = useOS();

  return (
    <div className={`fixed bottom-4 left-4 px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${
      isDarkMode 
        ? 'bg-black/30 text-white/80 hover:bg-black/40' 
        : 'bg-white/30 text-black/80 hover:bg-white/40'
    }`}>
      <div className="flex items-center space-x-2 text-xs">
        <Camera className="w-3 h-3" />
        <span>Dynamic Wallpaper</span>
      </div>
    </div>
  );
};

export default WallpaperCredits;
