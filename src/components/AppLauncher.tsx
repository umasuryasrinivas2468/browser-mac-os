
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Globe, 
  FileText, 
  Folder, 
  Settings, 
  Terminal,
  Calculator,
  Grid3X3,
  X,
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

const AppLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openWindow, isDarkMode } = useOS();

  const apps = [
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

  const handleAppClick = (app: typeof apps[0]) => {
    openWindow({
      id: app.id,
      title: app.title,
      component: app.component
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* App Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 w-10 h-10 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80' 
            : 'bg-white/80 hover:bg-gray-100/80'
        } backdrop-blur-md border ${
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        } flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-30`}
      >
        <Grid3X3 className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
      </button>

      {/* App Launcher Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className={`relative w-80 p-6 rounded-2xl shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-900/90 border border-gray-700' 
              : 'bg-white/90 border border-gray-200'
          } backdrop-blur-xl`}>
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className={`absolute top-4 right-4 w-6 h-6 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors`}
            >
              <X className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
            </button>

            {/* Apps Grid */}
            <div className="grid grid-cols-4 gap-4 mt-2">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-100/50 transition-all duration-200 hover:scale-105"
                >
                  <div className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center shadow-md`}>
                    <app.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs text-center ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {app.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppLauncher;
