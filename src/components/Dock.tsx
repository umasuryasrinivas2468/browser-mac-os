
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
      id: 'calculator',
      title: 'Calculator',
      icon: Calculator,
      component: CalculatorApp,
      color: 'bg-orange-500'
    },
    {
      id: 'files',
      title: 'Files',
      icon: Folder,
      component: FileManager,
      color: 'bg-blue-600'
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
    <div className="fixed bottom-4 left-4 z-30">
      <div className={`flex items-center space-x-2 py-2 px-3 rounded-xl ${
        isDarkMode 
          ? 'bg-black/40 backdrop-blur-xl border border-white/10' 
          : 'bg-white/40 backdrop-blur-xl border border-black/10'
      }`}>
        {dockApps.map((app) => (
          <div key={app.id} className="relative">
            <button
              onClick={() => handleAppClick(app)}
              className={`
                w-8 h-8 rounded-lg ${app.color} flex items-center justify-center 
                transition-all duration-200 hover:scale-110 hover:-translate-y-1 
                active:scale-95 shadow-md group relative
              `}
              title={app.title}
            >
              <app.icon className="w-4 h-4 text-white" />
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 
                            bg-black/75 text-white text-xs py-1 px-2 rounded 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {app.title}
              </div>
            </button>
            
            {/* Indicator dot for open/minimized apps */}
            {isAppOpen(app.id) && (
              <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
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
