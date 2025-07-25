
import React from 'react';
import { OSProvider, useOS } from '@/contexts/OSContext';
import LockScreen from '@/components/LockScreen';
import Desktop from '@/components/Desktop';

const OSContent: React.FC = () => {
  const { isLocked } = useOS();

  return (
    <>
      {isLocked ? <LockScreen /> : <Desktop />}
    </>
  );
};

const Index: React.FC = () => {
  return (
    <OSProvider>
      <OSContent />
    </OSProvider>
  );
};

export default Index;
