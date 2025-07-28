
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Users } from 'lucide-react';

const AczenCRMApp: React.FC = () => {
  const { isDarkMode } = useOS();

  React.useEffect(() => {
    window.location.href = 'https://crm.aczen.tech';
  }, []);

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

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Redirecting to Aczen CRM
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Taking you to the customer relationship management platform...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AczenCRMApp;
