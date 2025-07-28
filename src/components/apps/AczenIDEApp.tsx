
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Code } from 'lucide-react';

const AczenIDEApp: React.FC = () => {
  const { isDarkMode } = useOS();

  React.useEffect(() => {
    window.location.href = 'https://codex.aczen.tech';
  }, []);

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-500" />
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Aczen IDE
          </h1>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <Code className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Redirecting to Aczen IDE
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Taking you to the integrated development environment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AczenIDEApp;
