
import React, { useState } from 'react';
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
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  
  // Use the fixed dynamic wallpaper hook
  const { timeOfDay, backgroundClass, currentWallpaper } = useDynamicWallpaper();

  const handleSecurityClick = () => {
    console.log('Security clicked');
  };

  const handlePopularAppsClick = () => {
    setShowAppLauncher(true);
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
    <div className="min-h-screen w-full relative">
      {/* Copy Protection */}
      <CopyProtection />
      
      <MenuBar 
        onSecurityClick={handleSecurityClick}
        onPopularAppsClick={handlePopularAppsClick}
        onSearchClick={handleSearchClick}
      />
      
      <DesktopClock />
      
      {/* Wallpaper Credits */}
      <WallpaperCredits />
      
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
      
      {/* Mouse area for dock hover */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-4 z-30"
        onMouseEnter={handleMouseEnterBottom}
      />
      
      {/* Bottom Icons - AI Search */}
      <DesktopSearchBar />
      
      {/* App Launcher Modal */}
      {showAppLauncher && (
        <AppLauncher onClose={() => setShowAppLauncher(false)} />
      )}
      
      <Dock />
    </div>
  );
};

export default Desktop;
