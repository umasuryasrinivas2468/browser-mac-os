
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useOS } from '@/contexts/OSContext';

const SpotlightSearch: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState('');
  const { isDarkMode } = useOS();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      setQuery('');
    } else if (e.key === 'Enter' && query.trim()) {
      window.open('https://chat.openai.com', '_blank');
      setIsVisible(false);
      setQuery('');
    }
  };

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault();
        setIsVisible(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20 
                   px-4 py-2 rounded-full bg-white/20 backdrop-blur-md 
                   border border-white/30 text-white/70 text-sm
                   hover:bg-white/30 transition-all duration-200"
      >
        <Search className="w-4 h-4 inline mr-2" />
        Search or enter website name
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div 
        className={`w-[600px] ${
          isDarkMode 
            ? 'bg-gray-900/90 backdrop-blur-xl border border-gray-700' 
            : 'bg-white/90 backdrop-blur-xl border border-gray-200'
        } rounded-2xl shadow-2xl overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the web or enter a website name"
              className={`flex-1 bg-transparent outline-none text-lg ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center justify-between">
              <span>Press Enter to search on ChatGPT</span>
              <span>⌘ + Space to open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
