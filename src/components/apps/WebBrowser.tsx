
import React, { useState, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Globe, ExternalLink, Shield } from 'lucide-react';

const WebBrowser: React.FC = () => {
  const { isDarkMode } = useOS();
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const formatUrl = (inputUrl: string): string => {
    if (!inputUrl.trim()) return '';
    
    // If it's a search query, use DuckDuckGo
    if (!inputUrl.includes('.') && !inputUrl.startsWith('http')) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(inputUrl)}`;
    }
    
    // Add protocol if missing
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return `https://${inputUrl}`;
    }
    
    return inputUrl;
  };

  const navigateToUrl = (targetUrl: string) => {
    const formattedUrl = formatUrl(targetUrl);
    if (!formattedUrl) return;

    setIsLoading(true);
    setCurrentUrl(formattedUrl);
    setUrl(formattedUrl);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(formattedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);

    // Open in new tab for better compatibility
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    setIsLoading(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(url);
  };

  const handleBack = () => {
    if (canGoBack && historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const targetUrl = history[newIndex];
      setCurrentUrl(targetUrl);
      setUrl(targetUrl);
      setHistoryIndex(newIndex);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleForward = () => {
    if (canGoForward && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const targetUrl = history[newIndex];
      setCurrentUrl(targetUrl);
      setUrl(targetUrl);
      setHistoryIndex(newIndex);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReload = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleHome = () => {
    navigateToUrl('https://www.google.com');
  };

  const quickLinks = [
    { name: 'Google', url: 'https://www.google.com', color: 'from-blue-500 to-blue-600' },
    { name: 'GitHub', url: 'https://github.com', color: 'from-gray-700 to-gray-900' },
    { name: 'YouTube', url: 'https://www.youtube.com', color: 'from-red-500 to-red-600' },
    { name: 'Twitter', url: 'https://twitter.com', color: 'from-sky-400 to-sky-500' },
    { name: 'Reddit', url: 'https://www.reddit.com', color: 'from-orange-500 to-orange-600' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', color: 'from-orange-600 to-yellow-500' }
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      {/* Browser Controls */}
      <div className={`flex items-center space-x-3 p-4 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2">
          <button 
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              !canGoBack ? 'opacity-50 cursor-not-allowed' : ''
            } ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
            onClick={handleBack}
            disabled={!canGoBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              !canGoForward ? 'opacity-50 cursor-not-allowed' : ''
            } ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
            onClick={handleForward}
            disabled={!canGoForward}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : ''
            }`}
            onClick={handleReload}
          >
            <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center">
          <div className={`flex-1 flex items-center px-4 py-3 rounded-full border-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 focus-within:border-blue-500' 
              : 'bg-white border-gray-300 focus-within:border-blue-500'
          }`}>
            <Shield className="w-5 h-5 text-green-500 mr-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Search or enter website URL..."
            />
            <Search className="w-5 h-5 text-gray-400 ml-3" />
          </div>
        </form>

        <button 
          className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : ''
          }`}
          onClick={handleHome}
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentUrl ? (
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <ExternalLink className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-2">Website Opened</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentUrl} has been opened in a new tab for better compatibility.
              </p>
              <button
                onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Open Again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Aczen Browser</h2>
              <p className={`mb-8 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Browse the web with enhanced compatibility and security.
              </p>

              <form onSubmit={handleUrlSubmit} className="mb-8">
                <div className={`flex items-center px-6 py-4 rounded-full border-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 focus-within:border-blue-500' 
                    : 'bg-white border-gray-300 focus-within:border-blue-500'
                } shadow-lg`}>
                  <Search className="w-6 h-6 text-gray-400 mr-4" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Search the web or enter a URL"
                    className={`flex-1 bg-transparent outline-none text-lg ${
                      isDarkMode ? 'text-white placeholder-gray-400' : 'placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="ml-4 bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition-colors font-medium"
                  >
                    Browse
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => navigateToUrl(link.url)}
                    className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                      isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50' 
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.color} mx-auto mb-2`}></div>
                    <div className="font-medium">{link.name}</div>
                  </button>
                ))}
              </div>

              <div className={`mt-8 p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                  <strong>Enhanced Compatibility:</strong> Websites open in new tabs for better Safari compatibility and security.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebBrowser;
