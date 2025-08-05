
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Plus, X, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (app: any) => {
    openWindow({
      id: app.id,
      title: app.name,
      component: app.component,
    });
    setIsOpen(false);
    setSearchQuery('');
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
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div 
            className={`app-launcher w-[800px] h-[600px] rounded-xl shadow-2xl backdrop-blur-lg border ${
              isDarkMode 
                ? 'bg-gray-800/95 border-gray-600/50' 
                : 'bg-white/95 border-gray-200/50'
            } p-6 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Applications
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isDarkMode ? 'text-white' : 'text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Apps Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-6 gap-4">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`p-4 rounded-lg transition-all duration-200 hover:scale-105 flex flex-col items-center space-y-2 ${
                      isDarkMode 
                        ? 'hover:bg-gray-700/50 text-white' 
                        : 'hover:bg-gray-100/50 text-gray-900'
                    }`}
                    title={app.description}
                  >
                    <div className="text-3xl mb-2">{app.icon}</div>
                    <div className="text-xs font-medium text-center">{app.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppLauncher;
