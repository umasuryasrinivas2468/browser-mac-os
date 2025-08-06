
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Save,
  FileDown,
  Type,
  Palette,
  Undo,
  Redo,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';

interface TextEditorProps {
  initialFileName?: string;
}

interface FileItem {
  type: 'file' | 'folder';
  children?: { [key: string]: FileItem };
  content?: string;
  savedAt?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialFileName }) => {
  const { isDarkMode } = useOS();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState(initialFileName || 'Untitled Document');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load file content if initialFileName is provided
  useEffect(() => {
    if (initialFileName) {
      const fileStructureStr = localStorage.getItem('filemanager_structure');
      if (!fileStructureStr) return;
      
      try {
        const fileStructure = JSON.parse(fileStructureStr) as { [key: string]: FileItem };
        
        // Search for the file in the structure
        const findFile = (structure: { [key: string]: FileItem }, path: string[] = []): string | null => {
          for (const [key, value] of Object.entries(structure)) {
            if (key === initialFileName && value.type === 'file') {
              return value.content || '';
            }
            if (value.type === 'folder' && value.children) {
              const result = findFile(value.children, [...path, key]);
              if (result !== null) return result;
            }
          }
          return null;
        };

        const fileContent = findFile(fileStructure);
        if (fileContent) {
          setContent(fileContent);
          setHistory([fileContent]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Error parsing file structure:', error);
      }
    }
  }, [initialFileName]);

  // Add to history when content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Add to history if it's different from current
    if (history[historyIndex] !== newContent) {
      const newHistory = [...history.slice(0, historyIndex + 1), newContent];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const toggleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        setIsBold(!isBold);
        break;
      case 'italic':
        setIsItalic(!isItalic);
        break;
      case 'underline':
        setIsUnderline(!isUnderline);
        break;
      default:
        break;
    }
  };

  const setAlignment = (align: string) => {
    setTextAlign(align);
  };

  const saveFile = () => {
    const fileStructureStr = localStorage.getItem('filemanager_structure');
    if (!fileStructureStr) return;
    
    try {
      const fileStructure = JSON.parse(fileStructureStr) as { [key: string]: FileItem };

      // Find and update the file in the structure
      const updateFile = (structure: { [key: string]: FileItem }, path: string[] = []): boolean => {
        for (const [key, value] of Object.entries(structure)) {
          if (key === fileName && value.type === 'file') {
            value.content = content;
            value.savedAt = new Date().toISOString();
            return true;
          }
          if (value.type === 'folder' && value.children) {
            const result = updateFile(value.children, [...path, key]);
            if (result) return result;
          }
        }
        return false;
      };

      // If file doesn't exist, create it in Documents
      const fileExists = updateFile(fileStructure);
      if (!fileExists && fileStructure.Home?.children?.Documents?.children) {
        fileStructure.Home.children.Documents.children[fileName + '.txt'] = {
          type: 'file',
          content: content,
          savedAt: new Date().toISOString()
        };
      }

      localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    } catch (error) {
      console.error('Error updating file structure:', error);
    }
  };

  const saveAsPDF = () => {
    const pdf = new jsPDF();
    const lines = content.split('\n');
    let yPosition = 20;
    
    lines.forEach((line) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 10;
    });

    // Save to Downloads folder in file structure
    const fileStructureStr = localStorage.getItem('filemanager_structure');
    if (fileStructureStr) {
      try {
        const fileStructure = JSON.parse(fileStructureStr) as { [key: string]: FileItem };
        const pdfFileName = `${fileName}.pdf`;
        
        // Navigate to Downloads folder and add the PDF
        if (fileStructure.Home?.children?.Downloads?.children) {
          fileStructure.Home.children.Downloads.children[pdfFileName] = {
            type: 'file',
            content: content,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
        }
      } catch (error) {
        console.error('Error saving PDF to file structure:', error);
      }
    }
  };

  const saveAsDoc = () => {
    // Save to Downloads folder in file structure
    const fileStructureStr = localStorage.getItem('filemanager_structure');
    if (fileStructureStr) {
      try {
        const fileStructure = JSON.parse(fileStructureStr) as { [key: string]: FileItem };
        const docFileName = `${fileName}.doc`;
        
        // Navigate to Downloads folder and add the DOC
        if (fileStructure.Home?.children?.Downloads?.children) {
          fileStructure.Home.children.Downloads.children[docFileName] = {
            type: 'file',
            content: content,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
        }
      } catch (error) {
        console.error('Error saving DOC to file structure:', error);
      }
    }
  };

  const importFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setContent(fileContent);
        setFileName(file.name.split('.')[0]);
        handleContentChange(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const getTextStyle = () => {
    return {
      fontSize: `${fontSize}px`,
      fontFamily,
      color: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecoration: isUnderline ? 'underline' : 'none',
      textAlign: textAlign as 'left' | 'center' | 'right',
      lineHeight: '1.6'
    };
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex-wrap`}>
        {/* Undo/Redo */}
        <Button onClick={undo} size="sm" variant="ghost" disabled={historyIndex <= 0}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button onClick={redo} size="sm" variant="ghost" disabled={historyIndex >= history.length - 1}>
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-gray-400" />
        
        {/* Text Formatting */}
        <Button 
          onClick={() => toggleFormat('bold')} 
          size="sm" 
          variant={isBold ? "default" : "ghost"}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => toggleFormat('italic')} 
          size="sm" 
          variant={isItalic ? "default" : "ghost"}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => toggleFormat('underline')} 
          size="sm" 
          variant={isUnderline ? "default" : "ghost"}
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-gray-400" />
        
        {/* Alignment */}
        <Button 
          onClick={() => setAlignment('left')} 
          size="sm" 
          variant={textAlign === 'left' ? "default" : "ghost"}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => setAlignment('center')} 
          size="sm" 
          variant={textAlign === 'center' ? "default" : "ghost"}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => setAlignment('right')} 
          size="sm" 
          variant={textAlign === 'right' ? "default" : "ghost"}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-gray-400" />
        
        {/* Font Controls */}
        <select
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className={`bg-transparent border rounded-md px-2 py-1 text-sm ${isDarkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-700'}`}
        >
          {[12, 14, 16, 18, 20, 24, 30, 36].map((size) => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className={`bg-transparent border rounded-md px-2 py-1 text-sm ${isDarkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-700'}`}
        >
          {['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="h-8 w-8 rounded-md border-none cursor-pointer"
          title="Text Color"
        />
        <div className="w-px h-5 bg-gray-400" />
        
        {/* File Operations */}
        <Button onClick={importFile} size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button onClick={saveFile} size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button onClick={saveAsPDF} size="sm" variant="outline">
          <FileDown className="w-4 h-4 mr-2" />
          Save as PDF
        </Button>
        <Button onClick={saveAsDoc} size="sm" variant="outline">
          <FileDown className="w-4 h-4 mr-2" />
          Save as DOC
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.doc,.docx"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Text Area */}
      <div className="flex-1 p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing your document..."
          className={`w-full h-full resize-none border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-800 text-white border-gray-600' 
              : 'bg-white text-gray-900 border-gray-300'
          }`}
          style={getTextStyle()}
        />
      </div>
    </div>
  );
};

export default TextEditor;
