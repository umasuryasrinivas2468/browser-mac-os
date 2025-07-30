// File Manager Component - Document browser and management

import React, { useState } from 'react';
import { DocumentMetadata, DocumentType, FileUploadProgress } from '../types';
import { useDocument } from '../hooks/useDocument';
import { documentService } from '../services/documentService';
import { 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Upload, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Trash2,
  Share2,
  Edit3,
  Download,
  Eye,
  Calendar,
  User,
  Folder,
  Grid,
  List,
  SortAsc
} from 'lucide-react';

interface FileManagerProps {
  onDocumentSelect: (document: DocumentMetadata) => void;
  selectedDocument?: DocumentMetadata | null;
  className?: string;
}

const FileManager: React.FC<FileManagerProps> = ({
  onDocumentSelect,
  selectedDocument,
  className = ''
}) => {
  const {
    documents,
    isLoading,
    error,
    uploadProgress,
    createDocument,
    uploadFile,
    deleteDocument,
    shareDocument,
    renameDocument
  } = useDocument();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('date');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const handleCreateDocument = async (type: DocumentType) => {
    try {
      const title = `New ${type === 'text' ? 'Document' : type === 'spreadsheet' ? 'Spreadsheet' : 'Presentation'}`;
      const document = await createDocument(type, title);
      onDocumentSelect(document);
      setShowCreateMenu(false);
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const document = await uploadFile(file);
        onDocumentSelect(document);
      } catch (err) {
        console.error('Failed to upload file:', err);
      }
    }

    // Reset input
    event.target.value = '';
  };

  const handleRename = async (documentId: string) => {
    if (!newTitle.trim()) return;

    try {
      await renameDocument(documentId, newTitle);
      setEditingDocument(null);
      setNewTitle('');
    } catch (err) {
      console.error('Failed to rename document:', err);
    }
  };

  const handleShare = async (document: DocumentMetadata) => {
    try {
      const shareLink = await shareDocument(document.id, document.permissions);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareLink);
      
      // Show success message (you could use a toast library here)
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to share document:', err);
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'text':
        return <FileText className="w-5 h-5" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'presentation':
        return <Presentation className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documents
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* Create Document Menu */}
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">New</span>
              </button>
              
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={() => handleCreateDocument('text')}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Document</span>
                  </button>
                  <button
                    onClick={() => handleCreateDocument('spreadsheet')}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Spreadsheet</span>
                  </button>
                  <button
                    onClick={() => handleCreateDocument('presentation')}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Presentation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <label className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload</span>
              <input
                type="file"
                multiple
                accept=".docx,.doc,.xlsx,.xls,.pptx,.ppt,.odt,.ods,.odp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="text">Documents</option>
            <option value="spreadsheet">Spreadsheets</option>
            <option value="presentation">Presentations</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'type')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
          </select>

          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {uploadProgress.map((upload, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>{upload.file.name}</span>
                <span>{upload.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    upload.status === 'error' ? 'bg-red-500' : 
                    upload.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              {upload.error && (
                <p className="text-xs text-red-500 mt-1">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p>{error}</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No documents found</p>
            <p className="text-sm mt-2">Create a new document or upload files to get started</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDocument?.id === document.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => onDocumentSelect(document)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-blue-500">
                    {getDocumentIcon(document.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingDocument === document.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleRename(document.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRename(document.id)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {document.title}
                      </h3>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{document.ownerName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(document.updatedAt)}</span>
                      </span>
                      <span>{formatFileSize(document.size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Collaborators */}
                  {document.collaborators.length > 1 && (
                    <div className="flex items-center space-x-1 mr-2">
                      {document.collaborators.slice(0, 3).map((collaborator, index) => (
                        <div
                          key={collaborator.id}
                          className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs"
                          title={collaborator.name}
                        >
                          {collaborator.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {document.collaborators.length > 3 && (
                        <span className="text-xs text-gray-500">+{document.collaborators.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions Menu */}
                  <div className="relative group">
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDocument(document.id);
                          setNewTitle(document.title);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(document);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(document.id);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedDocument?.id === document.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => onDocumentSelect(document)}
              >
                <div className="text-center">
                  <div className="text-blue-500 mb-3 flex justify-center">
                    {getDocumentIcon(document.type)}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-2">
                    {document.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(document.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;