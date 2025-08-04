import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileText, Upload, Save, Download, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, FileDown } from 'lucide-react';

const TextEditor: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  const saveToDownloads = (fileName: string, content: string, type: 'text' | 'file') => {
    // Get existing file structure from localStorage
    const existingStructure = localStorage.getItem('filemanager_structure');
    let fileStructure = existingStructure ? JSON.parse(existingStructure) : {
      'Home': {
        type: 'folder',
        children: {
          'Desktop': { type: 'folder', children: {} },
          'Documents': { type: 'folder', children: {} },
          'Downloads': { type: 'folder', children: {} },
          'Pictures': { type: 'folder', children: {} },
          'Music': { type: 'folder', children: {} },
          'Videos': { type: 'folder', children: {} }
        }
      }
    };

    // Ensure Downloads folder exists
    if (!fileStructure.Home.children.Downloads) {
      fileStructure.Home.children.Downloads = { type: 'folder', children: {} };
    }

    // Add the file to Downloads
    fileStructure.Home.children.Downloads.children[fileName] = { 
      type: 'file',
      content: content,
      savedAt: new Date().toISOString()
    };

    // Save updated structure
    localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    
    // Also save individual file data for TextEditor compatibility
    localStorage.setItem(`texteditor_${fileName}`, JSON.stringify({
      name: fileName,
      type: type,
      created: new Date().toISOString(),
      content: content
    }));
  };

  const handleSaveAsPDF = () => {
    if (currentFile && editorRef.current) {
      const content = editorRef.current.innerHTML;
      const pdfFileName = currentFile.replace(/\.[^/.]+$/, '') + '.pdf';
      
      // Create a simple PDF-like content (in real app, you'd use a PDF library)
      const pdfContent = editorRef.current.innerText;
      
      saveToDownloads(pdfFileName, pdfContent, 'file');
      
      // Show success message
      alert(`File saved as ${pdfFileName} in Downloads folder!`);
    }
  };

  const handleSaveAsDOC = () => {
    if (currentFile && editorRef.current) {
      const content = editorRef.current.innerHTML;
      const docFileName = currentFile.replace(/\.[^/.]+$/, '') + '.docx';
      
      saveToDownloads(docFileName, content, 'file');
      
      // Show success message
      alert(`File saved as ${docFileName} in Downloads folder!`);
    }
  };

  const handleNewDocument = () => {
    const newFileName = `document_${Date.now()}.txt`;
    setCurrentFile(newFileName);
    setFileName(newFileName);
    setContent('');
    setIsEditing(true);
    
    // Save to localStorage
    localStorage.setItem(`texteditor_${newFileName}`, JSON.stringify({
      name: newFileName,
      type: 'text',
      created: new Date().toISOString(),
      content: ''
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      setCurrentFile(file.name);
      setFileName(file.name);
      setContent(fileContent);
      setIsEditing(true);
      
      localStorage.setItem(`texteditor_${file.name}`, JSON.stringify({
        name: file.name,
        type: 'text',
        created: new Date().toISOString(),
        content: fileContent
      }));
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (currentFile && editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      localStorage.setItem(`texteditor_${currentFile}`, JSON.stringify({
        name: currentFile,
        type: 'text',
        created: new Date().toISOString(),
        content: newContent
      }));
    }
  };

  const handleDownload = () => {
    if (currentFile && editorRef.current) {
      const element = document.createElement('a');
      const file = new Blob([editorRef.current.innerText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = currentFile;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const getSavedFiles = () => {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('texteditor_')) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key) || '{}');
          if (fileData.type === 'text') {
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
    setCurrentFile(file.name);
    setFileName(file.name);
    setContent(file.content);
    setIsEditing(true);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = file.content;
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+C, Ctrl+A, Ctrl+X
    if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'x')) {
      e.preventDefault();
      return false;
    }
  };

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between p-2 md:p-3 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`md:hidden p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={handleNewDocument}
            className={`flex items-center space-x-1 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-sm ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
          
          <label className={`flex items-center space-x-1 px-2 md:px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {currentFile && (
            <>
              <button
                onClick={handleSave}
                className={`flex items-center space-x-1 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={handleSaveAsDOC}
                className={`flex items-center space-x-1 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Save as DOC</span>
              </button>

              <button
                onClick={handleSaveAsPDF}
                className={`flex items-center space-x-1 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Save as PDF</span>
              </button>

              <button
                onClick={handleDownload}
                className={`flex items-center space-x-1 px-2 md:px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          )}
        </div>

        {/* Formatting Tools */}
        {isEditing && (
          <div className="flex items-center space-x-1">
            <button onClick={() => formatText('bold')} className="p-1 rounded hover:bg-gray-200">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('italic')} className="p-1 rounded hover:bg-gray-200">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('underline')} className="p-1 rounded hover:bg-gray-200">
              <Underline className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* File Browser Sidebar */}
        <div className={`${isSidebarOpen ? 'w-full md:w-64' : 'w-0'} ${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block border-r p-3 transition-all duration-300 ${
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

        {/* Text Editor */}
        <div className="flex-1 relative">
          {isEditing ? (
            <div
              ref={editorRef}
              contentEditable
              onContextMenu={handleContextMenu}
              onCopy={handleCopy}
              onKeyDown={handleKeyDown}
              className={`w-full h-full p-4 md:p-6 outline-none resize-none select-none ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
              }`}
              style={{ 
                fontFamily: 'Inter, system-ui, sans-serif', 
                fontSize: '14px', 
                lineHeight: '1.6',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              suppressContentEditableWarning={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <FileText className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Text Editor
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a new document or open an existing file
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

export default TextEditor;
