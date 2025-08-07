
import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Search, MapPin, Navigation, Layers, Plus, Minus, RotateCcw, Target } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

const MapsApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Initialize the map
    mapInstance.current = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center

    // Add OpenStreetMap tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Create markers layer
    markersLayer.current = window.L.layerGroup().addTo(mapInstance.current);

    // Add zoom controls
    window.L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance.current);
  };

  const loadLeafletLibrary = () => {
    if (window.L) {
      initializeMap();
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Using Nominatim (OpenStreetMap's search service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPlaces(searchQuery);
  };

  const handleResultClick = (result: any) => {
    if (!mapInstance.current || !window.L) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Clear previous markers
    markersLayer.current.clearLayers();

    // Add marker and center map
    const marker = window.L.marker([lat, lng]).addTo(markersLayer.current);
    marker.bindPopup(`
      <div>
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${result.display_name}</h3>
        <p style="margin: 0; font-size: 12px; color: #666;">
          ${result.type ? `Type: ${result.type}` : ''}
        </p>
      </div>
    `).openPopup();

    // Center map on the location
    mapInstance.current.setView([lat, lng], 15);

    // Hide search results
    setShowResults(false);
    setSearchQuery(result.display_name);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (mapInstance.current && window.L) {
            // Clear previous markers
            markersLayer.current.clearLayers();

            // Add marker for current location
            const marker = window.L.marker([lat, lng]).addTo(markersLayer.current);
            marker.bindPopup('Your Current Location').openPopup();

            // Center map on current location
            mapInstance.current.setView([lat, lng], 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const zoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([20.5937, 78.9629], 5);
      markersLayer.current.clearLayers();
    }
  };

  useEffect(() => {
    loadLeafletLibrary();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Auto-search as user types
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        searchPlaces(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  return (
    <div className="relative h-full bg-gray-100 overflow-hidden">
      {/* Search Bar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10">
        <div className={`relative ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <form onSubmit={handleSearch} className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg shadow-lg backdrop-blur-sm ${
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
            />
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg backdrop-blur-sm border max-h-60 overflow-y-auto ${
              isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            }`}>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-opacity-50 ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium truncate">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className={`text-xs truncate ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {result.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 sm:top-24 right-2 sm:right-4 z-10 flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className={`flex flex-col rounded-lg shadow-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
        } border overflow-hidden`}>
          <button
            onClick={zoomIn}
            className={`p-2 sm:p-3 border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
            title="Zoom In"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={zoomOut}
            className={isDarkMode ? 'p-2 sm:p-3 hover:bg-gray-700' : 'p-2 sm:p-3 hover:bg-gray-50'}
            title="Zoom Out"
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

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading State */}
      {!mapInstance.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
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
