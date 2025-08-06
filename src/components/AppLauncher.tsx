
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Plus, X, Search, Calculator as CalculatorIcon, FileText, Folder, Settings, Terminal, Clock, Calendar, Building2, Users, Code, FileSpreadsheet, Map, Globe, Target, Grid3X3, Presentation } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Import all app components
import Calculator from './apps/Calculator';
import NotesApp from './apps/NotesApp';
import TextEditor from './apps/TextEditor';
import FileManager from './apps/FileManager';
import WebBrowser from './apps/WebBrowser';
import SettingsApp from './apps/SettingsApp';
import CalendarApp from './apps/CalendarApp';
import ClockApp from './apps/ClockApp';
import TerminalApp from './apps/TerminalApp';
import MapsAppDemo from './apps/MapsAppDemo';
import AczenSheetsApp from './apps/AczenSheetsApp';
import AczenBilzApp from './apps/AczenBilzApp';
import AczenCRMApp from './apps/AczenCRMApp';
import AczenIDEApp from './apps/AczenIDEApp';
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
      id: 'browser',
      name: 'Web Browser',
      icon: Globe,
      component: WebBrowser,
      description: 'Web browser',
      color: 'bg-blue-500'
    },
    {
      id: 'texteditor',
      name: 'TextEdit',
      icon: FileText,
      component: TextEditor,
      description: 'Rich text editor with formatting',
      color: 'bg-blue-600'
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: CalculatorIcon,
      component: Calculator,
      description: 'Basic arithmetic calculator',
      color: 'bg-orange-500'
    },
    {
      id: 'clock',
      name: 'Clock',
      icon: Clock,
      component: ClockApp,
      description: 'World clock and timers',
      color: 'bg-indigo-500'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      component: CalendarApp,
      description: 'Calendar and scheduling',
      color: 'bg-red-500'
    },
    {
      id: 'aczen-sheets',
      name: 'Aczen Sheets',
      icon: FileSpreadsheet,
      component: AczenSheetsApp,
      description: 'Simple spreadsheet app',
      color: 'bg-green-600'
    },
    {
      id: 'aczen-bilz',
      name: 'Aczen Bilz',
      icon: Building2,
      component: AczenBilzApp,
      description: 'Business management app',
      color: 'bg-blue-600'
    },
    {
      id: 'aczen-crm',
      name: 'Aczen CRM',
      icon: Users,
      component: AczenCRMApp,
      description: 'Customer relationship management',
      color: 'bg-green-500'
    },
    {
      id: 'aczen-ide',
      name: 'Aczen IDE',
      icon: Code,
      component: AczenIDEApp,
      description: 'Integrated development environment',
      color: 'bg-purple-500'
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: Map,
      component: MapsAppDemo,
      description: 'Interactive maps',
      color: 'bg-green-500'
    },
    {
      id: 'files',
      name: 'Files',
      icon: Folder,
      component: FileManager,
      description: 'Manage your files and folders',
      color: 'bg-blue-600'
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: Terminal,
      component: TerminalApp,
      description: 'Command line interface',
      color: 'bg-gray-800'
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: FileText,
      component: NotesApp,
      description: 'Take quick notes',
      color: 'bg-yellow-500'
    },
    {
      id: 'slide-deck',
      name: 'Aczen Deck',
      icon: Presentation,
      component: SlideDeckEditor,
      description: 'Create and edit presentation slides',
      color: 'bg-purple-500'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      component: SettingsApp,
      description: 'System settings and preferences',
      color: 'bg-gray-600'
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
    <div className="app-launcher-container">
      {/* App Launcher Button - Bottom Left Corner */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-4 left-4 z-50 pointer-events-auto w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-md border ${
          isDarkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80 border-gray-600' 
            : 'bg-white/80 hover:bg-gray-100/80 border-gray-200'
        } shadow-lg`}
        title="App Launcher"
      >
        {isOpen ? (
          <X className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
        ) : (
          <Grid3X3 className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
        )}
      </button>

      {/* App Grid Modal */}
      {isOpen && (
        <div 
          className={`pointer-events-auto fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-8 z-40`}
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
                    <div className={`w-12 h-12 rounded-lg ${app.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 mx-auto`}>
                      <app.icon className="w-6 h-6 text-white" />
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
