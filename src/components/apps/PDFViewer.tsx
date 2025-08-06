
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { X } from 'lucide-react';

interface PDFViewerProps {
  fileName: string;
  content: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileName, content, onClose }) => {
  const { isDarkMode } = useOS();

  // Extract title and content from the PDF_DOCUMENT format
  const lines = content.split('\n');
  const title = lines[0]?.replace('PDF_DOCUMENT:', '') || fileName;
  const documentContent = lines.slice(2).join('\n') || content;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-full max-w-4xl h-5/6 flex flex-col rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-auto p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <div className={`max-w-none mx-auto p-8 shadow-lg rounded-lg ${
            isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}>
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
            <div className="whitespace-pre-wrap leading-relaxed">
              {documentContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
