
import React, { useState, useMemo } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Folder, 
  File, 
  Home, 
  Download, 
  Image, 
  Music, 
  Video, 
  ChevronRight, 
  Search,
  Plus,
  MoreVertical,
  ArrowLeft,
  Grid,
  List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FileItem {
  type: 'file' | 'folder';
  children?: { [key: string]: FileItem };
}

const FileManager: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentPath, setCurrentPath] = useState(['Home']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [fileStructure, setFileStructure] = useState({
    'Home': {
      type: 'folder' as const,
      children: {
        'Desktop': {
          type: 'folder' as const,
          children: {
            'README.txt': { type: 'file' as const },
            'Shortcut.lnk': { type: 'file' as const }
          }
        },
        'Documents': {
          type: 'folder' as const,
          children: {
            'Resume.pdf': { type: 'file' as const },
            'Project Report.docx': { type: 'file' as const },
            'Presentation.pptx': { type: 'file' as const }
          }
        },
        'Downloads': {
          type: 'folder' as const,
          children: {
            'installer.dmg': { type: 'file' as const },
            'photo.jpg': { type: 'file' as const },
            'song.mp3': { type: 'file' as const }
          }
        },
        'Pictures': {
          type: 'folder' as const,
          children: {
            'vacation.jpg': { type: 'file' as const },
            'family.png': { type: 'file' as const },
            'screenshot.png': { type: 'file' as const }
          }
        },
        'Music': {
          type: 'folder' as const,
          children: {
            'playlist.m3u': { type: 'file' as const },
            'favorite-song.mp3': { type: 'file' as const }
          }
        },
        'Videos': {
          type: 'folder' as const,
          children: {
            'movie.mp4': { type: 'file' as const },
            'tutorial.mov': { type: 'file' as const }
          }
        }
      }
    }
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) {
      return Image;
    } else if (['mp3', 'wav', 'flac', 'm3u'].includes(extension || '')) {
      return Music;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) {
      return Video;
    }
    
    return File;
  };

  const getCurrentFolder = () => {
    let current: any = fileStructure;
    for (const path of currentPath) {
      if (current && current[path] && current[path].children) {
        current = current[path].children;
      } else if (current && current[path]) {
        return {};
      } else {
        setCurrentPath(['Home']);
        return fileStructure['Home'].children || {};
      }
    }
    return current || {};
  };

  const navigateToFolder = (folderName: string) => {
    const currentFolder = getCurrentFolder();
    if (currentFolder[folderName] && currentFolder[folderName].type === 'folder') {
      setCurrentPath([...currentPath, folderName]);
      setSearchQuery('');
    }
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSearchQuery('');
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    setFileStructure(prev => {
      const newStructure = JSON.parse(JSON.stringify(prev));
      let current = newStructure;
      
      // Navigate to current path
      for (const path of currentPath) {
        if (current[path] && current[path].children) {
          current = current[path].children;
        }
      }
      
      // Add new folder
      current[newFolderName] = {
        type: 'folder',
        children: {}
      };
      
      return newStructure;
    });
    
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const currentFolder = getCurrentFolder();
  
  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return currentFolder;
    
    const filtered: any = {};
    Object.entries(currentFolder).forEach(([name, item]: [string, any]) => {
      if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered[name] = item;
      }
    });
    return filtered;
  }, [currentFolder, searchQuery]);

  const sidebarItems = [
    { name: 'Home', icon: Home, path: ['Home'] },
    { name: 'Desktop', icon: Folder, path: ['Home', 'Desktop'] },
    { name: 'Documents', icon: Folder, path: ['Home', 'Documents'] },
    { name: 'Downloads', icon: Download, path: ['Home', 'Downloads'] },
    { name: 'Pictures', icon: Image, path: ['Home', 'Pictures'] },
    { name: 'Music', icon: Music, path: ['Home', 'Music'] },
    { name: 'Videos', icon: Video, path: ['Home', 'Videos'] }
  ];

  return (
    <div className={`flex flex-col h-full rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Top Toolbar */}
      <div className={`flex items-center justify-between p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            disabled={currentPath.length <= 1}
            className="rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {currentPath.map((path, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => navigateToPath(index)}
                  className="text-blue-500 hover:text-blue-600 text-sm px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {path}
                </button>
                {index < currentPath.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-32 sm:w-48 rounded-lg"
            />
          </div>
          
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-lg rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-lg rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={`w-32 sm:w-48 border-r p-3 overflow-y-auto ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className="font-semibold mb-3 text-xs sm:text-sm">Quick Access</h3>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setCurrentPath(item.path)}
                  className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors text-xs sm:text-sm ${
                    JSON.stringify(currentPath) === JSON.stringify(item.path)
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate hidden sm:block">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Action Bar */}
          <div className={`flex items-center justify-between p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowNewFolderInput(true)}
                size="sm"
                className="rounded-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">New Folder</span>
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              {Object.keys(filteredItems).length} items
            </div>
          </div>

          {/* New Folder Input */}
          {showNewFolderInput && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  className="flex-1 rounded-lg"
                  autoFocus
                />
                <Button onClick={createFolder} size="sm" className="rounded-lg">
                  Create
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }} 
                  size="sm"
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* File Grid/List */}
          <div className="flex-1 p-4 overflow-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {Object.entries(filteredItems).map(([name, item]: [string, any]) => {
                  const IconComponent = item.type === 'folder' ? Folder : getFileIcon(name);
                  return (
                    <button
                      key={name}
                      onDoubleClick={() => {
                        if (item.type === 'folder') {
                          navigateToFolder(name);
                        }
                      }}
                      onClick={() => {
                        if (selectedItems.includes(name)) {
                          setSelectedItems(selectedItems.filter(i => i !== name));
                        } else {
                          setSelectedItems([name]);
                        }
                      }}
                      className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all hover:scale-105 ${
                        selectedItems.includes(name)
                          ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                          : isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`w-6 sm:w-8 h-6 sm:h-8 ${item.type === 'folder' ? 'text-blue-500' : 'text-gray-500'}`} />
                      <span className="text-xs text-center break-words max-w-full leading-tight">
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {Object.entries(filteredItems).map(([name, item]: [string, any]) => {
                  const IconComponent = item.type === 'folder' ? Folder : getFileIcon(name);
                  return (
                    <button
                      key={name}
                      onDoubleClick={() => {
                        if (item.type === 'folder') {
                          navigateToFolder(name);
                        }
                      }}
                      onClick={() => {
                        if (selectedItems.includes(name)) {
                          setSelectedItems(selectedItems.filter(i => i !== name));
                        } else {
                          setSelectedItems([name]);
                        }
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors group ${
                        selectedItems.includes(name)
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 flex-shrink-0 ${item.type === 'folder' ? 'text-blue-500' : 'text-gray-500'}`} />
                      <span className="flex-1 text-sm">{name}</span>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </button>
                  );
                })}
              </div>
            )}

            {Object.keys(filteredItems).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Folder className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? 'No files found' : 'This folder is empty'}
                </p>
                <p className="text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create a new folder to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
