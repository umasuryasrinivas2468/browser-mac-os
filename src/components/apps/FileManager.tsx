
import React, { useState, useRef, useEffect } from 'react';
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
  Music,
  Home,
  FolderOpen
} from 'lucide-react';

interface FileItem {
  type: 'file' | 'folder';
  children?: { [key: string]: FileItem };
  content?: string;
  savedAt?: string;
}

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFolder, setSelectedFolder] = useState('Home');
  const [fileStructure, setFileStructure] = useState<{ [key: string]: FileItem }>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<{ name: string; content: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; item: FileItem } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize file structure
  useEffect(() => {
    const savedStructure = localStorage.getItem('filemanager_structure');
    if (savedStructure) {
      setFileStructure(JSON.parse(savedStructure));
    } else {
      const defaultStructure = {
        Home: {
          type: 'folder' as const,
          children: {
            Documents: {
              type: 'folder' as const,
              children: {
                'Report.pdf': {
                  type: 'file' as const,
                  content: 'PDF_CONTENT:This is a sample PDF document content.',
                  savedAt: new Date().toISOString()
                },
                'Notes.txt': {
                  type: 'file' as const,
                  content: 'These are my personal notes.\n\nLine 1: Important meeting tomorrow\nLine 2: Buy groceries\nLine 3: Call mom',
                  savedAt: new Date().toISOString()
                }
              }
            },
            Pictures: {
              type: 'folder' as const,
              children: {
                'screenshot_2024.png': {
                  type: 'file' as const,
                  content: '/placeholder.svg?height=400&width=600&text=Screenshot',
                  savedAt: new Date().toISOString()
                }
              }
            },
            Downloads: {
              type: 'folder' as const,
              children: {}
            },
            Videos: {
              type: 'folder' as const,
              children: {}
            },
            Music: {
              type: 'folder' as const,
              children: {}
            }
          }
        },
        Downloads: {
          type: 'folder' as const,
          children: {}
        }
      };
      setFileStructure(defaultStructure);
      localStorage.setItem('filemanager_structure', JSON.stringify(defaultStructure));
    }
  }, []);

  const getCurrentFolderContents = () => {
    if (selectedFolder === 'Downloads') {
      return fileStructure.Downloads?.children || {};
    }
    
    const pathParts = currentPath.split('/').filter(Boolean);
    let current = fileStructure.Home?.children || {};
    
    for (const part of pathParts) {
      if (current[part] && current[part].type === 'folder' && current[part].children) {
        current = current[part].children!;
      }
    }
    
    return current;
  };

  const formatFileSize = (content?: string): string => {
    if (!content) return '-';
    return `${Math.round(content.length / 1024)} KB`;
  };

  const getFileIcon = (name: string, item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-6 h-6 text-blue-500" />;
    }
    
    const extension = name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <ImageIcon className="w-6 h-6 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="w-6 h-6 text-red-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="w-6 h-6 text-purple-500" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="w-6 h-6 text-orange-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleFileClick = (name: string, item: FileItem) => {
    if (item.type === 'folder') {
      if (selectedFolder === 'Downloads') {
        // Handle Downloads folder navigation if needed
      } else {
        setCurrentPath(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`);
      }
      setSelectedFile(null);
    } else {
      setSelectedFile({ name, item });
      
      // Handle file opening based on type
      const extension = name.split('.').pop()?.toLowerCase();
      
      if (['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) {
        setPreviewFile({ name, content: item.content || '' });
      } else if (extension === 'pdf' && item.content?.startsWith('PDF_CONTENT:')) {
        const content = item.content.replace('PDF_CONTENT:', '');
        setPreviewFile({ name, content: `PDF Document: ${name}\n\n${content}` });
      } else if (['pptx', 'ppt'].includes(extension || '') && item.content?.startsWith('PPT_CONTENT:')) {
        const content = item.content.replace('PPT_CONTENT:', '');
        setPreviewFile({ name, content: `PowerPoint Presentation: ${name}\n\n${content}` });
      }
    }
  };

  const handleGoBack = () => {
    if (selectedFolder === 'Downloads') {
      setSelectedFolder('Home');
      setCurrentPath('/');
    } else {
      const pathParts = currentPath.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        pathParts.pop();
        setCurrentPath(pathParts.length ? `/${pathParts.join('/')}` : '/');
      }
    }
    setSelectedFile(null);
  };

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
    setCurrentPath('/');
    setSelectedFile(null);
  };

  const handleDeleteFiles = () => {
    const updatedStructure = { ...fileStructure };
    const currentContents = getCurrentFolderContents();
    
    selectedFiles.forEach(fileName => {
      delete currentContents[fileName];
    });
    
    setFileStructure(updatedStructure);
    localStorage.setItem('filemanager_structure', JSON.stringify(updatedStructure));
    setSelectedFiles([]);
    setSelectedFile(null);
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  const currentContents = getCurrentFolderContents();
  const filteredFiles = Object.entries(currentContents).filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const leftPanelFolders = [
    { name: 'Home', icon: Home, path: 'Home' },
    { name: 'Downloads', icon: Download, path: 'Downloads' },
  ];

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Left Panel */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Folders</h3>
        <div className="space-y-2">
          {leftPanelFolders.map((folder) => (
            <button
              key={folder.path}
              onClick={() => handleFolderSelect(folder.path)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                selectedFolder === folder.path
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <folder.icon className="w-5 h-5" />
              <span>{folder.name}</span>
            </button>
          ))}
        </div>
        
        {/* Quick Access to subfolders when Home is selected */}
        {selectedFolder === 'Home' && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Access</h4>
            <div className="space-y-1">
              {Object.entries(fileStructure.Home?.children || {}).map(([name, item]) => (
                item.type === 'folder' && (
                  <button
                    key={name}
                    onClick={() => handleFileClick(name, item)}
                    className="w-full flex items-center space-x-2 p-2 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>{name}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              disabled={currentPath === '/' && selectedFolder === 'Home'}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFolder === 'Downloads' ? 'Downloads' : `${selectedFolder}${currentPath}`}
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
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
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

        {/* File Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map(([name, item]) => (
                <div
                  key={name}
                  className={`group p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300 ${
                    selectedFiles.includes(name)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleFileSelection(name);
                    } else {
                      handleFileClick(name, item);
                    }
                  }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-center">
                      {getFileIcon(name, item)}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                        {name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.content)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map(([name, item]) => (
                <div
                  key={name}
                  className={`group flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    selectedFiles.includes(name)
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleFileSelection(name);
                    } else {
                      handleFileClick(name, item);
                    }
                  }}
                >
                  {getFileIcon(name, item)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(item.content)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
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
              {previewFile.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                <img
                  src={previewFile.content}
                  alt={previewFile.name}
                  className="max-w-full max-h-[60vh] object-contain mx-auto"
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded border max-h-[60vh] overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                    {previewFile.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
