
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Plus, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

interface AppLauncherProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ isVisible = true, onClose }) => {
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
    if (onClose) onClose();
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.app-launcher-container')) {
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

  if (!isVisible) return null;

  return (
    <div className="app-launcher-container fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* App Launcher Button - Center */}
      <button
        onClick={handleToggle}
        className={`pointer-events-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-lg ${
          isDarkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-600/50' 
            : 'bg-white/80 hover:bg-white/90 border border-gray-200/50'
        } shadow-lg hover:shadow-xl ${isOpen ? 'scale-110' : ''}`}
        title="App Launcher"
      >
        {isOpen ? (
          <X className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
        ) : (
          <div className="grid grid-cols-2 gap-1">
            <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} />
            <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} />
            <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} />
            <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} />
          </div>
        )}
      </button>

      {/* App Grid Modal */}
      {isOpen && (
        <div 
          className={`pointer-events-auto fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-8`}
          onClick={handleClose}
        >
          <div 
            className={`w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl backdrop-blur-lg border ${
              isDarkMode 
                ? 'bg-gray-900/95 border-gray-700/50' 
                : 'bg-white/95 border-gray-200/50'
            } p-8 overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 h-12 text-lg rounded-xl ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                autoFocus
              />
            </div>

            {/* Apps Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`p-4 rounded-2xl transition-all duration-200 hover:scale-105 group ${
                      isDarkMode 
                        ? 'hover:bg-gray-800/50 text-white' 
                        : 'hover:bg-gray-100/50 text-gray-900'
                    }`}
                    title={app.description}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {app.icon}
                    </div>
                    <div className="text-sm font-medium text-center leading-tight">
                      {app.name}
                    </div>
                  </button>
                ))}
              </div>

              {filteredApps.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    No apps found
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLauncher;
