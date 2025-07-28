
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Globe, 
  FileText, 
  Folder, 
  Settings, 
  Terminal,
  Calculator
} from 'lucide-react';
import SettingsApp from '@/components/apps/SettingsApp';
import FileManager from '@/components/apps/FileManager';
import NotesApp from '@/components/apps/NotesApp';
import TerminalApp from '@/components/apps/TerminalApp';
import WebBrowser from '@/components/apps/WebBrowser';
import TextEditor from '@/components/apps/TextEditor';
import CalculatorApp from '@/components/apps/Calculator';

const Dock: React.FC = () => {
  const { openWindow, isDarkMode, windows } = useOS();

  const dockApps = [
    {
      id: 'browser',
      title: 'Safari',
      icon: Globe,
      component: WebBrowser,
      color: 'bg-blue-500'
    },
    {
      id: 'texteditor',
      title: 'TextEdit',
      icon: FileText,
      component: TextEditor,
      color: 'bg-blue-600'
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: FileText,
      component: NotesApp,
      color: 'bg-yellow-500'
    },
    {
      id: 'files',
      title: 'Files',
      icon: Folder,
      component: FileManager,
      color: 'bg-blue-600'
    },
    {
      id: 'calculator',
      title: 'Calculator',
      icon: Calculator,
      component: CalculatorApp,
      color: 'bg-orange-500'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      component: SettingsApp,
      color: 'bg-gray-500'
    },
    {
      id: 'terminal',
      title: 'Terminal',
      icon: Terminal,
      component: TerminalApp,
      color: 'bg-black'
    }
  ];

  const handleAppClick = (app: typeof dockApps[0]) => {
    openWindow({
      id: app.id,
      title: app.title,
      component: app.component
    });
  };

  const isAppMinimized = (appId: string) => {
    return windows.some(window => window.id === appId && window.isMinimized);
  };

  const isAppOpen = (appId: string) => {
    return windows.some(window => window.id === appId);
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
      <div className={`flex flex-col items-center space-y-2 py-3 px-2 rounded-xl ${
        isDarkMode 
          ? 'bg-black/40 backdrop-blur-xl border border-white/20' 
          : 'bg-white/40 backdrop-blur-xl border border-black/20'
      }`}>
        {dockApps.map((app) => (
          <div key={app.id} className="relative">
            <button
              onClick={() => handleAppClick(app)}
              className={`
                w-10 h-10 rounded-lg ${app.color} flex items-center justify-center 
                transition-all duration-200 hover:scale-110 hover:-translate-x-1 
                active:scale-95 shadow-lg group relative
              `}
              title={app.title}
            >
              <app.icon className="w-5 h-5 text-white" />
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 
                            bg-black/75 text-white text-xs py-1 px-2 rounded 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {app.title}
              </div>
            </button>
            
            {/* Indicator dot for open/minimized apps */}
            {isAppOpen(app.id) && (
              <div className={`absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 rounded-full ${
                isAppMinimized(app.id) ? 'bg-orange-400' : 'bg-white'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dock;
