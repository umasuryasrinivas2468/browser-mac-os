
import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileText, Upload, Save, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    DocsAPI: any;
  }
}

interface OnlyOfficeWriterProps {
  initialContent?: any;
}

const OnlyOfficeWriter: React.FC<OnlyOfficeWriterProps> = ({ initialContent }) => {
  const { isDarkMode } = useOS();
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const docEditorRef = useRef<any>(null);

  useEffect(() => {
    // Check if API is already loaded
    if (window.DocsAPI) {
      setApiLoaded(true);
      // If we have initial content, create a document with it
      if (initialContent) {
        setTimeout(() => {
          handleNewDocumentWithContent(initialContent);
        }, 500);
      }
      return;
    }

    // Load ONLYOFFICE API script
    if (!document.getElementById('onlyoffice-api')) {
      const script = document.createElement('script');
      script.id = 'onlyoffice-api';
      script.src = 'https://documentserver.onlyoffice.com/web-apps/apps/api/documents/api.js';
      script.onload = () => {
        console.log('ONLYOFFICE API loaded successfully');
        setApiLoaded(true);
        setError(null);
        // If we have initial content, create a document with it
        if (initialContent) {
          setTimeout(() => {
            handleNewDocumentWithContent(initialContent);
          }, 1000);
        }
      };
      script.onerror = () => {
        console.error('Failed to load ONLYOFFICE API');
        setError('Failed to load ONLYOFFICE API. Please check your internet connection.');
      };
      document.head.appendChild(script);
    }
  }, [initialContent]);

  const initializeEditor = (fileName: string, isNew: boolean = false) => {
    if (!window.DocsAPI || !editorRef.current) {
      setError('ONLYOFFICE API not available');
      setIsLoading(false);
      return;
    }

    // Destroy existing editor
    if (docEditorRef.current) {
      try {
        docEditorRef.current.destroyEditor();
      } catch (e) {
        console.log('Editor destroy error (expected):', e);
      }
    }

    const config = {
      document: {
        fileType: 'docx',
        key: `${fileName}_${Date.now()}`,
        title: fileName,
        url: '', // Empty for new documents
        permissions: {
          edit: true,
          download: true,
          print: true,
          review: true
        }
      },
      documentType: 'text',
      editorConfig: {
        mode: 'edit',
        lang: 'en',
        user: {
          id: 'user1',
          name: 'User'
        },
        customization: {
          autosave: false,
          forcesave: false,
          compactToolbar: true,
          toolbar: true,
          statusBar: true
        }
      },
      width: '100%',
      height: '100%',
      events: {
        onAppReady: () => {
          console.log('ONLYOFFICE Writer is ready');
          setIsLoading(false);
          setError(null);
        },
        onDocumentReady: () => {
          console.log('Document is ready');
          setIsLoading(false);
          setError(null);
        },
        onError: (error: any) => {
          console.error('ONLYOFFICE error:', error);
          setError(`Editor error: ${error.message || 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    };

    try {
      docEditorRef.current = new window.DocsAPI.DocEditor(editorRef.current, config);
    } catch (e) {
      console.error('Failed to initialize editor:', e);
      setError('Failed to initialize editor');
      setIsLoading(false);
    }
  };

  const handleNewDocument = () => {
    if (!apiLoaded) {
      setError('ONLYOFFICE API not loaded yet. Please wait...');
      return;
    }

    setIsLoading(true);
    setError(null);
    const fileName = `document_${Date.now()}.docx`;
    setCurrentFile(fileName);
    
    localStorage.setItem(`onlyoffice_${fileName}`, JSON.stringify({
      name: fileName,
      type: 'writer',
      created: new Date().toISOString(),
      content: ''
    }));

    setTimeout(() => {
      initializeEditor(fileName, true);
    }, 500);
  };

  const handleNewDocumentWithContent = (content: any) => {
    if (!apiLoaded) {
      setError('ONLYOFFICE API not loaded yet. Please wait...');
      return;
    }

    setIsLoading(true);
    setError(null);
    const fileName = `${content.title || 'AI Generated Document'}_${Date.now()}.docx`;
    setCurrentFile(fileName);
    
    // Convert the AI generated content to a format suitable for the document
    let documentContent = '';
    if (content.sections && Array.isArray(content.sections)) {
      documentContent = content.sections
        .map((section: any) => `${section.title}\n\n${section.content}\n\n`)
        .join('');
    } else {
      documentContent = typeof content.content === 'string' 
        ? content.content 
        : JSON.stringify(content.content, null, 2);
    }
    
    localStorage.setItem(`onlyoffice_${fileName}`, JSON.stringify({
      name: fileName,
      type: 'writer',
      created: new Date().toISOString(),
      content: documentContent,
      aiGenerated: true,
      originalContent: content
    }));

    setTimeout(() => {
      initializeEditor(fileName, true);
    }, 500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!apiLoaded) {
      setError('ONLYOFFICE API not loaded yet. Please wait...');
      return;
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Please upload a DOCX or DOC file');
      return;
    }

    setIsLoading(true);
    setError(null);
    const fileName = file.name;
    setCurrentFile(fileName);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      localStorage.setItem(`onlyoffice_${fileName}`, JSON.stringify({
        name: fileName,
        type: 'writer',
        created: new Date().toISOString(),
        content: fileData
      }));
      
      setTimeout(() => {
        initializeEditor(fileName);
      }, 500);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const getSavedFiles = () => {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('onlyoffice_')) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key) || '{}');
          if (fileData.type === 'writer') {
            files.push(fileData);
          }
        } catch (e) {
          console.error('Error parsing file data:', e);
        }
      }
    }
    return files;
  };

  const handleFileSelect = (file: any) => {
    if (!apiLoaded) {
      setError('ONLYOFFICE API not loaded yet. Please wait...');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentFile(file.name);
    setTimeout(() => {
      initializeEditor(file.name);
    }, 500);
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <button
          onClick={handleNewDocument}
          disabled={!apiLoaded || isLoading}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            (!apiLoaded || isLoading)
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">New Document</span>
        </button>
        
        <label className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
          (!apiLoaded || isLoading)
            ? 'bg-gray-400 cursor-not-allowed'
            : isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload DOCX</span>
          <input
            type="file"
            accept=".docx,.doc"
            onChange={handleFileUpload}
            disabled={!apiLoaded || isLoading}
            className="hidden"
          />
        </label>

        {currentFile && (
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            <Save className="w-4 h-4" />
            <span className="text-sm">{currentFile}</span>
          </div>
        )}

        {!apiLoaded && (
          <div className="flex items-center space-x-1 px-3 py-1.5 text-sm text-yellow-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span>Loading API...</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* File Browser Sidebar */}
        <div className={`w-64 border-r p-3 ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Documents
          </h3>
          <div className="space-y-2">
            {getSavedFiles().map((file, index) => (
              <button
                key={index}
                onClick={() => handleFileSelect(file)}
                disabled={!apiLoaded || isLoading}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                  !apiLoaded || isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : currentFile === file.name
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ONLYOFFICE Editor */}
        <div className="flex-1 relative">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Error
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {error}
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    if (currentFile) {
                      handleNewDocument();
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading editor...</p>
              </div>
            </div>
          ) : currentFile ? (
            <div ref={editorRef} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ONLYOFFICE Writer
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a new document or open an existing DOCX file
                </p>
                <button
                  onClick={handleNewDocument}
                  disabled={!apiLoaded}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !apiLoaded
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Create New Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlyOfficeWriter;
