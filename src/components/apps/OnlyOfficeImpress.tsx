
import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Presentation, Upload, Save } from 'lucide-react';

declare global {
  interface Window {
    DocsAPI: any;
  }
}

const OnlyOfficeImpress: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const docEditorRef = useRef<any>(null);

  useEffect(() => {
    // Load ONLYOFFICE API script
    if (!document.getElementById('onlyoffice-api')) {
      const script = document.createElement('script');
      script.id = 'onlyoffice-api';
      script.src = 'https://documentserver.onlyoffice.com/web-apps/apps/api/documents/api.js';
      script.onload = () => {
        console.log('ONLYOFFICE API loaded');
      };
      document.head.appendChild(script);
    }
  }, []);

  const initializeEditor = (fileName: string, fileData?: string) => {
    if (!window.DocsAPI || !editorRef.current) return;

    // Destroy existing editor
    if (docEditorRef.current) {
      docEditorRef.current.destroyEditor();
    }

    const config = {
      document: {
        fileType: 'pptx',
        key: `${fileName}_${Date.now()}`,
        title: fileName,
        url: fileData || '',
        permissions: {
          edit: true,
          download: true,
          print: true,
        },
      },
      documentType: 'slide',
      editorConfig: {
        mode: 'edit',
        lang: 'en',
        user: {
          id: 'user1',
          name: 'User',
        },
        customization: {
          autosave: true,
          forcesave: true,
          compactToolbar: true,
          theme: {
            id: isDarkMode ? 'theme-dark' : 'theme-classic-light',
          },
        },
      },
      width: '100%',
      height: '100%',
      events: {
        onDocumentReady: () => {
          setIsLoading(false);
          console.log('Presentation ready');
        },
        onError: (error: any) => {
          console.error('ONLYOFFICE error:', error);
          setIsLoading(false);
        },
      },
    };

    docEditorRef.current = new window.DocsAPI.DocEditor(editorRef.current, config);
  };

  const handleNewPresentation = () => {
    setIsLoading(true);
    const fileName = `presentation_${Date.now()}.pptx`;
    setCurrentFile(fileName);
    
    // Create empty presentation data
    const emptyPptxData = 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,';
    
    localStorage.setItem(`onlyoffice_${fileName}`, JSON.stringify({
      name: fileName,
      type: 'impress',
      created: new Date().toISOString(),
      content: emptyPptxData
    }));

    setTimeout(() => {
      initializeEditor(fileName, emptyPptxData);
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.pptx') || file.name.endsWith('.ppt'))) {
      setIsLoading(true);
      const fileName = file.name;
      setCurrentFile(fileName);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        localStorage.setItem(`onlyoffice_${fileName}`, JSON.stringify({
          name: fileName,
          type: 'impress',
          created: new Date().toISOString(),
          content: fileData
        }));
        
        setTimeout(() => {
          initializeEditor(fileName, fileData);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSavedFiles = () => {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('onlyoffice_')) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key) || '{}');
          if (fileData.type === 'impress') {
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
    setIsLoading(true);
    setCurrentFile(file.name);
    setTimeout(() => {
      initializeEditor(file.name, file.content);
    }, 1000);
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <button
          onClick={handleNewPresentation}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span className="text-sm">New Presentation</span>
        </button>
        
        <label className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload PPTX</span>
          <input
            type="file"
            accept=".pptx,.ppt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {currentFile && (
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'
          }`}>
            <Save className="w-4 h-4" />
            <span className="text-sm">{currentFile}</span>
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
            Recent Presentations
          </h3>
          <div className="space-y-2">
            {getSavedFiles().map((file, index) => (
              <button
                key={index}
                onClick={() => handleFileSelect(file)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                  currentFile === file.name
                    ? 'bg-orange-500 text-white'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span className="text-sm truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ONLYOFFICE Editor */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : currentFile ? (
            <div ref={editorRef} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Presentation className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ONLYOFFICE Impress
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a new presentation or open an existing PPTX file
                </p>
                <button
                  onClick={handleNewPresentation}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create New Presentation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlyOfficeImpress;
