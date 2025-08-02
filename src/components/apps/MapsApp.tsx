
import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Search, MapPin, Navigation, Layers, Plus, Minus, RotateCcw, Target } from 'lucide-react';

const MapsApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !apiKey) return;

    const mapOptions: google.maps.MapOptions = {
      center: currentLocation || { lat: 37.7749, lng: -122.4194 }, // San Francisco default
      zoom: 12,
      mapTypeId: mapType,
      styles: isDarkMode ? [
        {
          elementType: 'geometry',
          stylers: [{ color: '#242f3e' }]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242f3e' }]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        }
      ] : undefined,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      zoomControl: false,
      gestureHandling: 'greedy'
    };

    googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);
  };

  const loadGoogleMapsAPI = () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      loadGoogleMapsAPI();
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !googleMapRef.current || !window.google) return;

    const service = new google.maps.places.PlacesService(googleMapRef.current);
    const request = {
      query: searchQuery,
      fields: ['name', 'geometry', 'formatted_address']
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        if (place.geometry?.location) {
          googleMapRef.current?.setCenter(place.geometry.location);
          googleMapRef.current?.setZoom(15);
          
          new google.maps.Marker({
            position: place.geometry.location,
            map: googleMapRef.current,
            title: place.name
          });
        }
      }
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(location);
            googleMapRef.current.setZoom(15);
            
            new google.maps.Marker({
              position: location,
              map: googleMapRef.current,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007bff" width="24" height="24"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'
              }
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const changeMapType = (newType: typeof mapType) => {
    setMapType(newType);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(newType);
    }
  };

  const zoomIn = () => {
    if (googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom() || 10;
      googleMapRef.current.setZoom(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    if (googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom() || 10;
      googleMapRef.current.setZoom(currentZoom - 1);
    }
  };

  const resetView = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(currentLocation || { lat: 37.7749, lng: -122.4194 });
      googleMapRef.current.setZoom(12);
    }
  };

  useEffect(() => {
    if (!showApiKeyInput && apiKey) {
      loadGoogleMapsAPI();
    }
  }, [showApiKeyInput, apiKey, mapType, isDarkMode]);

  if (showApiKeyInput) {
    return (
      <div className={`flex items-center justify-center h-full p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-6 sm:p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="text-center mb-6">
            <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Google Maps Setup</h2>
            <p className="text-sm sm:text-base text-gray-500">Enter your Google Maps API key to get started</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Maps API key"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
              />
            </div>
            
            <button
              onClick={handleApiKeySubmit}
              disabled={!apiKey.trim()}
              className="w-full py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Initialize Maps
            </button>
          </div>
          
          <div className="mt-6 p-3 sm:p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Need an API key?</strong><br />
              Go to Google Cloud Console → APIs & Services → Credentials → Create API Key
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-100 overflow-hidden">
      {/* Search Bar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10">
        <div className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg shadow-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
        } border`}>
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for places..."
            className={`flex-1 bg-transparent text-sm sm:text-base outline-none ${
              isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-4 z-10 flex flex-col space-y-2">
        {/* Map Type Selector */}
        <div className={`p-2 rounded-lg shadow-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
        } border`}>
          <button
            onClick={() => setMapType('roadmap')}
            className={`w-full p-1.5 sm:p-2 text-xs sm:text-sm rounded ${
              mapType === 'roadmap' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Layers className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className={`flex flex-col rounded-lg shadow-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
        } border overflow-hidden`}>
          <button
            onClick={zoomIn}
            className={`p-2 sm:p-3 border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={zoomOut}
            className={isDarkMode ? 'p-2 sm:p-3 hover:bg-gray-700' : 'p-2 sm:p-3 hover:bg-gray-50'}
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Additional Controls */}
        <div className={`flex flex-col space-y-2 p-2 rounded-lg shadow-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
        } border`}>
          <button
            onClick={getCurrentLocation}
            className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Get Current Location"
          >
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={resetView}
            className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Map Type Buttons (Bottom) */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
        <div className={`flex space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg shadow-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
        } border`}>
          {[
            { key: 'roadmap', label: 'Map' },
            { key: 'satellite', label: 'Satellite' },
            { key: 'hybrid', label: 'Hybrid' },
            { key: 'terrain', label: 'Terrain' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => changeMapType(key as typeof mapType)}
              className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded transition-colors ${
                mapType === key
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading State */}
      {!googleMapRef.current && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading Maps...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapsApp;
