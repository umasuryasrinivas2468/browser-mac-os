import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Bot } from 'lucide-react';

interface PerplexityAppProps {
  searchQuery?: string;
}

const PerplexityApp: React.FC<PerplexityAppProps> = ({ searchQuery }) => {
  const { isDarkMode } = useOS();
  
  // Construct the URL based on whether there's a search query
  const perplexityUrl = searchQuery 
    ? `https://www.perplexity.ai/search?q=${encodeURIComponent(searchQuery)}`
    : 'https://www.perplexity.ai';

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Perplexity AI
          </h1>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          src={perplexityUrl}
          className="w-full h-full border-none"
          title="Perplexity AI"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default PerplexityApp;