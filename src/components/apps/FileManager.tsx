
import React, { useState, useEffect } from 'react';
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
  Cloud,
  FileText,
  Trash2,
  Upload
} from 'lucide-react';

const FileManager: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentPath, setCurrentPath] = useState(['Home']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileStructure, setFileStructure] = useState(() => {
    // Initialize with saved data or default structure
    const saved = localStorage.getItem('filemanager_structure');
    if (saved) {
      return JSON.parse(saved);
    }

    // Default structure without Desktop
    return {
      'Home': {
        type: 'folder',
        children: {
          'Documents': {
            type: 'folder',
            children: {}
          },
          'Downloads': {
            type: 'folder', 
            children: {
              'sample-app.dmg': { type: 'file', icon: File }
            }
          },
          'Pictures': {
            type: 'folder',
            children: {}
          },
          'Music': {
            type: 'folder',
            children: {}
          },
          'Videos': {
            type: 'folder',
            children: {}
          }
        }
      }
    };
  });

  // Load files from TextEditor into Documents
  useEffect(() => {
    const loadTextEditorFiles = () => {
      const documentsPath = ['Home', 'Documents'];
      const textEditorFiles = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('texteditor_')) {
          try {
            const fileData = JSON.parse(localStorage.getItem(key) || '{}');
            if (fileData.type === 'text') {
              textEditorFiles[fileData.name] = { 
                type: 'file', 
                icon: FileText,
                content: fileData.content,
                created: fileData.created
              };
            }
          } catch (e) {
            console.error('Error loading text editor file:', e);
          }
        }
      }

      setFileStructure(prev => {
        const updated = { ...prev };
        if (updated.Home?.children?.Documents) {
          updated.Home.children.Documents.children = {
            ...updated.Home.children.Documents.children,
            ...textEditorFiles
          };
        }
        localStorage.setItem('filemanager_structure', JSON.stringify(updated));
        return updated;
      });
    };

    loadTextEditorFiles();
  }, []);

  const getCurrentFolder = () => {
    let current: any = fileStructure;
    for (const path of currentPath) {
      if (current && current[path]) {
        current = current[path];
      } else {
        setCurrentPath(['Home']);
        return fileStructure['Home'].children || {};
      }
    }
    return current?.children || {};
  };

  const navigateToFolder = (folderName: string) => {
    const currentFolder = getCurrentFolder();
    if (currentFolder[folderName] && currentFolder[folderName].type === 'folder') {
      setCurrentPath([...currentPath, folderName]);
    }
  };

  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;
    
    const updateStructure = (structure: any, path: string[], folderName: string) => {
      const updated = { ...structure };
      let current = updated;
      
      for (const pathPart of path) {
        if (current[pathPart]) {
          current = current[pathPart].children;
        }
      }
      
      current[folderName] = {
        type: 'folder',
        children: {}
      };
      
      return updated;
    };

    const updatedStructure = updateStructure(fileStructure, currentPath, newFolderName);
    setFileStructure(updatedStructure);
    localStorage.setItem('filemanager_structure', JSON.stringify(updatedStructure));
    setShowNewFolderDialog(false);
    setNewFolderName('');
  };

  const filterItems = (items: any) => {
    if (!searchQuery.trim()) return items;
    
    const filtered: any = {};
    Object.entries(items).forEach(([name, item]: [string, any]) => {
      if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered[name] = item;
      }
    });
    return filtered;
  };

  const currentFolder = getCurrentFolder();
  const filteredFolder = filterItems(currentFolder);

  const sidebarItems = [
    { name: 'Home', icon: Home, path: ['Home'] },
    { name: 'Documents', icon: Folder, path: ['Home', 'Documents'] },
    { name: 'Downloads', icon: Download, path: ['Home', 'Downloads'] },
    { name: 'Pictures', icon: Image, path: ['Home', 'Pictures'] },
    { name: 'Music', icon: Music, path: ['Home', 'Music'] },
    { name: 'Videos', icon: Video, path: ['Home', 'Videos'] },
    { name: 'Aczen Cloud', icon: Cloud, path: ['AczenCloud'] }
  ];

  return (
    <div className={`flex flex-col lg:flex-row h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="font-semibold">File Manager</h2>
        <button
          onClick={() => setShowNewFolderDialog(true)}
          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`w-full lg:w-64 border-r p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Favorites</h3>
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="hidden lg:block p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentPath(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                JSON.stringify(currentPath) === JSON.stringify(item.path)
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <div className={`flex items-center space-x-2 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {currentPath.map((path, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => navigateToPath(index)}
                  className="text-blue-500 hover:text-blue-600 truncate"
                >
                  {path}
                </button>
                {index < currentPath.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 lg:gap-4">
            {Object.entries(filteredFolder).map(([name, item]: [string, any]) => (
              <button
                key={name}
                onDoubleClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(name);
                  }
                }}
                className={`flex flex-col items-center space-y-2 p-2 lg:p-3 rounded-lg transition-colors ${
                  selectedItems.includes(name)
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                {item.type === 'folder' ? (
                  <Folder className="w-8 h-8 lg:w-12 lg:h-12 text-blue-500" />
                ) : (
                  <item.icon className="w-8 h-8 lg:w-12 lg:h-12 text-gray-500" />
                )}
                <span className="text-xs lg:text-sm text-center break-words max-w-full line-clamp-2">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
              className={`w-full px-3 py-2 border rounded-lg mb-4 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createNewFolder}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
