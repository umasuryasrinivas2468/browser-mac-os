// Document Viewer Component - OnlyOffice iframe integration

import React, { useRef, useEffect, useState } from 'react';
import { DocumentMetadata, DocumentConfig } from '../types';
import { documentService } from '../services/documentService';
import { useCollaboration } from '../hooks/useCollaboration';
import { AlertCircle, Loader2 } from 'lucide-react';

interface DocumentViewerProps {
  document: DocumentMetadata;
  mode?: 'edit' | 'view';
  onDocumentReady?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  mode = 'edit',
  onDocumentReady,
  onError,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const docEditorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  const { collaborators } = useCollaboration(document.id);

  // Load OnlyOffice API
  useEffect(() => {
    const loadAPI = async () => {
      try {
        await documentService.loadAPI();
        setApiLoaded(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load OnlyOffice API';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    loadAPI();
  }, [onError]);

  // Initialize editor when API is loaded and document is available
  useEffect(() => {
    if (!apiLoaded || !document || !editorRef.current) return;

    initializeEditor();

    return () => {
      if (docEditorRef.current) {
        try {
          docEditorRef.current.destroyEditor();
        } catch (e) {
          console.log('Editor cleanup error (expected):', e);
        }
      }
    };
  }, [apiLoaded, document, mode]);

  const initializeEditor = async () => {
    if (!window.DocsAPI || !editorRef.current) {
      setError('OnlyOffice API not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Destroy existing editor
      if (docEditorRef.current) {
        try {
          docEditorRef.current.destroyEditor();
        } catch (e) {
          console.log('Previous editor cleanup:', e);
        }
      }

      // Create document configuration
      const config: DocumentConfig = await documentService.createDocumentConfig(
        document,
        mode,
        collaborators
      );

      // Add event handlers
      config.events = {
        ...config.events,
        onAppReady: () => {
          console.log('OnlyOffice app ready');
          setIsLoading(false);
          onDocumentReady?.();
        },
        onDocumentReady: () => {
          console.log('Document ready');
          setIsLoading(false);
          onDocumentReady?.();
        },
        onError: (event) => {
          console.error('OnlyOffice error:', event);
          const errorMessage = `Editor error: ${event.data || 'Unknown error'}`;
          setError(errorMessage);
          setIsLoading(false);
          onError?.(errorMessage);
        },
        onWarning: (event) => {
          console.warn('OnlyOffice warning:', event);
        },
        onInfo: (event) => {
          console.info('OnlyOffice info:', event);
        },
        onDocumentStateChange: (event) => {
          console.log('Document state changed:', event);
          // Handle document changes for auto-save
          if (event.data) {
            handleDocumentChange(event.data);
          }
        },
        onRequestUsers: (event) => {
          // Provide collaborator information
          const users = collaborators.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar
          }));
          
          // This is how OnlyOffice expects the user data
          if (event && event.data) {
            event.data = users;
          }
        },
        onRequestSendNotify: (event) => {
          // Handle collaboration notifications
          console.log('Collaboration notification:', event);
        },
        onRequestRename: (event) => {
          // Handle document rename
          if (event && event.data) {
            console.log('Document rename requested:', event.data);
          }
        }
      };

      // Initialize the editor
      docEditorRef.current = new window.DocsAPI.DocEditor(editorRef.current, config);

    } catch (err) {
      console.error('Failed to initialize editor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize editor';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  };

  const handleDocumentChange = async (changeData: any) => {
    try {
      // Auto-save document changes
      await documentService.saveDocument(document.id, changeData);
    } catch (err) {
      console.error('Failed to save document changes:', err);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Error Loading Document
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              initializeEditor();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {!apiLoaded ? 'Loading OnlyOffice API...' : 'Initializing document...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Collaboration indicators */}
      {collaborators.length > 1 && (
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
          {collaborators.slice(0, 3).map((collaborator, index) => (
            <div
              key={collaborator.id}
              className="relative"
              title={`${collaborator.name} ${collaborator.isOnline ? '(online)' : '(offline)'}`}
            >
              {collaborator.avatar ? (
                <img
                  src={collaborator.avatar}
                  alt={collaborator.name}
                  className={`w-6 h-6 rounded-full border-2 ${
                    collaborator.isOnline ? 'border-green-400' : 'border-gray-400'
                  }`}
                  style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                />
              ) : (
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium text-white ${
                    collaborator.isOnline ? 'border-green-400' : 'border-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: collaborator.color,
                    marginLeft: index > 0 ? '-8px' : '0'
                  }}
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                </div>
              )}
              {collaborator.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
          ))}
          {collaborators.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
              +{collaborators.length - 3}
            </div>
          )}
        </div>
      )}

      {/* OnlyOffice Editor Container */}
      <div 
        ref={editorRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default DocumentViewer;