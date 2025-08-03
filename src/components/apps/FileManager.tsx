
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
  Upload,
  ArrowLeft,
  Grid,
  List,
  FolderPlus
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

const FileManager: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentPath, setCurrentPath] = useState(['Home']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fileStructure, setFileStructure] = useState(() => {
    const saved = localStorage.getItem('filemanager_structure');
    if (saved) {
      return JSON.parse(saved);
    }

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

      // Load pictures from screenshots
      const pictures = JSON.parse(localStorage.getItem('filemanager_pictures') || '{}');

      setFileStructure(prev => {
        const updated = { ...prev };
        if (updated.Home?.children?.Documents) {
          updated.Home.children.Documents.children = {
            ...updated.Home.children.Documents.children,
            ...textEditorFiles
          };
        }
        if (updated.Home?.children?.Pictures) {
          updated.Home.children.Pictures.children = {
            ...updated.Home.children.Pictures.children,
            ...pictures
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

  const navigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
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

  // Save document as PDF
  const saveDocumentAsPDF = async (document: any) => {
    try {
      // Create HTML content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>${document.name}</h1>
          <div>${document.content || 'No content available'}</div>
        </div>
      `;

      const options = {
        margin: 1,
        filename: `${document.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(options).from(htmlContent).output('blob');
      
      // Save to Documents folder
      const updatedStructure = { ...fileStructure };
      if (updatedStructure.Home?.children?.Documents) {
        updatedStructure.Home.children.Documents.children[`${document.name}.pdf`] = {
          type: 'file',
          icon: FileText,
          data: pdfBlob,
          created: new Date().toISOString()
        };
      }
      
      setFileStructure(updatedStructure);
      localStorage.setItem('filemanager_structure', JSON.stringify(updatedStructure));
      
      // Also create downloadable link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to save as PDF:', error);
    }
  };

  // Save document as DOC (HTML format with .doc extension)
  const saveDocumentAsDOC = async (document: any) => {
    try {
      const docContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>${document.name}</title>
          </head>
          <body>
            <h1>${document.name}</h1>
            <div>${document.content || 'No content available'}</div>
          </body>
        </html>
      `;

      const blob = new Blob([docContent], { type: 'application/msword' });
      
      // Save to Documents folder
      const updatedStructure = { ...fileStructure };
      if (updatedStructure.Home?.children?.Documents) {
        updatedStructure.Home.children.Documents.children[`${document.name}.doc`] = {
          type: 'file',
          icon: FileText,
          data: blob,
          created: new Date().toISOString()
        };
      }
      
      setFileStructure(updatedStructure);
      localStorage.setItem('filemanager_structure', JSON.stringify(updatedStructure));
      
      // Also create downloadable link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.name}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to save as DOC:', error);
    }
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
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Mobile/Desktop Header */}
      <div className={`flex items-center justify-between p-2 sm:p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          {currentPath.length > 1 && (
            <button
              onClick={navigateBack}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="font-semibold text-sm sm:text-base">File Manager</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="flex items-center space-x-1 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">New Folder</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={`w-16 sm:w-64 border-r p-2 sm:p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} overflow-y-auto`}>
          {/* Search - hidden on mobile */}
          <div className="hidden sm:block relative mb-4">
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
                className={`w-full flex items-center justify-center sm:justify-start space-x-0 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors text-xs sm:text-sm ${
                  JSON.stringify(currentPath) === JSON.stringify(item.path)
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={item.name}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumb */}
          <div className={`flex items-center space-x-2 p-2 sm:p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-2 flex-1 min-w-0 overflow-x-auto">
              {currentPath.map((path, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() => navigateToPath(index)}
                    className="text-blue-500 hover:text-blue-600 truncate whitespace-nowrap text-sm"
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

          {/* Mobile Search */}
          <div className="sm:hidden p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* File Grid */}
          <div className="flex-1 p-2 sm:p-4 overflow-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
                {Object.entries(filteredFolder).map(([name, item]: [string, any]) => (
                  <button
                    key={name}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        navigateToFolder(name);
                      }
                    }}
                    className={`flex flex-col items-center space-y-1 sm:space-y-2 p-2 sm:p-3 rounded-lg transition-colors ${
                      selectedItems.includes(name)
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {item.type === 'folder' ? (
                      <Folder className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-blue-500" />
                    ) : (
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-gray-500" />
                    )}
                    <span className="text-xs sm:text-sm text-center break-words max-w-full line-clamp-2">
                      {name}
                    </span>
                    {item.content && (
                      <div className="flex space-x-1 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveDocumentAsPDF({ name: name.replace(/\.[^/.]+$/, ""), content: item.content });
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                        >
                          PDF
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveDocumentAsDOC({ name: name.replace(/\.[^/.]+$/, ""), content: item.content });
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          DOC
                        </button>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(filteredFolder).map(([name, item]: [string, any]) => (
                  <div
                    key={name}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        navigateToFolder(name);
                      }
                    }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      selectedItems.includes(name)
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {item.type === 'folder' ? (
                      <Folder className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    ) : (
                      <item.icon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm truncate">{name}</span>
                    {item.content && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveDocumentAsPDF({ name: name.replace(/\.[^/.]+$/, ""), content: item.content });
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                        >
                          PDF
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveDocumentAsDOC({ name: name.replace(/\.[^/.]+$/, ""), content: item.content });
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          DOC
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
