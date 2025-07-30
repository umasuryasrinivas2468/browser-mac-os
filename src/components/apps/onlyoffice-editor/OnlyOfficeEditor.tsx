
import React from 'react';
import { FileText } from 'lucide-react';

const OnlyOfficeEditor: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">OnlyOffice Editor</h3>
        <p className="text-gray-600">Document editor coming soon...</p>
      </div>
    </div>
  );
};

export default OnlyOfficeEditor;
