
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Folder, File, Home, Download, Image, Music, Video, ChevronRight } from 'lucide-react';

const FileManager: React.FC = () => {
  const { isDarkMode } = useOS();
  const [currentPath, setCurrentPath] = useState(['Home']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fileStructure = {
    'Home': {
      type: 'folder',
      children: {
        'Documents': {
          type: 'folder',
          children: {
            'Resume.pdf': { type: 'file', icon: File },
            'Project Report.docx': { type: 'file', icon: File },
            'Presentation.pptx': { type: 'file', icon: File }
          }
        },
        'Downloads': {
          type: 'folder',
          children: {
            'installer.dmg': { type: 'file', icon: File },
            'photo.jpg': { type: 'file', icon: Image },
            'song.mp3': { type: 'file', icon: Music }
          }
        },
        'Pictures': {
          type: 'folder',
          children: {
            'vacation.jpg': { type: 'file', icon: Image },
            'family.png': { type: 'file', icon: Image },
            'screenshot.png': { type: 'file', icon: Image }
          }
        },
        'Music': {
          type: 'folder',
          children: {
            'playlist.m3u': { type: 'file', icon: Music },
            'favorite-song.mp3': { type: 'file', icon: Music }
          }
        },
        'Videos': {
          type: 'folder',
          children: {
            'movie.mp4': { type: 'file', icon: Video },
            'tutorial.mov': { type: 'file', icon: Video }
          }
        }
      }
    }
  };

  const getCurrentFolder = () => {
    let current: any = fileStructure;
    for (const path of currentPath) {
      if (current && current[path]) {
        current = current[path];
      } else {
        // If path doesn't exist, reset to Home and return Home's children
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

  const currentFolder = getCurrentFolder();

  const sidebarItems = [
    { name: 'Home', icon: Home, path: ['Home'] },
    { name: 'Documents', icon: Folder, path: ['Home', 'Documents'] },
    { name: 'Downloads', icon: Download, path: ['Home', 'Downloads'] },
    { name: 'Pictures', icon: Image, path: ['Home', 'Pictures'] },
    { name: 'Music', icon: Music, path: ['Home', 'Music'] },
    { name: 'Videos', icon: Video, path: ['Home', 'Videos'] }
  ];

  return (
    <div className={`flex flex-col lg:flex-row h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r p-2 lg:p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <h3 className="font-semibold mb-2 lg:mb-4 text-sm lg:text-base">Favorites</h3>
        <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentPath(item.path)}
              className={`flex-shrink-0 lg:w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-left transition-colors text-sm lg:text-base ${
                JSON.stringify(currentPath) === JSON.stringify(item.path)
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="whitespace-nowrap lg:whitespace-normal">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Breadcrumb */}
        <div className={`flex items-center space-x-1 lg:space-x-2 p-2 lg:p-4 border-b overflow-x-auto ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {currentPath.map((path, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => navigateToPath(index)}
                className="text-blue-500 hover:text-blue-600 text-sm lg:text-base whitespace-nowrap"
              >
                {path}
              </button>
              {index < currentPath.length - 1 && (
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* File Grid */}
        <div className="flex-1 p-2 lg:p-4 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-4">
            {Object.entries(currentFolder).map(([name, item]: [string, any]) => (
              <button
                key={name}
                onDoubleClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(name);
                  }
                }}
                className={`flex flex-col items-center space-y-1 lg:space-y-2 p-2 lg:p-3 rounded-lg transition-colors ${
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
                <span className="text-xs lg:text-sm text-center break-words max-w-full leading-tight">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
