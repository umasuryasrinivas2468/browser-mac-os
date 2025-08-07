
import React from 'react';

const KrunkerGame: React.FC = () => {
  return (
    <div className="w-full h-full bg-black">
      <iframe
        src="https://krunker.io/?game=SIN:6rmj5"
        className="w-full h-full border-none"
        title="Krunker.io Game"
        allow="fullscreen; gamepad; microphone"
        allowFullScreen
      />
    </div>
  );
};

export default KrunkerGame;
