
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { useDynamicWallpaper } from '@/hooks/use-dynamic-wallpaper';
import MenuBar from './MenuBar';
import DesktopClock from './DesktopClock';
import Window from './Window';
import Dock from './Dock';
import ContributorCredits from './ContributorCredits';
import AppLauncher from './AppLauncher';
import DesktopSearchBar from './DesktopSearchBar';

const Desktop: React.FC = () => {
  const { isDarkMode, windows, currentTime, isDockVisible, setIsDockVisible } = useOS();
  const [showMouseArea, setShowMouseArea] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Update current date every minute to trigger wallpaper changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  
  // Use the dynamic wallpaper hook with current date
  const { timeOfDay, backgroundClass, currentWallpaper } = useDynamicWallpaper(currentDate);

  const handleMouseEnterBottom = () => {
    if (!isDockVisible) {
      setIsDockVisible(true);
    }
  };

  // Force re-render every minute to ensure wallpaper changes
  useEffect(() => {
    const forceUpdate = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    return () => clearInterval(forceUpdate);
  }, []);

  return (
    <div 
      className={`min-h-screen w-full relative transition-all duration-1000 wallpaper-background rounded-3xl overflow-hidden`}
      style={{
        backgroundImage: `url(${currentWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
      key={currentWallpaper} // Force re-render when wallpaper changes
    >
      <MenuBar />
      
      <DesktopClock />
      
      <ContributorCredits />
      
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
      
      {/* Mouse area for dock hover */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-4 z-30"
        onMouseEnter={handleMouseEnterBottom}
      />
      
      {/* Bottom Icons - App Launcher and AI Search */}
      <AppLauncher />
      <DesktopSearchBar />
      
      <Dock />
    </div>
  );
};

export default Desktop;
