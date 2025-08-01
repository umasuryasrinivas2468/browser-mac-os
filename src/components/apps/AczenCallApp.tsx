
import React from 'react';

const AczenCallApp: React.FC = () => {
  return (
    <div className="w-full h-full">
      <iframe
        src="https://aczenconnect3.vercel.app/create"
        className="w-full h-full border-0"
        title="Aczen Call"
        allow="camera; microphone; display-capture"
      />
    </div>
  );
};

export default AczenCallApp;
