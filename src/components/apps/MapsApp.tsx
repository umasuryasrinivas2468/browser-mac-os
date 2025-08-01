import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Route, 
  Car, 
  Bike, 
  User, 
  Clock, 
  Zap,
  X,
  Plus,
  Minus,
  Layers,
  Satellite,
  Map as MapIcon,
  Target,
  Settings,
  Star,
  History,
  Share,
  Download
} from 'lucide-react';

// Extend window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
}

interface SavedPlace {
  id: string;
  name: string;
  location: Location;
  category: 'home' | 'work' | 'favorite' | 'recent';
}

const MapsApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>(google.maps.TravelMode?.DRIVING);
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId?.ROADMAP);
  const [isLoading, setIsLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'directions' | 'saved'>('search');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    if (!apiKey) return;

    const initMap = () => {
      if (!mapRef.current) return;

      // Create map with enhanced styling
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // Delhi, India
        zoom: 12,
        mapTypeId: mapType,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: isDarkMode ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ] : undefined,
      });

      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        draggable: true,
        panel: document.getElementById('directions-panel') || undefined,
      });

      directionsRendererInstance.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setIsGoogleMapsLoaded(true);

      // Get current location
      getCurrentLocation();
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Google Maps API failed to load');
        setShowApiKeyInput(true);
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [isDarkMode, mapType, apiKey]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation || !window.google || !map) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Location'
        };
        setCurrentLocation(location);
        if (map) {
          map.setCenter(location);
          new window.google.maps.Marker({
            position: location,
            map: map,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            }
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  const searchPlaces = async (query: string) => {
    if (!map || !query.trim() || !window.google) return;

    setIsLoading(true);
    const service = new window.google.maps.places.PlacesService(map);
    
    const request = {
      query: query,
      fields: ['name', 'geometry', 'formatted_address', 'place_id'],
    };

    service.textSearch(request, (results, status) => {
      setIsLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const locations = results.slice(0, 5).map(place => ({
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          name: place.name || '',
          address: place.formatted_address || ''
        }));
        setSearchResults(locations);
      }
    });
  };

  const calculateRoute = () => {
    if (!directionsService || !directionsRenderer || !fromLocation || !toLocation || !window.google) return;

    setIsLoading(true);
    const request = {
      origin: fromLocation,
      destination: toLocation,
      travelMode: travelMode,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
    };

    directionsService.route(request, (result, status) => {
      setIsLoading(false);
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        const route = result.routes[0];
        const leg = route.legs[0];
        
        setRouteInfo({
          distance: leg.distance?.text || '',
          duration: leg.duration?.text || '',
          steps: leg.steps?.map(step => step.instructions) || []
        });
        setShowDirections(true);
      }
    });
  };

  const addToSavedPlaces = (location: Location, category: SavedPlace['category'] = 'favorite') => {
    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      name: location.name || 'Unnamed Location',
      location,
      category
    };
    setSavedPlaces(prev => [...prev, newPlace]);
  };

  const selectLocation = (location: Location, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromLocation(location);
    } else {
      setToLocation(location);
    }
    
    if (map && window.google) {
      map.setCenter(location);
      new window.google.maps.Marker({
        position: location,
        map: map,
        title: location.name,
        icon: type === 'from' ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });
    }
    setSearchResults([]);
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
    setFromLocation(null);
    setToLocation(null);
    setRouteInfo(null);
    setShowDirections(false);
  };

  // Define travel modes with fallback
  const getTravelModes = () => {
    if (!window.google) {
      return [
        { mode: 'DRIVING' as any, icon: Car, label: 'Drive' },
        { mode: 'WALKING' as any, icon: User, label: 'Walk' },
        { mode: 'BICYCLING' as any, icon: Bike, label: 'Bike' },
        { mode: 'TRANSIT' as any, icon: Zap, label: 'Transit' }
      ];
    }
    
    return [
      { mode: window.google.maps.TravelMode.DRIVING, icon: Car, label: 'Drive' },
      { mode: window.google.maps.TravelMode.WALKING, icon: User, label: 'Walk' },
      { mode: window.google.maps.TravelMode.BICYCLING, icon: Bike, label: 'Bike' },
      { mode: window.google.maps.TravelMode.TRANSIT, icon: Zap, label: 'Transit' }
    ];
  };

  if (showApiKeyInput) {
    return (
      <div className={`flex flex-col h-full items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <MapIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Google Maps API Key Required</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            To use the full-featured maps, please enter your Google Maps API key. You can get one from the Google Cloud Console.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Maps API key"
              className={`w-full px-4 py-3 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <button
              onClick={() => {
                if (apiKey.trim()) {
                  setShowApiKeyInput(false);
                }
              }}
              disabled={!apiKey.trim()}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Load Maps
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            <p>Get your API key at:</p>
            <p className="text-blue-500">console.cloud.google.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Enhanced Sidebar */}
      <div className={`w-80 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex flex-col`}>
        {/* Header with improved styling */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center space-x-2 mb-4">
            <MapIcon className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Aczen Maps</h1>
          </div>
          
          {/* Enhanced Tab Navigation */}
          <div className="flex space-x-1">
            {[
              { id: 'search', label: 'Search', icon: Search },
              { id: 'directions', label: 'Directions', icon: Route },
              { id: 'saved', label: 'Saved', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content with improved styling */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'search' && (
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPlaces(searchQuery)}
                  placeholder="Search for places..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              
              <button
                onClick={() => searchPlaces(searchQuery)}
                disabled={isLoading || !searchQuery.trim() || !isGoogleMapsLoaded}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Results</h3>
                  {searchResults.map((location, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        if (map) {
                          map.setCenter(location);
                          map.setZoom(15);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <p className="text-sm text-gray-500">{location.address}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToSavedPlaces(location);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'directions' && (
            <div className="p-4">
              {/* From Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  <input
                    type="text"
                    value={fromLocation?.name || ''}
                    placeholder="Choose starting point"
                    readOnly
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } cursor-pointer`}
                    onClick={() => currentLocation && setFromLocation(currentLocation)}
                  />
                </div>
                {currentLocation && !fromLocation && (
                  <button
                    onClick={() => setFromLocation(currentLocation)}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Use current location
                  </button>
                )}
              </div>

              {/* To Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={toLocation?.name || ''}
                    placeholder="Choose destination"
                    readOnly
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } cursor-pointer`}
                  />
                </div>
              </div>

              {/* Travel Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Travel Mode</label>
                <div className="flex space-x-2">
                  {getTravelModes().map(({ mode, icon: Icon, label }) => (
                    <button
                      key={label}
                      onClick={() => setTravelMode(mode)}
                      className={`flex flex-col items-center p-2 rounded-lg border ${
                        travelMode === mode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDarkMode
                          ? 'border-gray-600 hover:bg-gray-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Route Button */}
              <button
                onClick={calculateRoute}
                disabled={!fromLocation || !toLocation || isLoading || !isGoogleMapsLoaded}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? 'Calculating...' : 'Get Directions'}
              </button>

              {/* Route Info */}
              {routeInfo && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Route Information</h3>
                    <button
                      onClick={clearRoute}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Route className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{routeInfo.distance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{routeInfo.duration}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Turn-by-turn directions */}
              {showDirections && routeInfo && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Directions</h3>
                  <div id="directions-panel" className="text-sm space-y-2 max-h-60 overflow-y-auto">
                    {routeInfo.steps.map((step, index) => (
                      <div key={index} className="p-2 border-l-2 border-blue-500 pl-3">
                        <div dangerouslySetInnerHTML={{ __html: step }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Saved Places</h3>
                <button className="text-blue-500 hover:text-blue-600">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {savedPlaces.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No saved places yet</p>
                  <p className="text-sm">Save places from search results</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedPlaces.map((place) => (
                    <div
                      key={place.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        if (map) {
                          map.setCenter(place.location);
                          map.setZoom(15);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{place.name}</h4>
                          <p className="text-sm text-gray-500">{place.location.address}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectLocation(place.location, 'from');
                              setActiveTab('directions');
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Set as starting point"
                          >
                            <Navigation className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectLocation(place.location, 'to');
                              setActiveTab('directions');
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Set as destination"
                          >
                            <MapPin className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Container with enhanced controls */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Enhanced Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          {/* Map Type Toggle with improved styling */}
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => {
                if (!window.google || !map) return;
                const newMapType = mapType === window.google.maps.MapTypeId.ROADMAP 
                  ? window.google.maps.MapTypeId.SATELLITE 
                  : window.google.maps.MapTypeId.ROADMAP;
                setMapType(newMapType);
                map.setMapTypeId(newMapType);
              }}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              title="Toggle map type"
              disabled={!isGoogleMapsLoaded}
            >
              {mapType === (window.google?.maps.MapTypeId.ROADMAP) ? (
                <Satellite className="w-5 h-5" />
              ) : (
                <MapIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Enhanced Zoom Controls */}
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => map && map.setZoom(map.getZoom()! + 1)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl border-b border-gray-200 dark:border-gray-700 transition-all"
              disabled={!isGoogleMapsLoaded}
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => map && map.setZoom(map.getZoom()! - 1)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl transition-all"
              disabled={!isGoogleMapsLoaded}
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Enhanced Current Location Button */}
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={getCurrentLocation}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              title="Go to current location"
              disabled={!isGoogleMapsLoaded}
            >
              <Target className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm font-medium">Loading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsApp;
