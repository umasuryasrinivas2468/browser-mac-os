
import React from 'react';
import { MessageSquare } from 'lucide-react';

const CommentPanel: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <MessageSquare className="w-5 h-5 mr-2" />
        <h3 className="font-medium">Comments</h3>
      </div>
      <p className="text-sm text-gray-600">Comments feature coming soon...</p>
    </div>
  );
};

export default CommentPanel;
