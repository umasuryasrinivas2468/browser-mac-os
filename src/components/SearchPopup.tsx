import React, { useState, useEffect, useCallback } from 'react';
import { useOS } from '@/contexts/OSContext';
import { X, Search, Bot, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { MistralService } from '@/services/mistralService';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SearchPopup: React.FC<SearchPopupProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const { isDarkMode, openWindow } = useOS();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'pdf' | 'ppt' | 'sheets' | null>(null);

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

    // SPCPL (Shapoorji Pallonji Company) related queries
    if (lowerQuery === 'spcpl' || lowerQuery.includes('shapoorji pallonji') || lowerQuery.includes('shapoorji palonji')) {
      return '**SPCPL (Shapoorji Pallonji Company Limited)** is one of India\'s largest and most respected construction and engineering conglomerates.\nFounded in 1865, the company has been instrumental in building India\'s infrastructure for over 150 years.\nSPCPL is known for iconic projects including the Gateway of India, Taj Hotels, and numerous high-rise buildings across major Indian cities.\nThe company operates across multiple sectors including construction, real estate, water, energy, and infrastructure development.\nWith a legacy of excellence and innovation, SPCPL continues to shape India\'s urban landscape and infrastructure development.';
    }

    if (lowerQuery.includes('satyanaraya bodapati') || lowerQuery.includes('satyanarayan bodapati') || (lowerQuery.includes('spcpl') && lowerQuery.includes('senior manager'))) {
      return '**Satyanaraya Bodapati** is a Senior Manager at SPCPL (Shapoorji Pallonji Company Limited).\nAs a senior management professional, he plays a crucial role in the company\'s operations and strategic initiatives.\nSPCPL, being one of India\'s premier construction and engineering companies, relies on experienced leaders like Satyanaraya Bodapati to drive excellence in project execution and management.\nHis expertise contributes to SPCPL\'s continued success in delivering world-class infrastructure and construction projects across India.';
    }

    if (lowerQuery.includes('laxman agarwal') || (lowerQuery.includes('spcpl') && lowerQuery.includes('south zone head'))) {
      return '**Laxman Agarwal** serves as the South Zone Head at SPCPL (Shapoorji Pallonji Company Limited).\nIn his leadership role, he oversees SPCPL\'s operations and business development across the southern regions of India.\nAs South Zone Head, Laxman Agarwal is responsible for managing key projects, client relationships, and strategic growth initiatives in states like Karnataka, Tamil Nadu, Andhra Pradesh, Telangana, and Kerala.\nHis leadership ensures SPCPL maintains its reputation for excellence in construction and infrastructure development across South India.\nUnder his guidance, the South Zone continues to contribute significantly to SPCPL\'s overall growth and market presence.';
    }

    if (lowerQuery.includes('spcpl senior manager') && lowerQuery.includes('south zone head')) {
      return '**SPCPL Leadership Team:**\n\n**Satyanaraya Bodapati** - Senior Manager at SPCPL\n• Experienced management professional driving operational excellence\n• Contributes to strategic initiatives and project management\n• Plays a key role in SPCPL\'s continued growth and success\n\n**Laxman Agarwal** - South Zone Head at SPCPL\n• Leads SPCPL\'s operations across South India\n• Oversees business development and key projects in southern states\n• Manages client relationships and strategic growth initiatives\n• Ensures excellence in construction and infrastructure development\n\nBoth leaders are integral to SPCPL\'s mission of building India\'s infrastructure and maintaining the company\'s 150+ year legacy of excellence in construction and engineering.';
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

    const apiKey = 'AIzaSyCrAmAtN7ZALrSpPzHTF9AjIVUJ-wmgJmA';
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log('Starting search for:', searchQuery);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please provide a concise and accurate answer to this question: ${searchQuery}`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          }
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response received:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        setResult(data.candidates[0].content.parts[0].text);
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
        // Fallback response for any API errors
        setResult(`I found some information about "${searchQuery}". The AI search service is currently experiencing issues, but I can still help you with questions about Aczen, Aczen OS, or the Aczen team.\n\nTry searching for "Aczen OS" or "Aczen" for detailed information about our platform.`);
        setError('');
      }
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
    setIsGenerating(false);
    setGeneratingType(null);
    onClose();
  };

  const testMistralAPI = async () => {
    setIsGenerating(true);
    setError('');
    setResult('Testing Mistral API connection...');

    try {
      const testContent = await MistralService.generateQuickContent('Say hello and confirm the API is working');
      setResult(`✅ Mistral API is working! Response: ${testContent}`);
    } catch (err) {
      console.error('Mistral API test failed:', err);
      setError(`❌ Mistral API test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };



  const handleGenerateDocument = async (type: 'pdf' | 'ppt' | 'sheets') => {
    if (!query.trim()) {
      setError('Please enter a prompt to generate the document');
      return;
    }

    setIsGenerating(true);
    setGeneratingType(type);
    setError('');

    try {
      const content = await MistralService.generateDocument({
        type,
        prompt: query,
        title: `AI Generated ${type.toUpperCase()}`,
      });

      // Open the generated content in the appropriate editor
      switch (type) {
        case 'pdf':
          // Import and open OnlyOffice Writer with the generated content
          import('./apps/OnlyOfficeWriter').then((module) => {
            const OnlyOfficeWriter = module.default;
            openWindow({
              id: `writer-${Date.now()}`,
              title: `${content.title} - Writer`,
              component: () => <OnlyOfficeWriter initialContent={content} />,
            });
          });
          break;
        
        case 'ppt':
          // Import and open OnlyOffice Impress with the generated content
          import('./apps/OnlyOfficeImpress').then((module) => {
            const OnlyOfficeImpress = module.default;
            openWindow({
              id: `impress-${Date.now()}`,
              title: `${content.title} - Presentation`,
              component: () => <OnlyOfficeImpress initialContent={content} />,
            });
          });
          break;
        
        case 'sheets':
          // Import and open OnlyOffice Calc with the generated content
          import('./apps/OnlyOfficeCalc').then((module) => {
            const OnlyOfficeCalc = module.default;
            openWindow({
              id: `calc-${Date.now()}`,
              title: `${content.title} - Spreadsheet`,
              component: () => <OnlyOfficeCalc initialContent={content} />,
            });
          });
          break;
      }

      // Show success message briefly before closing
      setResult(`✅ ${content.title} has been generated and opened in ${type === 'pdf' ? 'Writer' : type === 'ppt' ? 'Presentation' : 'Spreadsheet'} for editing!`);
      
      // Close the search popup after a brief delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Document generation error:', err);
      setError(err instanceof Error ? err.message : `Failed to generate ${type}. Please check your Mistral API key and try again.`);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
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
          <form onSubmit={handleSubmit} className="flex space-x-3 mb-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything or describe what you want to generate..."
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

          {/* AI Generation Section */}
          <div className="space-y-4">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Generate documents with AI:
            </div>
            
            {/* AI Suggestions */}
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span>💡 AI Suggestions:</span>
                <button
                  onClick={testMistralAPI}
                  disabled={isGenerating}
                  className={`px-2 py-1 text-xs rounded-lg ${
                    isGenerating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Test API
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <span>• "Create a business plan for a coffee shop"</span>
                <span>• "Make a presentation about renewable energy"</span>
                <span>• "Generate a budget spreadsheet for a startup"</span>
                <span>• "Write a project proposal for mobile app development"</span>
                <span>• "Create a marketing strategy document"</span>
              </div>
            </div>
            
            {/* Document Generation Buttons - 3cm height with corner radius */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleGenerateDocument('pdf')}
                disabled={isGenerating || !query.trim()}
                className={`h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                  isGenerating && generatingType === 'pdf'
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : isGenerating || !query.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-white'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-900'
                } hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                {isGenerating && generatingType === 'pdf' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                ) : null}
                <span className="text-lg font-semibold">PDF Document</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {isGenerating && generatingType === 'pdf' ? 'Generating...' : 'Generate & Edit'}
                </span>
              </button>

              <button
                onClick={() => handleGenerateDocument('ppt')}
                disabled={isGenerating || !query.trim()}
                className={`h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                  isGenerating && generatingType === 'ppt'
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : isGenerating || !query.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-white'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-900'
                } hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                {isGenerating && generatingType === 'ppt' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                ) : null}
                <span className="text-lg font-semibold">Presentation</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {isGenerating && generatingType === 'ppt' ? 'Generating...' : 'Generate & Edit'}
                </span>
              </button>

              <button
                onClick={() => handleGenerateDocument('sheets')}
                disabled={isGenerating || !query.trim()}
                className={`h-28 flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                  isGenerating && generatingType === 'sheets'
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : isGenerating || !query.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-white'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-900'
                } hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                {isGenerating && generatingType === 'sheets' ? (
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                ) : null}
                <span className="text-lg font-semibold">Spreadsheet</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {isGenerating && generatingType === 'sheets' ? 'Generating...' : 'Generate & Edit'}
                </span>
              </button>
            </div>
          </div>


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
          ) : isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <Wand2 className="w-6 h-6 animate-pulse text-purple-500 mr-2" />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Generating {generatingType === 'pdf' ? 'PDF document' : generatingType === 'ppt' ? 'presentation' : 'spreadsheet'} with AI...
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
