
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useOS } from '@/contexts/OSContext';
import MenuBar from './MenuBar';
import Dock from './Dock';
import Window from './Window';
import SpotlightSearch from './SpotlightSearch';
import AppLauncher from './AppLauncher';
import DesktopSearchBar from './DesktopSearchBar';
import CopyProtection from './CopyProtection';
import ClerkPopup from './ClerkPopup';
import PopupApps from './PopupApps';
import { Calculator, Clock, Calendar, Shield, FileSpreadsheet } from 'lucide-react';
import TextEditor from './apps/TextEditor';
import CalculatorApp from './apps/Calculator';
import ClockApp from './apps/ClockApp';
import CalendarApp from './apps/CalendarApp';
import AczenSheetsApp from './apps/AczenSheetsApp';

const Desktop: React.FC = () => {
  const { windows, isDarkMode, openWindow } = useOS();
  const { isSignedIn } = useUser();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showClerkPopup, setShowClerkPopup] = useState(false);
  const [clerkMode, setClerkMode] = useState<'signin' | 'signup' | 'profile' | 'settings'>('signin');

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClickOutside = () => {
    setContextMenu(null);
  };

  const handleUserButtonClick = () => {
    if (isSignedIn) {
      setClerkMode('profile');
    } else {
      setClerkMode('signin');
    }
    setShowClerkPopup(true);
  };

  const contextMenuItems = [
    { label: 'Refresh', icon: null, action: () => window.location.reload() },
    { label: 'Security Center', icon: Shield, action: () => {
      setClerkMode(isSignedIn ? 'settings' : 'signin');
      setShowClerkPopup(true);
    }}
  ];

  const handleAppClick = (appData: { id: string; title: string; component: React.ComponentType<any> }) => {
    openWindow(appData);
  };

  return (
    <>
      <CopyProtection />
      
      <style>{`
        * {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 8 8, auto;
        }
        
        .desktop-cursor {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 8 8, auto;
        }
        
        .custom-wallpaper {
          background-image: url('https://i.ibb.co/KpTGFDg9/Whats-App-Image-2025-07-28-at-21-52-37-305242a5.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .glass-icon {
          backdrop-filter: blur(15px);
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        .glass-icon:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 12px 35px 0 rgba(31, 38, 135, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        .desktop-icons {
          z-index: 1;
        }
        
        .desktop-windows {
          z-index: 10;
        }
      `}</style>

      <div 
        className="fixed inset-0 overflow-hidden desktop-cursor custom-wallpaper no-copy"
        onContextMenu={handleRightClick}
        onClick={handleClickOutside}
      >
        <MenuBar 
          onSecurityClick={handleUserButtonClick}
          onPopularAppsClick={() => {
            // This will be handled by PopupApps component through a custom event
            window.dispatchEvent(new CustomEvent('togglePopularApps'));
          }}
        />
        

        
        {/* Windows - Higher z-index */}
        <div className="desktop-windows">
          {windows.map((window) => (
            <Window key={window.id} window={window} />
          ))}
        </div>

        <Dock />
        <SpotlightSearch />
        <AppLauncher />
        <DesktopSearchBar />
        <PopupApps />

        {/* Context Menu */}
        {contextMenu && (
          <div
            className={`fixed z-50 py-2 rounded-xl shadow-2xl border backdrop-blur-md min-w-[180px] ${
              isDarkMode 
                ? 'bg-gray-800/90 border-gray-700' 
                : 'bg-white/90 border-gray-200'
            }`}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={handleClickOutside}
          >
            {contextMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                  setContextMenu(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-white' : 'text-gray-900'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Clerk Security Popup */}
        <ClerkPopup
          isOpen={showClerkPopup}
          onClose={() => setShowClerkPopup(false)}
          mode={clerkMode}
        />
      </div>
    </>
  );
};

export default Desktop;
