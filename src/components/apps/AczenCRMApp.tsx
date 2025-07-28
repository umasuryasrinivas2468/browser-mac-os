
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Users } from 'lucide-react';

const AczenCRMApp: React.FC = () => {
  const { isDarkMode } = useOS();

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-green-500" />
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Aczen CRM
          </h1>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          src="https://crm.aczen.tech"
          className="w-full h-full border-none"
          title="Aczen CRM"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        />
      </div>
    </div>
  );
};

export default AczenCRMApp;
