
import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileText, Upload, Save, Download } from 'lucide-react';

declare global {
  interface Window {
    DocsAPI: any;
  }
}

const OnlyOfficeWriter: React.FC = () => {
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
        fileType: 'docx',
        key: `${fileName}_${Date.now()}`,
        title: fileName,
        url: fileData || '',
        permissions: {
          edit: true,
          download: true,
          print: true,
        },
      },
      documentType: 'text',
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
          console.log('Document ready');
        },
        onError: (error: any) => {
          console.error('ONLYOFFICE error:', error);
          setIsLoading(false);
        },
      },
    };

    docEditorRef.current = new window.DocsAPI.DocEditor(editorRef.current, config);
  };

  const handleNewDocument = () => {
    setIsLoading(true);
    const fileName = `document_${Date.now()}.docx`;
    setCurrentFile(fileName);
    
    // Create empty document data
    const emptyDocData = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,';
    
    localStorage.setItem(`onlyoffice_${fileName}`, JSON.stringify({
      name: fileName,
      type: 'writer',
      created: new Date().toISOString(),
      content: emptyDocData
    }));

    setTimeout(() => {
      initializeEditor(fileName, emptyDocData);
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
      setIsLoading(true);
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
          onClick={handleNewDocument}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">New Document</span>
        </button>
        
        <label className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload DOCX</span>
          <input
            type="file"
            accept=".docx,.doc"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {currentFile && (
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
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
            Recent Documents
          </h3>
          <div className="space-y-2">
            {getSavedFiles().map((file, index) => (
              <button
                key={index}
                onClick={() => handleFileSelect(file)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                  currentFile === file.name
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
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
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
