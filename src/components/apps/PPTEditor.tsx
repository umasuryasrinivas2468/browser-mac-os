
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { X, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PPTEditorProps {
  fileName: string;
  content: string;
  onClose: () => void;
  onSave?: (newContent: string) => void;
}

const PPTEditor: React.FC<PPTEditorProps> = ({ fileName, content, onClose, onSave }) => {
  const { isDarkMode } = useOS();

  // Extract title and content from the PPT_DOCUMENT format
  const lines = content.split('\n');
  const title = lines[0]?.replace('PPT_DOCUMENT:', '') || fileName;
  const initialContent = lines.slice(2).join('\n') || content;
  
  const [editableContent, setEditableContent] = useState(initialContent);
  const [presentationTitle, setPresentationTitle] = useState(title);

  const handleSave = () => {
    const newContent = `PPT_DOCUMENT:${presentationTitle}\n\n${editableContent}`;
    onSave?.(newContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-full max-w-5xl h-5/6 flex flex-col rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <input
            type="text"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            className={`text-lg font-semibold bg-transparent border-none outline-none ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          />
          <div className="flex items-center space-x-2">
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className={`flex-1 flex ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {/* Slide Preview */}
          <div className="w-1/3 p-4 border-r border-gray-300 dark:border-gray-600">
            <h3 className="text-sm font-medium mb-3">Slide Preview</h3>
            <div className={`w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
            }`}>
              <div className="text-center p-4">
                <h4 className="font-bold text-lg mb-2">{presentationTitle}</h4>
                <div className="text-sm opacity-75 line-clamp-6">
                  {editableContent.substring(0, 200)}...
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium mb-3">Slide Content</h3>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              placeholder="Enter your presentation content here..."
              className={`w-full h-full resize-none border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPTEditor;
