
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Lock, User } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { currentTime } = useOS();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };
    
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    onUnlock();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://i.ibb.co/bgQ3WMYv/image.png')`
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      <div className="relative z-10 text-center text-white">
        <div className="mb-8">
          <div className="text-6xl md:text-8xl font-thin mb-2">
            {currentTime}
          </div>
          <div className="text-xl md:text-2xl font-light">
            {currentDate}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <p className="text-lg font-medium mb-2">Welcome to Aczen OS</p>
            <p className="text-sm text-white/80">Click to unlock</p>
          </div>

          <button
            onClick={handleUnlock}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-200"
          >
            <Lock className="w-5 h-5" />
            <span>Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
