import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Globe, 
  FileText, 
  Folder, 
  Settings, 
  Terminal,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import SettingsApp from '@/components/apps/SettingsApp';
import FileManager from '@/components/apps/FileManager';
import NotesApp from '@/components/apps/NotesApp';
import TerminalApp from '@/components/apps/TerminalApp';
import BrowserApp from '@/components/apps/BrowserApp';
import OnlyOfficeWriter from '@/components/apps/OnlyOfficeWriter';
import OnlyOfficeCalc from '@/components/apps/OnlyOfficeCalc';
import OnlyOfficeImpress from '@/components/apps/OnlyOfficeImpress';

const Dock: React.FC = () => {
  const { openWindow, isDarkMode } = useOS();

  const dockApps = [
    {
      id: 'browser',
      title: 'Safari',
      icon: Globe,
      component: BrowserApp,
      color: 'bg-blue-500'
    },
    {
      id: 'writer',
      title: 'Writer',
      icon: FileText,
      component: OnlyOfficeWriter,
      color: 'bg-blue-600'
    },
    {
      id: 'calc',
      title: 'Calc',
      icon: FileSpreadsheet,
      component: OnlyOfficeCalc,
      color: 'bg-green-600'
    },
    {
      id: 'impress',
      title: 'Impress',
      icon: Presentation,
      component: OnlyOfficeImpress,
      color: 'bg-orange-600'
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

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className={`flex items-end space-x-2 px-4 py-3 rounded-2xl ${
        isDarkMode 
          ? 'bg-black/40 backdrop-blur-xl border border-white/20' 
          : 'bg-white/40 backdrop-blur-xl border border-black/20'
      }`}>
        {dockApps.map((app) => (
          <button
            key={app.id}
            onClick={() => handleAppClick(app)}
            className={`
              w-14 h-14 rounded-xl ${app.color} flex items-center justify-center 
              transition-all duration-200 hover:scale-110 hover:-translate-y-1 
              active:scale-95 shadow-lg group
            `}
            title={app.title}
          >
            <app.icon className="w-6 h-6 text-white" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                          bg-black/75 text-white text-xs py-1 px-2 rounded 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {app.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dock;
