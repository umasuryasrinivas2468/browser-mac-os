
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
      current = current[path];
    }
    return current.children || {};
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
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
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`w-64 border-r p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <h3 className="font-semibold mb-4">Favorites</h3>
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentPath(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                JSON.stringify(currentPath) === JSON.stringify(item.path)
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className={`flex items-center space-x-2 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {currentPath.map((path, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => navigateToPath(index)}
                className="text-blue-500 hover:text-blue-600"
              >
                {path}
              </button>
              {index < currentPath.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* File Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(currentFolder).map(([name, item]: [string, any]) => (
              <button
                key={name}
                onDoubleClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(name);
                  }
                }}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
                  selectedItems.includes(name)
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                {item.type === 'folder' ? (
                  <Folder className="w-12 h-12 text-blue-500" />
                ) : (
                  <item.icon className="w-12 h-12 text-gray-500" />
                )}
                <span className="text-sm text-center break-words max-w-full">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
