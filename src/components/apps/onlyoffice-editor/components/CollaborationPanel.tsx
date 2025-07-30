
import React from 'react';
import { Users } from 'lucide-react';

const CollaborationPanel: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 mr-2" />
        <h3 className="font-medium">Collaboration</h3>
      </div>
      <p className="text-sm text-gray-600">Collaboration features coming soon...</p>
    </div>
  );
};

export default CollaborationPanel;
