
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';

const DesktopClock: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-20 left-8 z-5 pointer-events-none select-none">
      <div className={`backdrop-blur-md rounded-2xl p-6 border shadow-2xl ${
        isDarkMode 
          ? 'bg-black/30 border-white/10' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="text-center">
          <div className={`text-6xl font-light tracking-tight leading-none mb-2 ${
            isDarkMode ? 'text-white' : 'text-white'
          }`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
          
          <div className={`text-lg ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopClock;
