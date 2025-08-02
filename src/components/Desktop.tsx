import React from 'react';
import { useOS } from '@/contexts/OSContext';
import MenuBar from './MenuBar';
import DesktopClock from './DesktopClock';
import Window from './Window';
import Dock from './Dock';
import { useSpring, animated } from 'react-spring';
import ContributorCredits from './ContributorCredits';

const Desktop: React.FC = () => {
  const { isDarkMode, windows, currentTime } = useOS();

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

  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundClass}`}>
      <MenuBar />
      
      <DesktopClock />
      
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
      
      <Dock />
      <ContributorCredits />
    </div>
  );
};

export default Desktop;
