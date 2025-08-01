
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Cloud, Sun, CloudRain, Calendar, ExternalLink } from 'lucide-react';

const DesktopClock: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: '28°C',
    condition: 'Sunny',
    icon: Sun
  });
  const [todaysEvents, setTodaysEvents] = useState([
    { id: '1', title: 'Team Meeting', time: '10:00' },
    { id: '2', title: 'Lunch with Sarah', time: '12:30' }
  ]);
  const [latestNews, setLatestNews] = useState({
    headline: 'India Successfully Launches New Space Mission to Mars',
    summary: 'ISRO achieves another milestone with the successful launch of Mars exploration mission...',
    date: new Date().toLocaleDateString()
  });
  const [showNewsDetail, setShowNewsDetail] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const WeatherIcon = weather.icon;

  const handleNewsClick = () => {
    setShowNewsDetail(true);
  };

  const NewsDetailModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full backdrop-blur-md rounded-2xl p-6 border shadow-2xl ${
        isDarkMode 
          ? 'bg-black/30 border-white/10' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Latest News
          </h2>
          <button
            onClick={() => setShowNewsDetail(false)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/20'}`}
          >
            <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-white'}`}>×</span>
          </button>
        </div>
        
        <div className={`${isDarkMode ? 'text-white' : 'text-white'}`}>
          <h3 className="text-lg font-medium mb-3">{latestNews.headline}</h3>
          <p className={`mb-4 leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
            ISRO achieves another milestone with the successful launch of Mars exploration mission. The spacecraft will travel for 7 months to reach Mars orbit and conduct extensive research on the Martian atmosphere and surface conditions. This mission represents India's continued advancement in space technology and exploration capabilities.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-white/70'}`}>
            Published: {latestNews.date}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed top-20 left-8 z-5 pointer-events-none select-none space-y-4">
        {/* Clock Widget - 4CM */}
        <div className={`backdrop-blur-md rounded-2xl p-6 border shadow-2xl ${
          isDarkMode 
            ? 'bg-black/30 border-white/10' 
            : 'bg-white/20 border-white/30'
        }`} style={{ width: '4cm', minHeight: '4cm' }}>
          <div className="text-center">
            <div className={`text-3xl font-light tracking-tight leading-none mb-2 ${
              isDarkMode ? 'text-white' : 'text-white'
            }`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
            
            <div className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Weather Widget - 4CM */}
        <div className={`backdrop-blur-md rounded-2xl p-6 border shadow-2xl ${
          isDarkMode 
            ? 'bg-black/30 border-white/10' 
            : 'bg-white/20 border-white/30'
        }`} style={{ width: '4cm', minHeight: '4cm' }}>
          <div className="text-center">
            <WeatherIcon className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-white' : 'text-white'}`} />
            <div className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-white'}`}>
              {weather.temp}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
              {weather.condition}
            </div>
          </div>
        </div>

        {/* Events Widget - 4CM */}
        <div className={`backdrop-blur-md rounded-2xl p-4 border shadow-2xl ${
          isDarkMode 
            ? 'bg-black/30 border-white/10' 
            : 'bg-white/20 border-white/30'
        }`} style={{ width: '4cm', minHeight: '4cm' }}>
          <div className="flex items-center mb-3">
            <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-white' : 'text-white'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>Today</span>
          </div>
          
          <div className="space-y-2">
            {todaysEvents.slice(0, 2).map((event) => (
              <div key={event.id} className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
                <div className="font-medium truncate">{event.time}</div>
                <div className="truncate">{event.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* News Widget - 4CM */}
        <div 
          className={`backdrop-blur-md rounded-2xl p-4 border shadow-2xl cursor-pointer pointer-events-auto hover:bg-opacity-40 transition-all ${
            isDarkMode 
              ? 'bg-black/30 border-white/10 hover:bg-black/40' 
              : 'bg-white/20 border-white/30 hover:bg-white/30'
          }`} 
          style={{ width: '4cm', minHeight: '4cm' }}
          onClick={handleNewsClick}
        >
          <div className="flex items-center mb-2">
            <ExternalLink className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-white' : 'text-white'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>News</span>
          </div>
          
          <div className={`text-xs leading-tight ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
            <div className="font-medium mb-1 line-clamp-3">
              {latestNews.headline}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-white/70'}`}>
              Click for details
            </div>
          </div>
        </div>
      </div>

      {showNewsDetail && <NewsDetailModal />}
    </>
  );
};

export default DesktopClock;
