
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Clock, Globe, Timer, Maximize2, Minimize2 } from 'lucide-react';

interface ClockAppProps {
  isPopupView?: boolean;
  onTogglePopup?: () => void;
}

const ClockApp: React.FC<ClockAppProps> = ({ 
  isPopupView = false, 
  onTogglePopup 
}) => {
  const { isDarkMode } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('local');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timezones = [
    { value: 'local', label: 'Local Time', offset: 0 },
    { value: 'utc', label: 'UTC', offset: 0 },
    { value: 'ny', label: 'New York', offset: -5 },
    { value: 'london', label: 'London', offset: 0 },
    { value: 'tokyo', label: 'Tokyo', offset: 9 },
    { value: 'sydney', label: 'Sydney', offset: 11 }
  ];

  const getTimeForTimezone = (timezone: string) => {
    const now = new Date();
    const tz = timezones.find(t => t.value === timezone);
    if (!tz || timezone === 'local') return now;
    
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (tz.offset * 3600000));
  };

  const displayTime = getTimeForTimezone(selectedTimezone);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (onTogglePopup) {
      onTogglePopup();
    }
  };

  const PopupClock = () => (
    <div className="fixed top-4 left-4 z-50">
      <div className={`p-4 rounded-xl backdrop-blur-md border shadow-2xl ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Clock
            </span>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className={`p-1 rounded hover:bg-gray-200 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
            }`}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-mono font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {displayTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {displayTime.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showPopup && <PopupClock />}
      
      <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Clock
              </h1>
            </div>
            <button
              onClick={togglePopup}
              className={`p-2 rounded-lg hover:bg-gray-200 ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'
              }`}
              title="Toggle popup view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className={`text-6xl md:text-8xl font-mono font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {displayTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {displayTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="w-full max-w-md">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Timezone
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
    </>
  );
};

export default ClockApp;
