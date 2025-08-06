
import React, { useState, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Save, 
  FileText, 
  WrapText, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Upload,
  Image,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TextEditor: React.FC = () => {
  const { isDarkMode } = useOS();
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [wordWrap, setWordWrap] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [saveAsType, setSaveAsType] = useState<'txt' | 'pdf' | 'ppt'>('txt');
  const [alignment, setAlignment] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLImageElement>(null);

  const handleSaveClick = () => {
    setShowSaveDialog(true);
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

  const updateHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateHistory(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setContent(fileContent);
        updateHistory(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const handleImageAttach = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const imageTag = `\n[IMAGE: ${file.name}]\n`;
        const newContent = content + imageTag;
        setContent(newContent);
        updateHistory(newContent);
      };
      reader.readAsDataURL(file);
    }
  };

  const getTextStyle = () => ({
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    color: textColor,
    textAlign: alignment as 'left' | 'center' | 'right',
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderline ? 'underline' : 'none',
    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
  });

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
          <Button onClick={handleFileImport} size="sm" variant="ghost">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleUndo} size="sm" variant="ghost" disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button onClick={handleRedo} size="sm" variant="ghost" disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Format Toolbar */}
      <div className={`flex items-center space-x-2 p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className={`px-2 py-1 rounded border ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>
        
        <select
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className={`px-2 py-1 rounded border ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value={8}>8px</option>
          <option value={10}>10px</option>
          <option value={12}>12px</option>
          <option value={14}>14px</option>
          <option value={16}>16px</option>
          <option value={18}>18px</option>
          <option value={20}>20px</option>
          <option value={24}>24px</option>
          <option value={28}>28px</option>
          <option value={32}>32px</option>
        </select>

        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
          title="Text Color"
        />

        <Button
          onClick={() => setIsBold(!isBold)}
          size="sm"
          variant={isBold ? "default" : "ghost"}
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => setIsItalic(!isItalic)}
          size="sm"
          variant={isItalic ? "default" : "ghost"}
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => setIsUnderline(!isUnderline)}
          size="sm"
          variant={isUnderline ? "default" : "ghost"}
        >
          <Underline className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => setAlignment('left')}
          size="sm"
          variant={alignment === 'left' ? "default" : "ghost"}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => setAlignment('center')}
          size="sm"
          variant={alignment === 'center' ? "default" : "ghost"}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => setAlignment('right')}
          size="sm"
          variant={alignment === 'right' ? "default" : "ghost"}
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <Button onClick={handleImageAttach} size="sm" variant="ghost">
          <Image className="w-4 h-4" />
        </Button>

        <Button
          onClick={() => setWordWrap(!wordWrap)}
          size="sm"
          variant={wordWrap ? "default" : "ghost"}
        >
          <WrapText className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          className={`w-full h-full p-4 border-none outline-none resize-none ${
            isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
          style={getTextStyle()}
          placeholder="Start typing..."
        />
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

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
