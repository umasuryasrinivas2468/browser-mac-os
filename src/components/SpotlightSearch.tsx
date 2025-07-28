
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Search, Command } from 'lucide-react';

const SpotlightSearch: React.FC = () => {
  const { isDarkMode } = useOS();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className={`w-full max-w-lg mx-4 rounded-xl shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <form onSubmit={handleSearch} className="p-4">
          <div className="flex items-center space-x-3">
            <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search with Perplexity..."
              className={`flex-1 bg-transparent border-none outline-none text-lg ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
            />
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Command className="w-3 h-3" />
              <span>Space</span>
            </div>
          </div>
        </form>
        
        <div className={`px-4 pb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Press Enter to search with Perplexity AI
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
