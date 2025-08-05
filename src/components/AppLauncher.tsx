import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Plus, X } from 'lucide-react';
import PopupApps from './PopupApps';

// Import all app components
import Calculator from './apps/Calculator';
import NotesApp from './apps/NotesApp';
import TextEditor from './apps/TextEditor';
import FileManager from './apps/FileManager';
import BrowserApp from './apps/BrowserApp';
import SettingsApp from './apps/SettingsApp';
import CalendarApp from './apps/CalendarApp';
import ClockApp from './apps/ClockApp';
import TerminalApp from './apps/TerminalApp';
import MapsApp from './apps/MapsApp';
import AczenSheetsApp from './apps/AczenSheetsApp';
import SpreadsheetApp from './apps/SpreadsheetApp';
import SlideDeckEditor from './apps/SlideDeckEditor';
import OnlyOfficeWriter from './apps/OnlyOfficeWriter';
import OnlyOfficeCalc from './apps/OnlyOfficeCalc';
import OnlyOfficeImpress from './apps/OnlyOfficeImpress';

const AppLauncher: React.FC = () => {
  const { isDarkMode, openWindow } = useOS();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopularApps, setShowPopularApps] = useState(false);

  const apps = [
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🧮',
      component: Calculator,
      description: 'Basic arithmetic calculator'
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: '📝',
      component: NotesApp,
      description: 'Take quick notes'
    },
    {
      id: 'text-editor',
      name: 'Text Editor',
      icon: '📄',
      component: TextEditor,
      description: 'Rich text editor with formatting'
    },
    {
      id: 'file-manager',
      name: 'File Manager',
      icon: '📁',
      component: FileManager,
      description: 'Manage your files and folders'
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: '🌐',
      component: BrowserApp,
      description: 'Web browser'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: '📅',
      component: CalendarApp,
      description: 'Calendar and scheduling'
    },
    {
      id: 'clock',
      name: 'Clock',
      icon: '🕐',
      component: ClockApp,
      description: 'World clock and timers'
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: '⚡',
      component: TerminalApp,
      description: 'Command line interface'
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: '🗺️',
      component: MapsApp,
      description: 'Interactive maps'
    },
    {
      id: 'aczen-sheets',
      name: 'Aczen Sheets',
      icon: '📊',
      component: AczenSheetsApp,
      description: 'Simple spreadsheet app'
    },
    {
      id: 'spreadsheet',
      name: 'Advanced Spreadsheet',
      icon: '📈',
      component: SpreadsheetApp,
      description: 'Full-featured spreadsheet application'
    },
    {
      id: 'slide-deck',
      name: 'Slide Deck Editor',
      icon: '🎯',
      component: SlideDeckEditor,
      description: 'Create and edit presentation slides'
    },
    {
      id: 'onlyoffice-writer',
      name: 'OnlyOffice Writer',
      icon: '📝',
      component: OnlyOfficeWriter,
      description: 'Professional document editor'
    },
    {
      id: 'onlyoffice-calc',
      name: 'OnlyOffice Calc',
      icon: '📊',
      component: OnlyOfficeCalc,
      description: 'Professional spreadsheet editor'
    },
    {
      id: 'onlyoffice-impress',
      name: 'OnlyOffice Impress',
      icon: '🎨',
      component: OnlyOfficeImpress,
      description: 'Professional presentation editor'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      component: SettingsApp,
      description: 'System settings and preferences'
    }
  ];

  const handleAppClick = (app: any) => {
    openWindow({
      id: app.id,
      title: app.name,
      component: app.component,
    });
    setIsOpen(false);
  };

  const handlePopularAppsClick = () => {
    setShowPopularApps(true);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.app-launcher')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="app-launcher fixed bottom-4 left-4 z-30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-lg ${
            isDarkMode 
              ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-600/50' 
              : 'bg-white/80 hover:bg-white/90 border border-gray-200/50'
          } shadow-lg hover:shadow-xl`}
          title="App Launcher"
        >
          {isOpen ? (
            <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          ) : (
            <Plus className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          )}
        </button>

        {isOpen && (
          <div 
            className={`absolute bottom-16 left-0 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl backdrop-blur-lg border ${
              isDarkMode 
                ? 'bg-gray-800/95 border-gray-600/50' 
                : 'bg-white/95 border-gray-200/50'
            } p-4`}
          >
            <div className="grid grid-cols-3 gap-3">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700/50 text-white' 
                      : 'hover:bg-gray-100/50 text-gray-900'
                  }`}
                  title={app.description}
                >
                  <div className="text-2xl mb-1">{app.icon}</div>
                  <div className="text-xs font-medium truncate">{app.name}</div>
                </button>
              ))}
              
              {/* Popular Apps Button */}
              <button
                onClick={handlePopularAppsClick}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700/50 text-white border border-gray-600' 
                    : 'hover:bg-gray-100/50 text-gray-900 border border-gray-300'
                } border-dashed`}
                title="More Popular Apps"
              >
                <div className="text-2xl mb-1">🌟</div>
                <div className="text-xs font-medium">More Apps</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {showPopularApps && (
        <PopupApps onClose={() => setShowPopularApps(false)} />
      )}
    </>
  );
};

export default AppLauncher;
