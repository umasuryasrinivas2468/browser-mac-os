
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { ExternalLink, Building2, Code, Users } from 'lucide-react';

const AczenBilzApp: React.FC = () => {
  const { isDarkMode } = useOS();

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  const apps = [
    {
      name: 'Aczen Bilz',
      url: 'https://app.aczen.tech',
      icon: Building2,
      description: 'Main application platform',
      color: 'bg-blue-500'
    },
    {
      name: 'Aczen CRM',
      url: 'https://crm.aczen.tech',
      icon: Users,
      description: 'Customer relationship management',
      color: 'bg-green-500'
    },
    {
      name: 'Aczen IDE',
      url: 'https://codex.aczen.tech',
      icon: Code,
      description: 'Integrated development environment',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Aczen Applications
          </h1>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.name}
              className={`rounded-lg border p-6 cursor-pointer transition-all hover:shadow-lg ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleRedirect(app.url)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center`}>
                  <app.icon className="w-6 h-6 text-white" />
                </div>
                <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {app.name}
              </h3>
              
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {app.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Click to open in new tab
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AczenBilzApp;
