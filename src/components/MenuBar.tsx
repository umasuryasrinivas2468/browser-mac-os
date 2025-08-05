
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Shield, Dock as DockIcon, Grid3X3, Power, Volume2, Sun, Wifi, Bluetooth, Search, Plus, X, Camera } from 'lucide-react';

interface MenuBarProps {
  onSecurityClick: () => void;
  onPopularAppsClick: () => void;
  onSearchClick: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onSecurityClick,
  onPopularAppsClick,
  onSearchClick
}) => {
  const {
    currentTime,
    isDarkMode,
    isDockVisible,
    setIsDockVisible,
    currentDesktop,
    setCurrentDesktop,
    availableDesktops,
    createNewDesktop,
    deleteDesktop
  } = useOS();
  const [showPowerMenu, setShowPowerMenu] = useState(false);

  const handleCreateDesktop = () => {
    const newDesktopId = createNewDesktop();
    setCurrentDesktop(newDesktopId);
  };

  const handleDeleteDesktop = (desktopId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (availableDesktops.length > 1) {
      deleteDesktop(desktopId);
    }
  };

  const captureScreen = async () => {
    try {
      // Use modern screen capture API
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ 
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          
          // Convert to blob and save
          canvas.toBlob((blob) => {
            if (blob) {
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const fileName = `screenshot-${timestamp}.png`;
              
              // Save to localStorage for FileManager
              const reader = new FileReader();
              reader.onload = () => {
                const imageData = reader.result as string;
                
                // Get existing pictures or create new array
                const existingPictures = JSON.parse(localStorage.getItem('fileManager_pictures') || '[]');
                
                const newFile = {
                  id: Date.now().toString(),
                  name: fileName,
                  type: 'image',
                  size: blob.size,
                  createdAt: new Date().toISOString(),
                  content: imageData
                };
                
                existingPictures.push(newFile);
                localStorage.setItem('fileManager_pictures', JSON.stringify(existingPictures));
                
                console.log(`Screenshot saved as ${fileName}`);
                
                // Show success notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-10 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                notification.textContent = `Screenshot saved to Pictures`;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                  document.body.removeChild(notification);
                }, 3000);
              };
              reader.readAsDataURL(blob);
            }
          }, 'image/png');
        }
        
        // Stop the stream
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      });
      
    } catch (error) {
      console.error('Failed to capture screen:', error);
      
      // Fallback notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-10 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Screen capture failed. Please allow screen sharing.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-8 z-40 flex items-center justify-between px-4 text-sm bg-black text-white rounded-b-lg">
      {/* Left side - Power and Aczen OS menu */}
      <div className="flex items-center space-x-4">
        {/* Power Button */}
        <div className="relative">
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
            title="Power Menu"
          >
            <Power className="w-3 h-3 text-red-400" />
          </button>
          
          {/* Power Menu */}
          {showPowerMenu && (
            <div className="absolute top-6 left-0 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[120px] z-50">
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  // Add shutdown logic here
                }}
                className="w-full px-3 py-1 text-left hover:bg-gray-700 text-white text-xs"
              >
                Shutdown
              </button>
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  window.location.reload();
                }}
                className="w-full px-3 py-1 text-left hover:bg-gray-700 text-white text-xs"
              >
                Restart
              </button>
            </div>
          )}
        </div>

        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
        <span className="font-semibold">Aczen OS</span>
      </div>

      {/* Center - Dock Toggle */}
      <div className="flex items-center">
        
      </div>

      {/* Right side - Desktop Navigation, System controls and time */}
      <div className="flex items-center space-x-1">
        {/* Desktop Switcher */}
        <div className="flex items-center space-x-1 mr-2">
          {availableDesktops.map(desktopId => (
            <div key={desktopId} className="relative group">
              <button
                onClick={() => setCurrentDesktop(desktopId)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  currentDesktop === desktopId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title={`Desktop ${desktopId}`}
              >
                {desktopId}
              </button>
              {availableDesktops.length > 1 && (
                <button
                  onClick={(e) => handleDeleteDesktop(desktopId, e)}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Desktop"
                >
                  <X className="w-2 h-2 text-white" />
                </button>
              )}
            </div>
          ))}
          
          {/* Add Desktop Button */}
          <button
            onClick={handleCreateDesktop}
            className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
            title="Create New Desktop"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Dock Toggle */}
        <button
          onClick={() => setIsDockVisible(!isDockVisible)}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors mr-1"
          title={isDockVisible ? "Hide Dock" : "Show Dock"}
        >
          <DockIcon className="w-3 h-3 text-blue-400" />
        </button>

        {/* System Controls */}
        <button className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors" title="Volume">
          <Volume2 className="w-3 h-3 text-white" />
        </button>

        <button className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors" title="Brightness">
          <Sun className="w-3 h-3 text-white" />
        </button>

        <button className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors" title="WiFi">
          <Wifi className="w-3 h-3 text-white" />
        </button>

        <button className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors" title="Bluetooth">
          <Bluetooth className="w-3 h-3 text-white" />
        </button>

        {/* Camera Button for Screen Capture */}
        <button
          onClick={captureScreen}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          title="Capture Screen"
        >
          <Camera className="w-3 h-3 text-green-400" />
        </button>

        {/* Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          title="Search"
        >
          <Search className="w-3 h-3 text-blue-400" />
        </button>

        {/* Security Button */}
        <button
          onClick={onSecurityClick}
          className="flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          title="Security Center"
        >
          <Shield className="w-3 h-3 text-blue-400" />
        </button>

        {/* Time */}
        <div className="flex items-center px-3">
          <span className="font-mono text-xs">{currentTime}</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
