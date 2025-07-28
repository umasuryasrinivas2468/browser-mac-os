import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Bot } from 'lucide-react';
import PerplexityApp from '@/components/apps/PerplexityApp';

const DesktopSearchBar: React.FC = () => {
  const { isDarkMode, openWindow } = useOS();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      openWindow({
        id: 'perplexity-search',
        title: 'Perplexity AI',
        component: () => <PerplexityApp searchQuery={searchQuery} />
      });
      setSearchQuery('');
    }
  };

  const handleClick = () => {
    // Open Perplexity in iframe
    openWindow({
      id: 'perplexity',
      title: 'Perplexity AI',
      component: () => <PerplexityApp />
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className={`rounded-lg backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-black/40 border-white/10' 
          : 'bg-white/40 border-black/10'
      }`}>
        <form onSubmit={handleSearch} className="py-2 px-3">
          <div className="flex items-center space-x-3">
            <Bot className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={handleClick}
              placeholder="Search with Perplexity AI..."
              className={`w-64 bg-transparent border-none outline-none text-sm cursor-pointer ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesktopSearchBar;