
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import MenuBar from './MenuBar';
import DesktopClock from './DesktopClock';
import Window from './Window';
import Dock from './Dock';
import ContributorCredits from './ContributorCredits';

const Desktop: React.FC = () => {
  const { isDarkMode, windows, currentTime, isDockVisible, setIsDockVisible } = useOS();
  const [showMouseArea, setShowMouseArea] = useState(false);

  const getBackgroundClass = () => {
    const hour = new Date(currentTime).getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'bg-morning';
    } else if (hour >= 12 && hour < 18) {
      return 'bg-afternoon';
    } else {
      return 'bg-evening';
    }
  };

  const backgroundClass = getBackgroundClass();

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
    <div className={`min-h-screen transition-all duration-500 ${backgroundClass}`}>
      <MenuBar 
        onSecurityClick={handleSecurityClick}
        onPopularAppsClick={handlePopularAppsClick}
        onSearchClick={handleSearchClick}
      />
      
      <DesktopClock />
      
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
      
      {/* Mouse area for dock hover */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-4 z-30"
        onMouseEnter={handleMouseEnterBottom}
      />
      
      <Dock />
      <ContributorCredits />
    </div>
  );
};

export default Desktop;
