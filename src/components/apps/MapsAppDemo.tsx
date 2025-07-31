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
  Download,
  Loader2
} from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

interface SavedPlace {
  id: string;
  name: string;
  location: Location;
  category: 'home' | 'work' | 'favorite' | 'recent';
}

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const MapsAppDemo: React.FC = () => {
  const { isDarkMode } = useOS();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    {
      id: '1',
      name: 'Home',
      location: { lat: 28.6139, lng: 77.2090, name: 'Home', address: 'New Delhi, India' },
      category: 'home'
    },
    {
      id: '2',
      name: 'Office',
      location: { lat: 28.5355, lng: 77.3910, name: 'Office', address: 'Noida, Uttar Pradesh, India' },
      category: 'work'
    }
  ]);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'directions' | 'saved'>('search');
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string, steps: string[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoom, setZoom] = useState(12);

  // Enhanced location database with more Indian cities and landmarks
  const locationDatabase = [
    // Delhi
    { lat: 28.6139, lng: 77.2090, name: 'India Gate', address: 'Rajpath, New Delhi, India', category: 'monument' },
    { lat: 28.6562, lng: 77.2410, name: 'Red Fort', address: 'Netaji Subhash Marg, New Delhi, India', category: 'monument' },
    { lat: 28.6129, lng: 77.2295, name: 'Connaught Place', address: 'Connaught Place, New Delhi, India', category: 'shopping' },
    { lat: 28.5244, lng: 77.1855, name: 'Qutub Minar', address: 'Mehrauli, New Delhi, India', category: 'monument' },
    { lat: 28.6507, lng: 77.2334, name: 'Chandni Chowk', address: 'Chandni Chowk, New Delhi, India', category: 'market' },
    { lat: 28.5562, lng: 77.1000, name: 'IGI Airport', address: 'Indira Gandhi International Airport, New Delhi', category: 'airport' },
    { lat: 28.6448, lng: 77.2167, name: 'Jama Masjid', address: 'Jama Masjid, New Delhi, India', category: 'religious' },
    { lat: 28.6139, lng: 77.2295, name: 'Rajpath', address: 'Rajpath, New Delhi, India', category: 'road' },
    
    // Mumbai
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai', address: 'Mumbai, Maharashtra, India', category: 'city' },
    { lat: 19.0728, lng: 72.8826, name: 'Gateway of India', address: 'Apollo Bandar, Mumbai, India', category: 'monument' },
    { lat: 19.0330, lng: 72.8297, name: 'Marine Drive', address: 'Marine Drive, Mumbai, India', category: 'road' },
    { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji Airport', address: 'Mumbai Airport, India', category: 'airport' },
    
    // Bangalore
    { lat: 12.9716, lng: 77.5946, name: 'Bangalore', address: 'Bangalore, Karnataka, India', category: 'city' },
    { lat: 12.9698, lng: 77.7500, name: 'Kempegowda Airport', address: 'Bangalore Airport, India', category: 'airport' },
    { lat: 12.9716, lng: 77.5946, name: 'Cubbon Park', address: 'Cubbon Park, Bangalore, India', category: 'park' },
    
    // Chennai
    { lat: 13.0827, lng: 80.2707, name: 'Chennai', address: 'Chennai, Tamil Nadu, India', category: 'city' },
    { lat: 12.9941, lng: 80.1709, name: 'Chennai Airport', address: 'Chennai Airport, India', category: 'airport' },
    { lat: 13.0475, lng: 80.2824, name: 'Marina Beach', address: 'Marina Beach, Chennai, India', category: 'beach' },
    
    // Kolkata
    { lat: 22.5726, lng: 88.3639, name: 'Kolkata', address: 'Kolkata, West Bengal, India', category: 'city' },
    { lat: 22.6540, lng: 88.4467, name: 'Kolkata Airport', address: 'Kolkata Airport, India', category: 'airport' },
    { lat: 22.5448, lng: 88.3426, name: 'Victoria Memorial', address: 'Victoria Memorial, Kolkata, India', category: 'monument' },
    
    // Hyderabad
    { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', address: 'Hyderabad, Telangana, India', category: 'city' },
    { lat: 17.2403, lng: 78.4294, name: 'Hyderabad Airport', address: 'Hyderabad Airport, India', category: 'airport' },
    { lat: 17.4126, lng: 78.4092, name: 'Charminar', address: 'Charminar, Hyderabad, India', category: 'monument' },
    
    // Pune
    { lat: 18.5204, lng: 73.8567, name: 'Pune', address: 'Pune, Maharashtra, India', category: 'city' },
    { lat: 18.5822, lng: 73.9197, name: 'Pune Airport', address: 'Pune Airport, India', category: 'airport' },
    
    // Ahmedabad
    { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad', address: 'Ahmedabad, Gujarat, India', category: 'city' },
    { lat: 23.0732, lng: 72.6347, name: 'Ahmedabad Airport', address: 'Ahmedabad Airport, India', category: 'airport' },
    
    // Jaipur
    { lat: 26.9124, lng: 75.7873, name: 'Jaipur', address: 'Jaipur, Rajasthan, India', category: 'city' },
    { lat: 26.8242, lng: 75.8120, name: 'Jaipur Airport', address: 'Jaipur Airport, India', category: 'airport' },
    { lat: 26.9855, lng: 75.8505, name: 'Hawa Mahal', address: 'Hawa Mahal, Jaipur, India', category: 'monument' },
    
    // Goa
    { lat: 15.2993, lng: 74.1240, name: 'Goa', address: 'Goa, India', category: 'state' },
    { lat: 15.3804, lng: 73.8302, name: 'Goa Airport', address: 'Goa Airport, India', category: 'airport' },
    { lat: 15.2832, lng: 74.1240, name: 'Baga Beach', address: 'Baga Beach, Goa, India', category: 'beach' },
    
    // Kochi
    { lat: 9.9312, lng: 76.2673, name: 'Kochi', address: 'Kochi, Kerala, India', category: 'city' },
    { lat: 10.1520, lng: 76.4019, name: 'Kochi Airport', address: 'Kochi Airport, India', category: 'airport' },
    
    // Universities and Tech Parks
    { lat: 28.5449, lng: 77.1928, name: 'IIT Delhi', address: 'IIT Delhi, New Delhi, India', category: 'university' },
    { lat: 19.1334, lng: 72.9133, name: 'IIT Bombay', address: 'IIT Bombay, Mumbai, India', category: 'university' },
    { lat: 12.9915, lng: 77.5644, name: 'Electronic City', address: 'Electronic City, Bangalore, India', category: 'tech_park' },
    { lat: 17.4435, lng: 78.3772, name: 'HITEC City', address: 'HITEC City, Hyderabad, India', category: 'tech_park' }
  ];

  // Initialize Leaflet map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Create map instance
      const map = window.L.map(mapRef.current, {
        center: [28.6139, 77.2090], // Delhi coordinates
        zoom: zoom,
        zoomControl: false // We'll add custom controls
      });

      // Add tile layer based on map type
      const tileLayer = mapType === 'satellite' 
        ? window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          })
        : window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          });

      tileLayer.addTo(map);

      // Add click handler for map
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        console.log('Map clicked at:', lat, lng);
        // You can add functionality to add markers on click
      });

      // Add zoom event handler
      map.on('zoomend', () => {
        setZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Get current location
      getCurrentLocation();
    };

    // Load Leaflet if not already loaded
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Update map type
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer._url) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const tileLayer = mapType === 'satellite' 
      ? window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
      : window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

    tileLayer.addTo(mapInstanceRef.current);
  }, [mapType]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location',
            address: 'Your current location'
          };
          setCurrentLocation(location);
          
          if (mapInstanceRef.current && window.L) {
            // Add current location marker
            const marker = window.L.marker([location.lat, location.lng], {
              icon: window.L.divIcon({
                html: '<div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
            }).addTo(mapInstanceRef.current);
            
            marker.bindPopup('Your Current Location');
            markersRef.current.push(marker);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Delhi
          const fallbackLocation = {
            lat: 28.6139,
            lng: 77.2090,
            name: 'Delhi (Default)',
            address: 'New Delhi, India'
          };
          setCurrentLocation(fallbackLocation);
        }
      );
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Search in local database
    const localResults = locationDatabase.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.address.toLowerCase().includes(query.toLowerCase()) ||
      location.category.toLowerCase().includes(query.toLowerCase())
    );

    // Try to search using Nominatim API for more results
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' India')}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      
      const nominatimResults = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name.split(',')[0],
        address: item.display_name,
        category: 'search_result'
      }));

      // Combine and deduplicate results
      const allResults = [...localResults, ...nominatimResults];
      const uniqueResults = allResults.filter((location, index, self) => 
        index === self.findIndex(l => 
          Math.abs(l.lat - location.lat) < 0.001 && Math.abs(l.lng - location.lng) < 0.001
        )
      );

      setSearchResults(uniqueResults.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(localResults.slice(0, 10));
    }
    
    setIsLoading(false);
  };

  const generateRandomLocation = () => {
    const randomLocation = locationDatabase[Math.floor(Math.random() * locationDatabase.length)];
    return randomLocation;
  };

  const addMarker = (location: Location, color: string = 'blue', popup?: string) => {
    if (!mapInstanceRef.current || !window.L) return;

    const markerColor = color === 'green' ? '#10B981' : color === 'red' ? '#EF4444' : '#3B82F6';
    
    const marker = window.L.marker([location.lat, location.lng], {
      icon: window.L.divIcon({
        html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(mapInstanceRef.current);

    if (popup) {
      marker.bindPopup(popup);
    } else {
      marker.bindPopup(`<strong>${location.name}</strong><br>${location.address}`);
    }

    markersRef.current.push(marker);
    return marker;
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  };

  const panToLocation = (location: Location) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 15);
    }
  };

  const calculateRoute = async () => {
    if (!fromLocation || !toLocation || !mapInstanceRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Use OSRM (Open Source Routing Machine) for routing
      const profile = travelMode === 'driving' ? 'driving' : travelMode === 'walking' ? 'foot' : 'cycling';
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${profile}/${fromLocation.lng},${fromLocation.lat};${toLocation.lng},${toLocation.lat}?overview=full&geometries=geojson&steps=true`
      );
      
      if (!response.ok) throw new Error('Routing failed');
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(1); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes
        
        // Extract turn-by-turn directions
        const steps = route.legs[0].steps.map((step: any) => step.maneuver.instruction);
        
        setRouteInfo({
          distance: `${distance} km`,
          duration: `${duration} min`,
          steps: steps
        });

        // Clear existing route
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        // Add route to map
        const routeCoordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        routeLayerRef.current = window.L.polyline(routeCoordinates, {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.8
        }).addTo(mapInstanceRef.current);

        // Fit map to show entire route
        const bounds = window.L.latLngBounds([
          [fromLocation.lat, fromLocation.lng],
          [toLocation.lat, toLocation.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });

        // Add markers for start and end
        clearMarkers();
        addMarker(fromLocation, 'green', `Start: ${fromLocation.name}`);
        addMarker(toLocation, 'red', `Destination: ${toLocation.name}`);
      }
    } catch (error) {
      console.error('Routing error:', error);
      
      // Fallback calculation
      const distance = calculateDistance(fromLocation, toLocation);
      const speed = travelMode === 'driving' ? 40 : travelMode === 'walking' ? 5 : 15; // km/h
      const duration = Math.round((distance / speed) * 60);
      
      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `${duration} min`,
        steps: ['Route calculation failed. Showing estimated distance and time.']
      });

      // Draw straight line as fallback
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      }
      
      routeLayerRef.current = window.L.polyline([
        [fromLocation.lat, fromLocation.lng],
        [toLocation.lat, toLocation.lng]
      ], {
        color: '#EF4444',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10'
      }).addTo(mapInstanceRef.current);

      clearMarkers();
      addMarker(fromLocation, 'green', `Start: ${fromLocation.name}`);
      addMarker(toLocation, 'red', `Destination: ${toLocation.name}`);
    }
    
    setIsLoading(false);
  };

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const clearRoute = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    clearMarkers();
    setFromLocation(null);
    setToLocation(null);
    setRouteInfo(null);
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

  const selectLocation = (location: Location, type?: 'from' | 'to') => {
    if (type === 'from') {
      setFromLocation(location);
    } else if (type === 'to') {
      setToLocation(location);
    }
    
    // Pan to location and add marker
    panToLocation(location);
    if (type) {
      clearMarkers();
      addMarker(location, type === 'from' ? 'green' : 'red');
    }
    
    setSearchResults([]);
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const goToCurrentLocation = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 15);
    } else {
      getCurrentLocation();
    }
  };

  const generateRandomRoute = () => {
    const randomFrom = generateRandomLocation();
    const randomTo = generateRandomLocation();
    
    setFromLocation(randomFrom);
    setToLocation(randomTo);
    setActiveTab('directions');
    
    // Auto calculate route after a short delay
    setTimeout(() => {
      calculateRoute();
    }, 500);
  };

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`w-80 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <MapIcon className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold">Aczen Maps</h1>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">DEMO</span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            {[
              { id: 'search', label: 'Search', icon: Search },
              { id: 'directions', label: 'Directions', icon: Route },
              { id: 'saved', label: 'Saved', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
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
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => searchPlaces(searchQuery)}
                  disabled={isLoading || !searchQuery.trim()}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={generateRandomRoute}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  title="Generate random route"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>

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
                      onClick={() => selectLocation(location)}
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

              {/* Popular Places */}
              <div className="mt-6">
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Popular Places</h3>
                <div className="space-y-2">
                  {locationDatabase.slice(0, 3).map((location, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                      onClick={() => selectLocation(location)}
                    >
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-gray-500">{location.address}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                {!fromLocation && currentLocation && (
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
                {!toLocation && (
                  <button
                    onClick={() => setToLocation(locationDatabase[1])}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Select destination
                  </button>
                )}
              </div>

              {/* Travel Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Travel Mode</label>
                <div className="flex space-x-2">
                  {[
                    { mode: 'driving', icon: Car, label: 'Drive' },
                    { mode: 'walking', icon: User, label: 'Walk' },
                    { mode: 'bicycling', icon: Bike, label: 'Bike' },
                    { mode: 'transit', icon: Zap, label: 'Transit' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={label}
                      onClick={() => setTravelMode(mode as any)}
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
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={calculateRoute}
                  disabled={!fromLocation || !toLocation || isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Route className="w-4 h-4 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Get Directions'}
                </button>
                <button
                  onClick={clearRoute}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title="Clear route"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Route Info */}
              {routeInfo && (
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Route Information</h3>
                    <button
                      onClick={() => setRouteInfo(null)}
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
                  
                  {/* Turn-by-turn directions */}
                  {routeInfo.steps && routeInfo.steps.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 text-sm">Directions</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {routeInfo.steps.map((step, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-100 dark:bg-gray-600 rounded">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
              
              <div className="space-y-2">
                {savedPlaces.map((place) => (
                  <div
                    key={place.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
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
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Leaflet Map */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          {/* Map Type Toggle */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Toggle map type"
            >
              {mapType === 'roadmap' ? (
                <Satellite className="w-5 h-5" />
              ) : (
                <MapIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Zoom Controls */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button 
              onClick={zoomIn}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg border-b border-gray-200 dark:border-gray-700"
              title="Zoom in"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={zoomOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              title="Zoom out"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Current Location */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button 
              onClick={goToCurrentLocation}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" 
              title="Go to current location"
            >
              <Target className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapsAppDemo;