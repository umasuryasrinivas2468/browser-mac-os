import React from 'react';
import { useOS } from '@/contexts/OSContext';

const DesktopIndicator: React.FC = () => {
  const { currentDesktop, availableDesktops, setCurrentDesktop, isDarkMode } = useOS();

  if (availableDesktops.length <= 1) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
      <div className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-black/40 backdrop-blur-xl border border-white/10' 
          : 'bg-white/40 backdrop-blur-xl border border-black/10'
      }`}>
        {availableDesktops.map((desktopId) => (
          <button
            key={desktopId}
            onClick={() => setCurrentDesktop(desktopId)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              currentDesktop === desktopId
                ? 'bg-blue-500 scale-125'
                : isDarkMode
                ? 'bg-gray-400 hover:bg-gray-300'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={`Desktop ${desktopId}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopIndicator;