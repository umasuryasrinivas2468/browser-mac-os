
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Lock } from 'lucide-react';

const BrowserApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [url, setUrl] = useState('https://www.apple.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Always redirect to ChatGPT for any search or URL
      window.open('https://chat.openai.com', '_blank');
    }
  };

  const handleNavigation = (newUrl: string) => {
    setUrl(newUrl);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const bookmarks = [
    { name: 'Apple', url: 'https://www.apple.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' }
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Browser Controls */}
      <div className={`flex items-center space-x-3 p-3 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded hover:bg-gray-200 disabled:opacity-50" disabled>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-200 disabled:opacity-50" disabled>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-200"
            onClick={() => handleNavigation(url)}
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center">
          <div className={`flex-1 flex items-center px-3 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-white border-gray-300'
          }`}>
            <Lock className="w-4 h-4 text-green-500 mr-2" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              placeholder="Search or enter website name"
            />
            <Search className="w-4 h-4 text-gray-400 ml-2" />
          </div>
        </form>

        <button className="p-2 rounded hover:bg-gray-200">
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className={`flex items-center space-x-1 px-3 py-2 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        {bookmarks.map((bookmark) => (
          <button
            key={bookmark.name}
            onClick={() => handleNavigation(bookmark.url)}
            className={`px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'
            }`}
          >
            {bookmark.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
            <Search className="w-16 h-16 text-white" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Welcome to Safari</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter any search term or website URL to browse the web.
            All searches will redirect to ChatGPT for assistance.
          </p>

          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search the web or enter a URL"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Search with ChatGPT
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4">
            This will open ChatGPT in a new tab
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowserApp;
