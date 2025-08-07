import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { useDynamicWallpaper } from '@/hooks/use-dynamic-wallpaper';
import MenuBar from './MenuBar';
import DesktopClock from './DesktopClock';
import Window from './Window';
import Dock from './Dock';
import WallpaperCredits from './WallpaperCredits';
import AppLauncher from './AppLauncher';
import DesktopSearchBar from './DesktopSearchBar';
import CopyProtection from './CopyProtection';

const Desktop: React.FC = () => {
  const { isDarkMode, windows, currentTime, isDockVisible, setIsDockVisible } = useOS();
  const [showMouseArea, setShowMouseArea] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Update current date every minute to trigger wallpaper changes
  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(new Date());
    };
    
    updateDate(); // Initial update
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);
  
  // Use the dynamic wallpaper hook
  const { timeOfDay, backgroundClass, currentWallpaper } = useDynamicWallpaper(currentDate);

  const handleSecurityClick = () => {
    console.log('Security clicked');
  };

  const handlePopularAppsClick = () => {
    console.log('Popular apps clicked');
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
  };

  const handleMouseEnterBottom = () => {
    if (!isDockVisible) {
      setIsDockVisible(true);
    }
  };

  return (
    <div className={`min-h-screen w-full relative transition-all duration-500 ${backgroundClass}`}>
      {/* Copy Protection */}
      <CopyProtection />
      
      <MenuBar 
        onSecurityClick={handleSecurityClick}
        onPopularAppsClick={handlePopularAppsClick}
        onSearchClick={handleSearchClick}
      />
      
      <DesktopClock />
      
      {/* Wallpaper Credits - positioned at bottom left corner */}
      <WallpaperCredits />
      
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
      
      {/* Mouse area for dock hover */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-4 z-30"
        onMouseEnter={handleMouseEnterBottom}
      />
      
      {/* App Launcher - always available but changes position */}
      <AppLauncher isVisible={true} />
      
      {/* AI Search */}
      <DesktopSearchBar />
      
      <Dock />
    </div>
  );
};

export default Desktop;
