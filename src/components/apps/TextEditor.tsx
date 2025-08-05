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
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

interface TextEditorProps {
  initialFileName?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialFileName }) => {
  const { isDarkMode } = useOS();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState(initialFileName || 'Untitled Document');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load file content if initialFileName is provided
  useEffect(() => {
    if (initialFileName) {
      const fileStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');
      
      // Search for the file in the structure
      const findFile = (structure: any, path: string[] = []): any => {
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
      }
    }
  }, [initialFileName]);

  const formatText = (command: string, value?: string) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const applyFormat = (format: string) => {
    switch (format) {
      case 'bold':
        formatText('bold');
        break;
      case 'italic':
        formatText('italic');
        break;
      case 'underline':
        formatText('underline');
        break;
      case 'align-left':
        formatText('justifyLeft');
        break;
      case 'align-center':
        formatText('justifyCenter');
        break;
      case 'align-right':
        formatText('justifyRight');
        break;
      default:
        break;
    }
  };

  const saveFile = () => {
    const fileStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');

    // Find the file in the structure
    const updateFile = (structure: any, path: string[] = []) => {
      for (const [key, value] of Object.entries(structure)) {
        if (key === fileName && value.type === 'file') {
          value.content = content;
          return true;
        }
        if (value.type === 'folder' && value.children) {
          const result = updateFile(value.children, [...path, key]);
          if (result) return result;
        }
      }
      return false;
    };

    updateFile(fileStructure);
    localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <Button onClick={() => applyFormat('bold')} size="sm" variant="ghost">
          <Bold className="w-4 h-4" />
        </Button>
        <Button onClick={() => applyFormat('italic')} size="sm" variant="ghost">
          <Italic className="w-4 h-4" />
        </Button>
        <Button onClick={() => applyFormat('underline')} size="sm" variant="ghost">
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-gray-400" />
        <Button onClick={() => applyFormat('align-left')} size="sm" variant="ghost">
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button onClick={() => applyFormat('align-center')} size="sm" variant="ghost">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button onClick={() => applyFormat('align-right')} size="sm" variant="ghost">
          <AlignRight className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-gray-400" />
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
          {['Arial', 'Helvetica', 'Times New Roman', 'Courier New'].map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="h-8 w-8 rounded-md border-none"
        />
        <div className="w-px h-5 bg-gray-400" />
        <Button onClick={saveFile} size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your document..."
          className={`w-full h-full resize-none border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-800 text-white border-gray-600' 
              : 'bg-white text-gray-900 border-gray-300'
          }`}
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            color: textColor,
            lineHeight: '1.6'
          }}
        />
      </div>
    </div>
  );
};

export default TextEditor;
