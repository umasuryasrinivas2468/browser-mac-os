
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { X, Search } from 'lucide-react';
import { 
  Globe, 
  FileText, 
  Folder, 
  Settings, 
  Terminal,
  Calculator,
  Clock,
  Calendar,
  Building2,
  Users,
  Code,
  Map
} from 'lucide-react';

// Import all app components
import CalculatorApp from './apps/Calculator';
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
import SlideDeckEditor from './apps/SlideDeckEditor';
import OnlyOfficeWriter from './apps/OnlyOfficeWriter';
import OnlyOfficeCalc from './apps/OnlyOfficeCalc';
import OnlyOfficeImpress from './apps/OnlyOfficeImpress';
import AczenBilzApp from './apps/AczenBilzApp';
import AczenCRMApp from './apps/AczenCRMApp';
import AczenIDEApp from './apps/AczenIDEApp';

const AppLauncher: React.FC = () => {
  const { isDarkMode, openWindow } = useOS();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const apps = [
    {
      id: 'browser',
      name: 'Web Browser',
      icon: Globe,
      component: WebBrowser,
      description: 'Browse the internet',
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
      icon: Calculator,
      component: CalculatorApp,
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
      icon: FileText,
      component: AczenSheetsApp,
      description: 'Simple spreadsheet app',
      color: 'bg-green-600'
    },
    {
      id: 'aczen-bilz',
      name: 'Aczen Bilz',
      icon: Building2,
      component: AczenBilzApp,
      description: 'Business management',
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
      id: 'slide-deck',
      name: 'Slide Deck Editor',
      icon: FileText,
      component: SlideDeckEditor,
      description: 'Create and edit presentation slides',
      color: 'bg-purple-600'
    },
    {
      id: 'onlyoffice-writer',
      name: 'OnlyOffice Writer',
      icon: FileText,
      component: OnlyOfficeWriter,
      description: 'Professional document editor',
      color: 'bg-blue-700'
    },
    {
      id: 'onlyoffice-calc',
      name: 'OnlyOffice Calc',
      icon: FileText,
      component: OnlyOfficeCalc,
      description: 'Professional spreadsheet editor',
      color: 'bg-green-700'
    },
    {
      id: 'onlyoffice-impress',
      name: 'OnlyOffice Impress',
      icon: FileText,
      component: OnlyOfficeImpress,
      description: 'Professional presentation editor',
      color: 'bg-red-600'
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
            <div className="w-6 h-6 grid grid-cols-2 gap-1">
              <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></div>
              <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></div>
              <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></div>
              <div className={`w-2 h-2 rounded-sm ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></div>
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div 
            className={`app-launcher w-[900px] h-[700px] rounded-xl shadow-2xl backdrop-blur-lg border ${
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
              <div className="grid grid-cols-6 gap-6">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`p-6 rounded-lg transition-all duration-200 hover:scale-105 flex flex-col items-center space-y-3 ${
                      isDarkMode 
                        ? 'hover:bg-gray-700/50 text-white' 
                        : 'hover:bg-gray-100/50 text-gray-900'
                    }`}
                    title={app.description}
                  >
                    <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center shadow-md`}>
                      <app.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-medium text-center leading-tight">{app.name}</div>
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
