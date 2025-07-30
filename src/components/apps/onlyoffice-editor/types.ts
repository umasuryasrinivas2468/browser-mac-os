// OnlyOffice Editor Types

export type DocumentType = 'text' | 'spreadsheet' | 'presentation';

export interface DocumentPermissions {
  edit: boolean;
  download: boolean;
  print: boolean;
  review: boolean;
  comment: boolean;
  fillForms: boolean;
  modifyFilter: boolean;
  modifyContentControl: boolean;
}

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  position?: {
    page: number;
    x: number;
    y: number;
  };
  replies: CommentReply[];
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface DocumentConfig {
  document: {
    fileType: string;
    key: string;
    title: string;
    url: string;
    permissions: DocumentPermissions;
    info?: {
      owner: string;
      uploaded: string;
      favorite?: boolean;
    };
  };
  documentType: DocumentType;
  editorConfig: {
    mode: 'edit' | 'view';
    lang: string;
    region?: string;
    user: {
      id: string;
      name: string;
      group?: string;
    };
    recent?: Array<{
      title: string;
      url: string;
      folder: string;
    }>;
    templates?: Array<{
      image: string;
      title: string;
      url: string;
    }>;
    customization: {
      about: boolean;
      comments: boolean;
      feedback: boolean;
      forcesave: boolean;
      help: boolean;
      integrationMode: string;
      macros: boolean;
      macrosMode: string;
      mentionShare: boolean;
      plugins: boolean;
      review: boolean;
      trackChanges: boolean;
      zoom: number;
      compactToolbar: boolean;
      leftMenu: boolean;
      rightMenu: boolean;
      toolbar: boolean;
      statusBar: boolean;
      autosave: boolean;
    };
    plugins?: {
      autostart: string[];
      pluginsData: string[];
    };
  };
  width: string;
  height: string;
  events: {
    onAppReady?: () => void;
    onDocumentReady?: () => void;
    onDocumentStateChange?: (event: any) => void;
    onMetaChange?: (event: any) => void;
    onError?: (event: any) => void;
    onWarning?: (event: any) => void;
    onInfo?: (event: any) => void;
    onRequestSaveAs?: (event: any) => void;
    onRequestInsertImage?: (event: any) => void;
    onRequestMailMergeRecipients?: (event: any) => void;
    onRequestCompareFile?: (event: any) => void;
    onRequestEditRights?: () => void;
    onRequestHistory?: () => void;
    onRequestHistoryClose?: () => void;
    onRequestHistoryData?: (event: any) => void;
    onRequestRestore?: (event: any) => void;
    onRequestUsers?: (event: any) => void;
    onRequestSendNotify?: (event: any) => void;
    onRequestRename?: (event: any) => void;
    onMakeActionLink?: (event: any) => void;
    onRequestClose?: () => void;
  };
}

export interface DocumentMetadata {
  id: string;
  title: string;
  type: DocumentType;
  fileType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  permissions: DocumentPermissions;
  collaborators: CollaborationUser[];
  isPublic: boolean;
  shareLink?: string;
  version: number;
  tags: string[];
  folder?: string;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface EditorState {
  isLoading: boolean;
  isApiLoaded: boolean;
  currentDocument: DocumentMetadata | null;
  error: string | null;
  collaborators: CollaborationUser[];
  comments: Comment[];
  uploadProgress: FileUploadProgress[];
}