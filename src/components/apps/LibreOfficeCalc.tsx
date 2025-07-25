
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileSpreadsheet, Upload, Save } from 'lucide-react';

const LibreOfficeCalc: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock LibreOffice Online instance URL (replace with actual instance)
  const COLLABORA_BASE_URL = 'https://demo.collaboraonline.com/loleaflet/dist/loleaflet.html';

  const handleNewSpreadsheet = () => {
    setIsLoading(true);
    const fileName = `spreadsheet_${Date.now()}.ods`;
    setCurrentFile(fileName);
    localStorage.setItem(`libreoffice_${fileName}`, JSON.stringify({
      name: fileName,
      type: 'calc',
      created: new Date().toISOString(),
      content: ''
    }));
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const fileName = file.name;
      setCurrentFile(fileName);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem(`libreoffice_${fileName}`, JSON.stringify({
          name: fileName,
          type: 'calc',
          created: new Date().toISOString(),
          content: e.target?.result
        }));
        setTimeout(() => setIsLoading(false), 1000);
      };
      reader.readAsText(file);
    }
  };

  const getSavedFiles = () => {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('libreoffice_')) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key) || '{}');
          if (fileData.type === 'calc') {
            files.push(fileData);
          }
        } catch (e) {
          console.error('Error parsing file data:', e);
        }
      }
    }
    return files;
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <button
          onClick={handleNewSpreadsheet}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-sm">New Spreadsheet</span>
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
            accept=".ods,.xls,.xlsx"
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
            Recent Spreadsheets
          </h3>
          <div className="space-y-2">
            {getSavedFiles().map((file, index) => (
              <button
                key={index}
                onClick={() => setCurrentFile(file.name)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                  currentFile === file.name
                    ? 'bg-green-500 text-white'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LibreOffice Embed */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : currentFile ? (
            <iframe
              src={`${COLLABORA_BASE_URL}?file_path=${encodeURIComponent(currentFile)}&permission=edit`}
              className="w-full h-full border-none"
              title="LibreOffice Calc"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  LibreOffice Calc
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a new spreadsheet or open an existing one
                </p>
                <button
                  onClick={handleNewSpreadsheet}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create New Spreadsheet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibreOfficeCalc;
