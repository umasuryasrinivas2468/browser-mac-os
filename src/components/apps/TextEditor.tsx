
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileText, Upload, Save, Download, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const TextEditor: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

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
          <span className="text-sm">New</span>
        </button>
        
        <label className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload</span>
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
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">Save</span>
            </button>

            <button
              onClick={handleDownload}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download</span>
            </button>
          </>
        )}

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Formatting Tools */}
        {isEditing && (
          <>
            <button onClick={() => formatText('bold')} className="p-1 rounded hover:bg-gray-200">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('italic')} className="p-1 rounded hover:bg-gray-200">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('underline')} className="p-1 rounded hover:bg-gray-200">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('justifyLeft')} className="p-1 rounded hover:bg-gray-200">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('justifyCenter')} className="p-1 rounded hover:bg-gray-200">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => formatText('justifyRight')} className="p-1 rounded hover:bg-gray-200">
              <AlignRight className="w-4 h-4" />
            </button>
          </>
        )}

        {currentFile && (
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${
            isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            <FileText className="w-4 h-4" />
            <span className="text-sm">{fileName}</span>
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

        {/* Text Editor */}
        <div className="flex-1 relative">
          {isEditing ? (
            <div
              ref={editorRef}
              contentEditable
              className={`w-full h-full p-6 outline-none ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
              }`}
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', lineHeight: '1.6' }}
              suppressContentEditableWarning={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
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
