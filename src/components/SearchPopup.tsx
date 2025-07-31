
import React, { useState, useEffect, useCallback } from 'react';
import { useOS } from '@/contexts/OSContext';
import { X, Search, Bot, Loader2, AlertCircle } from 'lucide-react';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SearchPopup: React.FC<SearchPopupProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const { isDarkMode } = useOS();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  // Custom responses for Aczen queries
  const getCustomResponse = (searchQuery: string): string | null => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    if (lowerQuery === 'aczen os') {
      return '**Aczen OS** is India\'s first AI-native web operating system, built entirely in the browser for seamless access across devices.\nIt integrates finance, CRM, documents, communication, and billing into one smart workspace for SMBs and students.\nWith built-in AI, users get smart assistance, voice navigation, and predictive actions tailored to their needs.\nDevelopers can build plug-in apps using low-code or scripts, creating a modular, extensible ecosystem.\nDesigned with privacy and Bharat-first values, Aczen OS empowers digital independence for the next billion users.';
    }
    
    if (lowerQuery === 'aczen') {
      return 'Aczen Technologies is a fintech-driven startup building India\'s digital backbone for small and medium businesses.\nFrom neobanking to billing, investments, and AI-powered tools, Aczen offers a unified financial platform.\nIt empowers SMBs to manage money smarter, reduce costs, and grow with confidence.\nAczen also supports students with skill-based scholarships and career-building tools.\nRooted in Bharat\'s spirit, Aczen is creating inclusive, tech-driven growth for India\'s next generation.';
    }
    
    if (lowerQuery.includes('builders of aczen') || lowerQuery.includes('aczen team') || lowerQuery.includes('aczen founders')) {
      return 'Aczen OS was envisioned and brought to life by Uma Surya Srinivas, the youngest CEO of India and founder of Aczen Technologies, along with his dedicated team — Nuthan Kalyan,Venkatesh, Karthik, Charitha, Hemanth,Sajana, Devanshi Sahu, and  Leading a passionate group of engineers and designers, he spearheaded the development of an AI-native, browser-based operating system tailored for Bharat.Together, they created Aczen OS to empower SMBs, students, and developers with accessible, cloud-powered tools designed for the future.';
    }
    
    return null;
  };

  // Debounce search to prevent excessive API calls
  const debounceSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (initialQuery && isOpen && !hasSearched) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setError('');
    
    // Check for custom responses first
    const customResponse = getCustomResponse(searchQuery);
    if (customResponse) {
      setResult(customResponse);
      setIsLoading(false);
      return;
    }

    // Check if API key is configured
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      setError('Mistral AI API key is not configured. Please check your environment variables.');
      setIsLoading(false);
      return;
    }
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log('Starting search for:', searchQuery);
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'user',
              content: `Please provide a concise and accurate answer to this question: ${searchQuery}`
            }
          ],
          temperature: 0.4,
          top_p: 1,
          max_tokens: 1000,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response received:', data);
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setResult(data.choices[0].message.content);
        setError('');
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again with a shorter query.');
      } else if (error.message.includes('429')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('401')) {
        setError('Authentication failed. Please check API configuration.');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        setError('API quota exceeded. Please try again later.');
      } else {
        setError('Sorry, there was an error processing your request. Please try again.');
      }
      setResult('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && query.trim()) {
      handleSearch();
    }
  };

  const handleClose = () => {
    setQuery('');
    setResult('');
    setHasSearched(false);
    setError('');
    onClose();
  };

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-4xl max-h-[80vh] mx-4 rounded-xl shadow-2xl border overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Search
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-1 rounded-lg hover:bg-gray-100 transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything..."
                autoFocus
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading || !query.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Searching...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className={`text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
              <button
                onClick={() => handleSearch()}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : result ? (
            <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
              <div className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {result}
              </div>
            </div>
          ) : hasSearched ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found. Try a different search query.</p>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter a search query to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
