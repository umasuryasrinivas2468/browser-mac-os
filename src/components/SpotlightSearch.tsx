
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
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 
                   px-3 py-1.5 rounded-full bg-gray-500/30 backdrop-blur-md 
                   border border-gray-400/30 text-gray-300 text-xs
                   hover:bg-gray-500/40 transition-all duration-200"
      >
        <Search className="w-3 h-3 inline mr-1" />
        Search
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div 
        className={`w-[400px] ${
          isDarkMode 
            ? 'bg-gray-900/90 backdrop-blur-xl border border-gray-700' 
            : 'bg-white/90 backdrop-blur-xl border border-gray-200'
        } rounded-xl shadow-2xl overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the web"
              className={`flex-1 bg-transparent outline-none ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
          </div>
          
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center justify-between">
              <span>Press Enter to search</span>
              <span>⌘ + Space</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
