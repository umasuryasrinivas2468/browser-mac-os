import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Users } from 'lucide-react';

interface PerplexityAppProps {
  searchQuery?: string;
}

const PerplexityApp: React.FC<PerplexityAppProps> = ({ searchQuery }) => {
  const { isDarkMode } = useOS();
  
  // Use Manus invitation link instead of Perplexity
  const manusUrl = 'https://manus.im/invitation/YGXMVZYGJE9LIZB';

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-500" />
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Manus
          </h1>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          src={manusUrl}
          className="w-full h-full border-none"
          title="Manus Invitation"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default PerplexityApp;