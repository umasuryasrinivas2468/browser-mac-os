
import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Upload,
  Download,
  Trash2,
  Plus,
  ArrowLeft,
  Search,
  Grid,
  List,
  Eye,
  X,
  File,
  Video,
  Music
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  lastModified: Date;
  content?: string;
  fileType?: string;
}

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      lastModified: new Date(),
    },
    {
      id: '2',
      name: 'Pictures',
      type: 'folder',
      lastModified: new Date(),
    },
    {
      id: '3',
      name: 'Downloads',
      type: 'folder',
      lastModified: new Date(),
    },
    {
      id: '4',
      name: 'Videos',
      type: 'folder',
      lastModified: new Date(),
    },
    {
      id: '5',
      name: 'Music',
      type: 'folder',
      lastModified: new Date(),
    },
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock file structure for different folders
  const getFolderContents = (folderName: string): FileItem[] => {
    switch (folderName) {
      case 'Pictures':
        return [
          {
            id: 'pic1',
            name: 'screenshot_2024.png',
            type: 'file',
            size: 1024 * 500,
            lastModified: new Date(),
            fileType: 'image/png',
            content: '/placeholder.svg?height=400&width=600&text=Screenshot'
          },
          {
            id: 'pic2',
            name: 'vacation.jpg',
            type: 'file',
            size: 1024 * 800,
            lastModified: new Date(),
            fileType: 'image/jpeg',
            content: '/placeholder.svg?height=400&width=600&text=Vacation+Photo'
          },
          {
            id: 'pic3',
            name: 'family.jpg',
            type: 'file',
            size: 1024 * 600,
            lastModified: new Date(),
            fileType: 'image/jpeg',
            content: '/placeholder.svg?height=400&width=600&text=Family+Photo'
          }
        ];
      case 'Documents':
        return [
          {
            id: 'doc1',
            name: 'Report.pdf',
            type: 'file',
            size: 1024 * 200,
            lastModified: new Date(),
            fileType: 'application/pdf',
            content: 'This is a sample PDF document content.'
          },
          {
            id: 'doc2',
            name: 'Notes.txt',
            type: 'file',
            size: 1024 * 5,
            lastModified: new Date(),
            fileType: 'text/plain',
            content: 'These are my personal notes.\n\nLine 1: Important meeting tomorrow\nLine 2: Buy groceries\nLine 3: Call mom'
          },
          {
            id: 'doc3',
            name: 'Presentation.pptx',
            type: 'file',
            size: 1024 * 150,
            lastModified: new Date(),
            fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            content: 'PowerPoint presentation content placeholder'
          }
        ];
      case 'Downloads':
        return [
          {
            id: 'dl1',
            name: 'installer.zip',
            type: 'file',
            size: 1024 * 1024 * 5,
            lastModified: new Date(),
            fileType: 'application/zip'
          },
          {
            id: 'dl2',
            name: 'document.docx',
            type: 'file',
            size: 1024 * 50,
            lastModified: new Date(),
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            content: 'This is a Word document with some sample content for demonstration purposes.'
          }
        ];
      case 'Videos':
        return [
          {
            id: 'vid1',
            name: 'demo.mp4',
            type: 'file',
            size: 1024 * 1024 * 25,
            lastModified: new Date(),
            fileType: 'video/mp4'
          }
        ];
      case 'Music':
        return [
          {
            id: 'mus1',
            name: 'song.mp3',
            type: 'file',
            size: 1024 * 1024 * 4,
            lastModified: new Date(),
            fileType: 'audio/mp3'
          }
        ];
      default:
        return [];
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-6 h-6 text-blue-500" />;
    }
    
    if (item.fileType?.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-green-500" />;
    }
    
    if (item.fileType?.startsWith('video/')) {
      return <Video className="w-6 h-6 text-red-500" />;
    }
    
    if (item.fileType?.startsWith('audio/')) {
      return <Music className="w-6 h-6 text-purple-500" />;
    }
    
    if (item.fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-600" />;
    }
    
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(`/${file.name}`);
      setFiles(getFolderContents(file.name));
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      // Only open preview modal for images in Pictures folder
      if (currentPath === '/Pictures' && file.fileType?.startsWith('image/')) {
        setPreviewFile(file);
      }
    }
  };

  const handleGoBack = () => {
    setCurrentPath('/');
    setSelectedFile(null);
    setFiles([
      {
        id: '1',
        name: 'Documents',
        type: 'folder',
        lastModified: new Date(),
      },
      {
        id: '2',
        name: 'Pictures',
        type: 'folder',
        lastModified: new Date(),
      },
      {
        id: '3',
        name: 'Downloads',
        type: 'folder',
        lastModified: new Date(),
      },
      {
        id: '4',
        name: 'Videos',
        type: 'folder',
        lastModified: new Date(),
      },
      {
        id: '5',
        name: 'Music',
        type: 'folder',
        lastModified: new Date(),
      },
    ]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'file',
          size: file.size,
          lastModified: new Date(),
          fileType: file.type,
          content: e.target?.result as string
        };
        
        setFiles(prev => [...prev, newFile]);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        type: 'folder',
        lastModified: new Date(),
      };
      
      setFiles(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleDeleteFiles = () => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
    if (selectedFile && selectedFiles.includes(selectedFile.id)) {
      setSelectedFile(null);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              disabled={currentPath === '/'}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentPath}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewFolderDialog(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>New Folder</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFiles.length} selected
              </span>
              <button
                onClick={handleDeleteFiles}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* File Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300 ${
                    selectedFiles.includes(file.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleFileSelection(file.id);
                    } else {
                      handleFileClick(file);
                    }
                  }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    selectedFiles.includes(file.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleFileSelection(file.id);
                    } else {
                      handleFileClick(file);
                    }
                  }}
                >
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {file.lastModified.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedFile && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">File Details</h3>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedFile.fileType}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Modified</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.lastModified.toLocaleString()}
                </div>
              </div>
            </div>

            {/* File Preview */}
            {selectedFile.content && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</div>
                
                {selectedFile.fileType?.startsWith('image/') ? (
                  <div className="w-full">
                    <img 
                      src={selectedFile.content} 
                      alt={selectedFile.name}
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => setPreviewFile(selectedFile)}
                    />
                  </div>
                ) : selectedFile.fileType === 'text/plain' ? (
                  <div className="bg-white dark:bg-gray-900 p-3 rounded border text-sm font-mono text-gray-800 dark:text-gray-200 max-h-32 overflow-auto whitespace-pre-wrap">
                    {selectedFile.content}
                  </div>
                ) : selectedFile.fileType === 'application/pdf' ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border text-sm text-red-700 dark:text-red-300">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-center">PDF Document</div>
                    <div className="text-xs text-center mt-1">Click to view content</div>
                    <div className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded">
                      {selectedFile.content}
                    </div>
                  </div>
                ) : selectedFile.fileType?.includes('word') || selectedFile.fileType?.includes('document') ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border text-sm text-blue-700 dark:text-blue-300">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-center">Word Document</div>
                    <div className="text-xs text-center mt-1">Document preview</div>
                    <div className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded">
                      {selectedFile.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border text-sm text-gray-600 dark:text-gray-400 text-center">
                    <File className="w-8 h-8 mx-auto mb-2" />
                    No preview available
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <button 
                onClick={() => toggleFileSelection(selectedFile.id)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
                <span>Select</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal - Only for Pictures folder */}
      {previewFile && currentPath === '/Pictures' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewFile.content}
                alt={previewFile.name}
                className="max-w-full max-h-[60vh] object-contain mx-auto"
              />
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                {formatFileSize(previewFile.size)} • {previewFile.lastModified.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
