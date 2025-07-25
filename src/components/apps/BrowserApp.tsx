
import React, { useState, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Lock, Globe, AlertTriangle } from 'lucide-react';

const BrowserApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // List of iframe-friendly websites
  const iframeFriendlyDomains = [
    'google.com',
    'duckduckgo.com',
    'wikipedia.org',
    'github.com',
    'codepen.io',
    'jsfiddle.net',
    'example.com',
    'httpbin.org',
    'jsonplaceholder.typicode.com'
  ];

  const formatUrl = (inputUrl: string): string => {
    if (!inputUrl.trim()) return '';
    
    // If it's a search query (no dots or protocol), use DuckDuckGo
    if (!inputUrl.includes('.') && !inputUrl.startsWith('http')) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(inputUrl)}`;
    }
    
    // Add protocol if missing
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return `https://${inputUrl}`;
    }
    
    return inputUrl;
  };

  const isIframeFriendly = (url: string): boolean => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return iframeFriendlyDomains.some(friendly => domain.includes(friendly));
    } catch {
      return false;
    }
  };

  const getProxyUrl = (targetUrl: string): string => {
    // For demonstration, we'll use a public CORS proxy
    // In production, you'd want to use your own proxy server
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  };

  const navigateToUrl = (targetUrl: string) => {
    const formattedUrl = formatUrl(targetUrl);
    if (!formattedUrl) return;

    setIsLoading(true);
    setIframeError(false);
    setCurrentUrl(formattedUrl);
    setUrl(formattedUrl);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(formattedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Update navigation state
    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);

    // Simulate loading time
    setTimeout(() => setIsLoading(false), 1000);
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
      setIframeError(false);
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
      setIframeError(false);
    }
  };

  const handleReload = () => {
    if (currentUrl) {
      setIsLoading(true);
      setIframeError(false);
      if (iframeRef.current) {
        iframeRef.current.src = currentUrl;
      }
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleHome = () => {
    navigateToUrl('https://www.google.com');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
  };

  const openInProxy = () => {
    if (currentUrl) {
      const proxyUrl = getProxyUrl(currentUrl);
      setCurrentUrl(proxyUrl);
      setIframeError(false);
      setIsLoading(true);
    }
  };

  const bookmarks = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'CodePen', url: 'https://codepen.io' },
    { name: 'Example', url: 'https://example.com' }
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Browser Controls */}
      <div className={`flex items-center space-x-3 p-3 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center space-x-1">
          <button 
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              !canGoBack ? 'opacity-50 cursor-not-allowed' : ''
            } ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
            onClick={handleBack}
            disabled={!canGoBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              !canGoForward ? 'opacity-50 cursor-not-allowed' : ''
            } ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
            onClick={handleForward}
            disabled={!canGoForward}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : ''
            }`}
            onClick={handleReload}
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
            {currentUrl ? (
              <Lock className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 mr-2" />
            )}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Search or enter website URL..."
            />
          </div>
        </form>

        <button 
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : ''
          }`}
          onClick={handleHome}
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className={`flex items-center space-x-1 px-3 py-2 border-b overflow-x-auto ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        {bookmarks.map((bookmark) => (
          <button
            key={bookmark.name}
            onClick={() => navigateToUrl(bookmark.url)}
            className={`px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors whitespace-nowrap ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'
            }`}
          >
            {bookmark.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {currentUrl ? (
          <>
            {iframeError ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto p-6">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Cannot Load Website</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This website cannot be displayed in an iframe due to security restrictions.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={openInProxy}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                      Try Proxy Mode
                    </button>
                    <button
                      onClick={() => window.open(currentUrl, '_blank')}
                      className={`w-full py-2 px-4 rounded border transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-none"
                title="Browser Content"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-16 h-16 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Welcome to Browser</h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter a website URL or search term to browse the web.
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
                  Browse
                </button>
              </form>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {bookmarks.slice(0, 4).map((bookmark) => (
                  <button
                    key={bookmark.name}
                    onClick={() => navigateToUrl(bookmark.url)}
                    className={`p-3 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium">{bookmark.name}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {bookmark.url.replace('https://', '').replace('www.', '')}
                    </div>
                  </button>
                ))}
              </div>

              <div className={`mt-6 p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'
              }`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-yellow-800'}`}>
                  <strong>Note:</strong> Some websites may not load due to security restrictions. 
                  Try the suggested iframe-friendly sites or use proxy mode.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-white/90 px-4 py-2 rounded-lg">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-900">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserApp;
