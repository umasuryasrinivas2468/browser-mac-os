
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Calculator, 
  FileText, 
  Calendar, 
  Settings, 
  Clock, 
  Terminal, 
  Browser,
  Folder,
  StickyNote,
  Presentation,
  FileSpreadsheet,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import all the app components
import Calculator from './apps/Calculator';
import TextEditor from './apps/TextEditor';
import CalendarApp from './apps/CalendarApp';
import SettingsApp from './apps/SettingsApp';
import ClockApp from './apps/ClockApp';
import TerminalApp from './apps/TerminalApp';
import BrowserApp from './apps/BrowserApp';
import FileManager from './apps/FileManager';
import NotesApp from './apps/NotesApp';
import SlideDeckEditor from './apps/SlideDeckEditor';
import SpreadsheetApp from './apps/SpreadsheetApp';
import PerplexityApp from './apps/PerplexityApp';

interface App {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  category: 'productivity' | 'utilities' | 'media' | 'development';
}

const apps: App[] = [
  // Productivity
  {
    id: 'texteditor',
    title: 'Text Editor',
    icon: <FileText className="w-6 h-6" />,
    component: TextEditor,
    category: 'productivity'
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: <StickyNote className="w-6 h-6" />,
    component: NotesApp,
    category: 'productivity'
  },
  {
    id: 'slides',
    title: 'Slide Deck',
    icon: <Presentation className="w-6 h-6" />,
    component: SlideDeckEditor,
    category: 'productivity'
  },
  {
    id: 'spreadsheet',
    title: 'Spreadsheet',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    component: SpreadsheetApp,
    category: 'productivity'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: <Calendar className="w-6 h-6" />,
    component: CalendarApp,
    category: 'productivity'
  },
  
  // Utilities
  {
    id: 'filemanager',
    title: 'File Manager',
    icon: <Folder className="w-6 h-6" />,
    component: FileManager,
    category: 'utilities'
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: <Calculator className="w-6 h-6" />,
    component: Calculator,
    category: 'utilities'
  },
  {
    id: 'clock',
    title: 'Clock',
    icon: <Clock className="w-6 h-6" />,
    component: ClockApp,
    category: 'utilities'
  },
  {
    id: 'search',
    title: 'Perplexity',
    icon: <Search className="w-6 h-6" />,
    component: PerplexityApp,
    category: 'utilities'
  },
  
  // Development
  {
    id: 'terminal',
    title: 'Terminal',
    icon: <Terminal className="w-6 h-6" />,
    component: TerminalApp,
    category: 'development'
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: <Browser className="w-6 h-6" />,
    component: BrowserApp,
    category: 'development'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="w-6 h-6" />,
    component: SettingsApp,
    category: 'utilities'
  }
];

interface AppLauncherProps {
  onClose: () => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ onClose }) => {
  const { isDarkMode, openWindow } = useOS();

  const handleAppClick = (app: App) => {
    openWindow({
      id: app.id,
      title: app.title,
      component: app.component,
    });
    onClose();
  };

  const categories = [
    { id: 'productivity', name: 'Productivity' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'development', name: 'Development' }
  ];

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50`}>
      <div className={`w-full max-w-4xl h-3/4 rounded-lg shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Applications</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              ×
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto h-full">
          {categories.map(category => (
            <div key={category.id} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-400">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {apps.filter(app => app.category === category.id).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {app.icon}
                      <span className="text-sm font-medium truncate w-full">
                        {app.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppLauncher;
