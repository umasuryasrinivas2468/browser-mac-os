// OnlyOffice Editor Module - Main Export
export { default as OnlyOfficeEditor } from './OnlyOfficeEditor';
export { default as DocumentViewer } from './components/DocumentViewer';
export { default as FileManager } from './components/FileManager';
export { default as CollaborationPanel } from './components/CollaborationPanel';
export { default as CommentPanel } from './components/CommentPanel';

// Types
export type { 
  DocumentType, 
  DocumentPermissions, 
  CollaborationUser, 
  Comment,
  DocumentConfig 
} from './types';

// Hooks
export { useDocument } from './hooks/useDocument';
export { useCollaboration } from './hooks/useCollaboration';
export { useComments } from './hooks/useComments';
export { useAuth } from './hooks/useAuth';

// Services
export { documentService } from './services/documentService';
export { storageService } from './services/storageService';
export { authService } from './services/authService';