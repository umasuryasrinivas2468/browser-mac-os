// Document Service - OnlyOffice API Integration

import { DocumentConfig, DocumentType, DocumentMetadata, CollaborationUser } from '../types';
import { authService } from './authService';
import { storageService } from './storageService';

declare global {
  interface Window {
    DocsAPI: any;
  }
}

class DocumentService {
  private apiLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async loadAPI(): Promise<void> {
    if (this.apiLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise((resolve, reject) => {
      if (window.DocsAPI) {
        this.apiLoaded = true;
        resolve();
        return;
      }

      // Check if script already exists
      if (document.getElementById('onlyoffice-api')) {
        const checkAPI = () => {
          if (window.DocsAPI) {
            this.apiLoaded = true;
            resolve();
          } else {
            setTimeout(checkAPI, 100);
          }
        };
        checkAPI();
        return;
      }

      const script = document.createElement('script');
      script.id = 'onlyoffice-api';
      script.src = 'https://documentserver.onlyoffice.com/web-apps/apps/api/documents/api.js';
      
      script.onload = () => {
        console.log('OnlyOffice API loaded successfully');
        this.apiLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load OnlyOffice API');
        reject(new Error('Failed to load OnlyOffice API'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  async createDocument(type: DocumentType, title: string): Promise<DocumentMetadata> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileExtensions = {
      text: 'docx',
      spreadsheet: 'xlsx',
      presentation: 'pptx'
    };

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const fileName = `${title}.${fileExtensions[type]}`;

    const document: DocumentMetadata = {
      id: documentId,
      title: fileName,
      type,
      fileType: fileExtensions[type],
      size: 0,
      url: '', // Will be set when document is saved
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
        color: authService.generateUserColor(user.id),
        isOnline: true
      }],
      isPublic: false,
      version: 1,
      tags: [],
      folder: 'root'
    };

    await storageService.saveDocument(document);
    return document;
  }

  async createDocumentConfig(
    document: DocumentMetadata, 
    mode: 'edit' | 'view' = 'edit',
    collaborators: CollaborationUser[] = []
  ): Promise<DocumentConfig> {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const documentUrl = document.url || await this.generateDocumentUrl(document);

    const config: DocumentConfig = {
      document: {
        fileType: document.fileType,
        key: `${document.id}_${document.version}_${Date.now()}`,
        title: document.title,
        url: documentUrl,
        permissions: document.permissions,
        info: {
          owner: document.ownerName,
          uploaded: document.createdAt,
          favorite: false
        }
      },
      documentType: document.type,
      editorConfig: {
        mode,
        lang: 'en',
        region: 'US',
        user: {
          id: user.id,
          name: user.name,
          group: 'users'
        },
        customization: {
          about: true,
          comments: true,
          feedback: false,
          forcesave: true,
          help: true,
          integrationMode: 'embed',
          macros: true,
          macrosMode: 'warn',
          mentionShare: true,
          plugins: true,
          review: true,
          trackChanges: true,
          zoom: 100,
          compactToolbar: false,
          leftMenu: true,
          rightMenu: true,
          toolbar: true,
          statusBar: true,
          autosave: true
        }
      },
      width: '100%',
      height: '100%',
      events: {
        onAppReady: () => {
          console.log('OnlyOffice app ready');
        },
        onDocumentReady: () => {
          console.log('Document ready');
        },
        onDocumentStateChange: (event) => {
          console.log('Document state changed:', event);
          this.handleDocumentChange(document.id, event);
        },
        onError: (event) => {
          console.error('OnlyOffice error:', event);
        },
        onRequestUsers: (event) => {
          // Return list of collaborators
          const users = collaborators.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar
          }));
          event.data = users;
        },
        onRequestSendNotify: (event) => {
          // Handle notifications to collaborators
          this.sendCollaborationNotification(document.id, event.data);
        },
        onRequestRename: (event) => {
          // Handle document rename
          this.renameDocument(document.id, event.data);
        },
        onMakeActionLink: (event) => {
          // Generate action links for sharing
          const actionLink = `${window.location.origin}/document/${document.id}?action=${event.data.action}`;
          event.data = { link: actionLink };
        }
      }
    };

    return config;
  }

  private async generateDocumentUrl(document: DocumentMetadata): Promise<string> {
    // For new documents, create a blank document URL
    const blankDocuments = {
      text: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIAA==', // Minimal DOCX
      spreadsheet: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQAAAAIAA==', // Minimal XLSX
      presentation: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,UEsDBBQAAAAIAA==' // Minimal PPTX
    };

    return blankDocuments[document.type] || '';
  }

  private async handleDocumentChange(documentId: string, event: any): Promise<void> {
    try {
      const document = await storageService.getDocument(documentId);
      if (!document) return;

      // Update document metadata
      document.updatedAt = new Date().toISOString();
      document.version += 1;

      const user = await authService.getCurrentUser();
      if (user) {
        document.lastModifiedBy = user.id;
      }

      await storageService.saveDocument(document);
    } catch (error) {
      console.error('Error handling document change:', error);
    }
  }

  private async sendCollaborationNotification(documentId: string, data: any): Promise<void> {
    // Implementation for sending notifications to collaborators
    console.log('Sending collaboration notification:', documentId, data);
    
    // This would integrate with your notification system
    // For now, we'll just log it
  }

  private async renameDocument(documentId: string, newName: string): Promise<void> {
    try {
      const document = await storageService.getDocument(documentId);
      if (!document) return;

      document.title = newName;
      document.updatedAt = new Date().toISOString();

      await storageService.saveDocument(document);
    } catch (error) {
      console.error('Error renaming document:', error);
    }
  }

  async saveDocument(documentId: string, content: any): Promise<void> {
    try {
      const document = await storageService.getDocument(documentId);
      if (!document) throw new Error('Document not found');

      // In a real implementation, you would save the document content
      // For now, we'll just update the metadata
      document.updatedAt = new Date().toISOString();
      document.version += 1;

      await storageService.saveDocument(document);
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  async getDocumentHistory(documentId: string): Promise<any[]> {
    // Implementation for document version history
    // This would integrate with OnlyOffice's history API
    return [];
  }

  async restoreDocumentVersion(documentId: string, version: number): Promise<void> {
    // Implementation for restoring document versions
    console.log('Restoring document version:', documentId, version);
  }

  getFileTypeIcon(fileType: string): string {
    const icons = {
      docx: '📄',
      doc: '📄',
      xlsx: '📊',
      xls: '📊',
      pptx: '📽️',
      ppt: '📽️',
      pdf: '📕'
    };
    return icons[fileType as keyof typeof icons] || '📄';
  }

  getDocumentTypeFromExtension(filename: string): DocumentType {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext || '')) {
      return 'text';
    } else if (['xls', 'xlsx', 'ods', 'csv'].includes(ext || '')) {
      return 'spreadsheet';
    } else if (['ppt', 'pptx', 'odp'].includes(ext || '')) {
      return 'presentation';
    }
    
    return 'text'; // Default fallback
  }
}

export const documentService = new DocumentService();