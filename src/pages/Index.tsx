
import React from 'react';
import { OSProvider } from '@/contexts/OSContext';
import AuthWrapper from '@/components/AuthWrapper';

const Index: React.FC = () => {
  return (
    <OSProvider>
      <AuthWrapper />
    </OSProvider>
  );
};

export default Index;
