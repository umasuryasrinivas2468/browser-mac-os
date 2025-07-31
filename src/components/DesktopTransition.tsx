import React, { useEffect, useState } from 'react';
import { useOS } from '@/contexts/OSContext';

interface DesktopTransitionProps {
  children: React.ReactNode;
}

const DesktopTransition: React.FC<DesktopTransitionProps> = ({ children }) => {
  const { currentDesktop } = useOS();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayDesktop, setDisplayDesktop] = useState(currentDesktop);

  useEffect(() => {
    if (currentDesktop !== displayDesktop) {
      setIsTransitioning(true);
      
      // After transition starts, update the displayed desktop
      const timer = setTimeout(() => {
        setDisplayDesktop(currentDesktop);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [currentDesktop, displayDesktop]);

  return (
    <div className={`transition-all duration-300 ${
      isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      {children}
    </div>
  );
};

export default DesktopTransition;