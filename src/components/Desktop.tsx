
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

  // Screenshot function
  const takeScreenshot = async () => {
    try {
      // Use html2canvas to capture the screen
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(document.body);
      
      // Convert to blob and save
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `screenshot-${timestamp}.png`;
          
          // Save to localStorage (simulating Pictures folder)
          const reader = new FileReader();
          reader.onload = () => {
            const existingPictures = JSON.parse(localStorage.getItem('filemanager_pictures') || '{}');
            existingPictures[filename] = {
              type: 'file',
              icon: 'Image',
              data: reader.result,
              created: new Date().toISOString()
            };
            localStorage.setItem('filemanager_pictures', JSON.stringify(existingPictures));
          };
          reader.readAsDataURL(blob);
        }
      });
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative transition-all duration-500"
      style={{
        backgroundImage: `url(${currentWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <MenuBar 
        onSecurityClick={handleSecurityClick}
        onPopularAppsClick={handlePopularAppsClick}
        onSearchClick={handleSearchClick}
        onCameraClick={takeScreenshot}
      />
      
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
