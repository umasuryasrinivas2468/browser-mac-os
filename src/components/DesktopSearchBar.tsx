
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Bot } from 'lucide-react';
import SearchPopup from './SearchPopup';

const DesktopSearchBar: React.FC = () => {
  const { isDarkMode } = useOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setInitialQuery(searchQuery);
      setShowSearchPopup(true);
      setSearchQuery('');
    }
  };

  const handleClick = () => {
    setInitialQuery('');
    setShowSearchPopup(true);
  };

  const handleClosePopup = () => {
    setShowSearchPopup(false);
    setInitialQuery('');
  };

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={handleClick}
        className={`fixed bottom-4 right-4 w-10 h-10 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80' 
            : 'bg-white/80 hover:bg-gray-100/80'
        } backdrop-blur-md border ${
          isDarkMode ? 'border-gray-600' : 'border-gray-200'
        } flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-30`}
        title="AI Search"
      >
        <Bot className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
      </button>

      <SearchPopup
        isOpen={showSearchPopup}
        onClose={handleClosePopup}
        initialQuery={initialQuery}
      />
    </>
  );
};

export default DesktopSearchBar;
