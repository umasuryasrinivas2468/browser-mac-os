
import React from 'react';
import { useOS } from '@/contexts/OSContext';
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
  FileSpreadsheet
} from 'lucide-react';
import SettingsApp from '@/components/apps/SettingsApp';
import FileManager from '@/components/apps/FileManager';
import NotesApp from '@/components/apps/NotesApp';
import TerminalApp from '@/components/apps/TerminalApp';
import WebBrowser from '@/components/apps/WebBrowser';
import TextEditor from '@/components/apps/TextEditor';
import CalculatorApp from '@/components/apps/Calculator';
import ClockApp from '@/components/apps/ClockApp';
import CalendarApp from '@/components/apps/CalendarApp';
import AczenBilzApp from '@/components/apps/AczenBilzApp';
import AczenCRMApp from '@/components/apps/AczenCRMApp';
import AczenIDEApp from '@/components/apps/AczenIDEApp';
import AczenSheetsApp from '@/components/apps/AczenSheetsApp';

const Dock: React.FC = () => {
  const { openWindow, isDarkMode, windows, isDockVisible } = useOS();

  const dockApps = [
    {
      id: 'browser',
      title: 'Web Browser',
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
      id: 'clock',
      title: 'Clock',
      icon: Clock,
      component: ClockApp,
      color: 'bg-indigo-500'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: Calendar,
      component: CalendarApp,
      color: 'bg-red-500'
    },
    {
      id: 'aczen-sheets',
      title: 'Aczen Sheets',
      icon: FileSpreadsheet,
      component: AczenSheetsApp,
      color: 'bg-green-600'
    },
    {
      id: 'aczen-bilz',
      title: 'Aczen Bilz',
      icon: Building2,
      component: AczenBilzApp,
      color: 'bg-blue-600'
    },
    {
      id: 'aczen-crm',
      title: 'Aczen CRM',
      icon: Users,
      component: AczenCRMApp,
      color: 'bg-green-500'
    },
    {
      id: 'aczen-ide',
      title: 'Aczen IDE',
      icon: Code,
      component: AczenIDEApp,
      color: 'bg-purple-500'
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
    <div className={`fixed bottom-4 left-4 z-30 transition-all duration-300 ${
      isDockVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
    }`}>
      <div className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-all duration-300 ${
        isDarkMode 
          ? 'bg-black/40 backdrop-blur-xl border border-white/10' 
          : 'bg-white/40 backdrop-blur-xl border border-black/10'
      }`}>
        {dockApps.map((app) => (
          <div key={app.id} className="relative">
            <button
              onClick={() => handleAppClick(app)}
              className={`
                w-10 h-10 rounded-md ${app.color} flex items-center justify-center 
                transition-all duration-200 hover:scale-110 hover:-translate-y-1 
                active:scale-95 shadow-md group relative
              `}
              title={app.title}
            >
              <app.icon className="w-5 h-5 text-white" />
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 
                            bg-black/75 text-white text-xs py-1 px-2 rounded 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
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
