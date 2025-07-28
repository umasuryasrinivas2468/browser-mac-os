
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Clock, Globe, Timer, Stopwatch } from 'lucide-react';

const ClockApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('local');

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

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Clock
          </h1>
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
  );
};

export default ClockApp;
