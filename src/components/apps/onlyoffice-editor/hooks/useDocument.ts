// Document Management Hook

import { useState, useEffect, useCallback } from 'react';
import { DocumentMetadata, DocumentType, FileUploadProgress } from '../types';
import { documentService } from '../services/documentService';
import { storageService } from '../services/storageService';
import { useAuth } from './useAuth';

export const useDocument = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);

  // Load user documents
  const loadDocuments = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const userDocs = await storageService.getUserDocuments(user.id);
      setDocuments(userDocs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Create new document
  const createDocument = async (type: DocumentType, title: string): Promise<DocumentMetadata> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setIsLoading(true);
      setError(null);

      const document = await documentService.createDocument(type, title);
      setDocuments(prev => [document, ...prev]);
      setCurrentDocument(document);
      
      return document;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file
  const uploadFile = async (file: File): Promise<DocumentMetadata> => {
    if (!user) throw new Error('User not authenticated');

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    try {
      // Add to upload progress
      const uploadItem: FileUploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      };
      setUploadProgress(prev => [...prev, uploadItem]);

      // Upload file to storage
      const fileUrl = await storageService.uploadFile(file, (progress) => {
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === file 
              ? { ...item, progress }
              : item
          )
        );
      });

      // Update upload status
      setUploadProgress(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: 'processing' }
            : item
        )
      );

      // Create document metadata
      const documentType = documentService.getDocumentTypeFromExtension(file.name);
      const document: DocumentMetadata = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        title: file.name,
        type: documentType,
        fileType: file.name.split('.').pop() || '',
        size: file.size,
        url: fileUrl,
        ownerId: user.id,
        ownerName: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModifiedBy: user.id,
        permissions: {
          edit: true,
          download: true,
          print: true,
          review: true,
          comment: true,
          fillForms: true,
          modifyFilter: true,
          modifyContentControl: true
        },
        collaborators: [{
          id: user.id,
          name: user.name,
          email: user.email || '',
          avatar: user.avatar,
          color: '#4F46E5',
          isOnline: true
        }],
        isPublic: false,
        version: 1,
        tags: [],
        folder: 'root'
      };

      // Save document
      await storageService.saveDocument(document);

      // Update state
      setDocuments(prev => [document, ...prev]);
      setCurrentDocument(document);

      // Complete upload
      setUploadProgress(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: 'complete', progress: 100 }
            : item
        )
      );

      // Remove from upload progress after delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(item => item.file !== file));
      }, 2000);

      return document;

    } catch (err) {
      // Update upload status to error
      setUploadProgress(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
            : item
        )
      );

      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Open document
  const openDocument = async (documentId: string): Promise<DocumentMetadata | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const document = await storageService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      setCurrentDocument(document);
      return document;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open document';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await storageService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Share document
  const shareDocument = async (documentId: string, permissions: any): Promise<string> => {
    try {
      const shareLink = await storageService.shareDocument(documentId, permissions);
      
      // Update document in state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, isPublic: true, shareLink }
            : doc
        )
      );

      if (currentDocument?.id === documentId) {
        setCurrentDocument(prev => prev ? { ...prev, isPublic: true, shareLink } : null);
      }

      return shareLink;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Rename document
  const renameDocument = async (documentId: string, newTitle: string): Promise<void> => {
    try {
      const document = await storageService.getDocument(documentId);
      if (!document) throw new Error('Document not found');

      document.title = newTitle;
      document.updatedAt = new Date().toISOString();

      await storageService.saveDocument(document);

      // Update state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, title: newTitle, updatedAt: document.updatedAt }
            : doc
        )
      );

      if (currentDocument?.id === documentId) {
        setCurrentDocument(prev => prev ? { ...prev, title: newTitle, updatedAt: document.updatedAt } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename document';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    documents,
    currentDocument,
    isLoading,
    error,
    uploadProgress,
    createDocument,
    uploadFile,
    openDocument,
    deleteDocument,
    shareDocument,
    renameDocument,
    loadDocuments,
    setCurrentDocument
  };
};