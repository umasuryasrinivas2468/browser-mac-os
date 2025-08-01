import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Cloud, Sun, CloudRain, Calendar, ExternalLink, CloudSnow, Wind, Eye } from 'lucide-react';

const DesktopClock: React.FC = () => {
  const { isDarkMode, windows } = useOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: '28°C',
    condition: 'Sunny',
    icon: Sun,
    humidity: '65%',
    windSpeed: '12 km/h',
    visibility: '10 km'
  });
  const [todaysEvents, setTodaysEvents] = useState<Array<{
    id: string;
    title: string;
    time: string;
    date: Date;
  }>>([]);
  const [latestNews, setLatestNews] = useState({
    headline: 'India Successfully Launches New Space Mission to Mars',
    summary: 'ISRO achieves another milestone with the successful launch of Mars exploration mission...',
    date: new Date().toLocaleDateString()
  });
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch real weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        
        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              try {
                // Using OpenWeatherMap API (you'll need to replace YOUR_API_KEY with actual key)
                const response = await fetch(
                  `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=YOUR_API_KEY&units=metric`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  
                  let weatherIcon = Sun;
                  const weatherMain = data.weather[0].main.toLowerCase();
                  
                  if (weatherMain.includes('rain')) weatherIcon = CloudRain;
                  else if (weatherMain.includes('cloud')) weatherIcon = Cloud;
                  else if (weatherMain.includes('snow')) weatherIcon = CloudSnow;
                  else if (weatherMain.includes('wind')) weatherIcon = Wind;
                  
                  setWeather({
                    temp: `${Math.round(data.main.temp)}°C`,
                    condition: data.weather[0].main,
                    icon: weatherIcon,
                    humidity: `${data.main.humidity}%`,
                    windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
                    visibility: `${(data.visibility / 1000).toFixed(1)} km`
                  });
                } else {
                  // Fallback weather data
                  console.log('Weather API failed, using fallback data');
                }
              } catch (error) {
                console.log('Error fetching weather:', error);
              }
              
              setWeatherLoading(false);
            },
            (error) => {
              console.log('Geolocation error:', error);
              setWeatherLoading(false);
            }
          );
        } else {
          setWeatherLoading(false);
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
    
    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  // Get real calendar events from localStorage or other storage
  useEffect(() => {
    const loadTodaysEvents = () => {
      try {
        // Get calendar events from localStorage (assuming CalendarApp saves events there)
        const savedEvents = localStorage.getItem('calendar-events');
        if (savedEvents) {
          const allEvents = JSON.parse(savedEvents);
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          // Filter events for today
          const todayEvents = allEvents.filter((event: any) => {
            const eventDate = new Date(event.date).toISOString().split('T')[0];
            return eventDate === todayStr;
          }).slice(0, 3); // Show only first 3 events
          
          setTodaysEvents(todayEvents);
        }
      } catch (error) {
        console.error('Error loading calendar events:', error);
        setTodaysEvents([]);
      }
    };

    loadTodaysEvents();
    
    // Listen for calendar updates
    const handleStorageChange = () => {
      loadTodaysEvents();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('calendar-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('calendar-updated', handleStorageChange);
    };
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
        {/* Clock Widget - 5CM x 2CM */}
        <div className={`backdrop-blur-md rounded-2xl p-4 border shadow-2xl ${
          isDarkMode 
            ? 'bg-black/30 border-white/10' 
            : 'bg-white/20 border-white/30'
        }`} style={{ width: '5cm', height: '2cm' }}>
          <div className="flex items-center justify-between h-full">
            <div className={`text-2xl font-light tracking-tight ${
              isDarkMode ? 'text-white' : 'text-white'
            }`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
            
            <div className={`text-sm text-right ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Weather Widget - 5CM x 2CM */}
        <div className={`backdrop-blur-md rounded-2xl p-3 border shadow-2xl ${
          isDarkMode 
            ? 'bg-black/30 border-white/10' 
            : 'bg-white/20 border-white/30'
        }`} style={{ width: '5cm', height: '2cm' }}>
          {weatherLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-3">
                <WeatherIcon className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-white'}`} />
                <div>
                  <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {weather.temp}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
                    {weather.condition}
                  </div>
                </div>
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{weather.visibility}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Events Widget - 5CM x 3CM */}
        <div className={`backdrop-blur-md rounded-2xl p-3 border shadow-2xl ${
          isDarkMode 
            ? 'bg-black/30 border-white/10' 
            : 'bg-white/20 border-white/30'
        }`} style={{ width: '5cm', height: '3cm' }}>
          <div className="flex items-center mb-2">
            <Calendar className={`w-3 h-3 mr-2 ${isDarkMode ? 'text-white' : 'text-white'}`} />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>Today's Events</span>
          </div>
          
          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(3cm - 30px)' }}>
            {todaysEvents.length === 0 ? (
              <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-white/70'}`}>
                No events today
              </div>
            ) : (
              todaysEvents.map((event) => (
                <div key={event.id} className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate flex-1">{event.title}</span>
                    <span className="text-xs ml-2">{event.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* News Widget - 5CM x 3CM */}
        <div 
          className={`backdrop-blur-md rounded-2xl p-3 border shadow-2xl cursor-pointer pointer-events-auto hover:bg-opacity-40 transition-all ${
            isDarkMode 
              ? 'bg-black/30 border-white/10 hover:bg-black/40' 
              : 'bg-white/20 border-white/30 hover:bg-white/30'
          }`} 
          style={{ width: '5cm', height: '3cm' }}
          onClick={handleNewsClick}
        >
          <div className="flex items-center mb-2">
            <ExternalLink className={`w-3 h-3 mr-2 ${isDarkMode ? 'text-white' : 'text-white'}`} />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>Latest News</span>
          </div>
          
          <div className={`text-xs leading-tight ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>
            <div className="font-medium mb-1" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
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
