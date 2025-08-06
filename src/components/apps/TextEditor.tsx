import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Save, FileText, WrapText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TextEditor: React.FC = () => {
  const { isDarkMode } = useOS();
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [saveAsType, setSaveAsType] = useState<'txt' | 'pdf' | 'ppt'>('txt');

  const handleSaveClick = () => {
    setShowSaveDialog(true);
    setFileName('untitled');
    setSaveAsType('txt');
  };

  const handleSaveFile = () => {
    if (!fileName.trim()) return;

    const fileStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');
    
    // Ensure Documents folder exists
    if (!fileStructure.Home) fileStructure.Home = { type: 'folder', children: {} };
    if (!fileStructure.Home.children) fileStructure.Home.children = {};
    if (!fileStructure.Home.children.Documents) {
      fileStructure.Home.children.Documents = { type: 'folder', children: {} };
    }
    if (!fileStructure.Home.children.Documents.children) {
      fileStructure.Home.children.Documents.children = {};
    }

    let fileContent = content;
    let fileExtension = '.txt';

    if (saveAsType === 'pdf') {
      fileContent = `PDF_DOCUMENT:${fileName}\n\n${content}`;
      fileExtension = '.pdf';
    } else if (saveAsType === 'ppt') {
      fileContent = `PPT_DOCUMENT:${fileName}\n\n${content}`;
      fileExtension = '.ppt';
    }

    const finalFileName = fileName + fileExtension;
    fileStructure.Home.children.Documents.children[finalFileName] = {
      type: 'file',
      content: fileContent,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    setShowSaveDialog(false);
    setFileName('');
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSaveClick} size="sm" variant="ghost">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={() => setContent('')} size="sm" variant="ghost">
            <FileText className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Font Size:</span>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className={`px-2 py-1 rounded border ${
              isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>
          
          <Button
            onClick={() => setWordWrap(!wordWrap)}
            size="sm"
            variant={wordWrap ? "default" : "ghost"}
          >
            <WrapText className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`w-full h-full p-4 border-none outline-none resize-none font-mono ${
            isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
          style={{
            fontSize: `${fontSize}px`,
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          }}
          placeholder="Start typing..."
        />
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h3 className="text-lg font-semibold mb-4">Save File</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">File Name:</label>
                <Input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter filename"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Save as:</label>
                <Select value={saveAsType} onValueChange={(value: 'txt' | 'pdf' | 'ppt') => setSaveAsType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">Text File (.txt)</SelectItem>
                    <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                    <SelectItem value="ppt">PowerPoint (.ppt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFile}
                size="sm"
                disabled={!fileName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
