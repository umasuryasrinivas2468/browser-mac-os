
import React from 'react';
import { useOS } from '@/contexts/OSContext';
import { Monitor, User, Wifi, Moon, Sun } from 'lucide-react';

const SettingsApp: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useOS();

  const settingsCategories = [
    {
      id: 'display',
      title: 'Display & Brightness',
      icon: Monitor,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>Dark Mode</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  isDarkMode ? 'transform translate-x-6' : 'transform translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'user',
      title: 'User Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">John Doe</h3>
              <p className="text-gray-500">john.doe@example.com</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                type="text" 
                defaultValue="John Doe" 
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                defaultValue="john.doe@example.com" 
                className={`w-full px-3 py-2 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'network',
      title: 'Network Settings',
      icon: Wifi,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Aczen-WiFi</div>
                <div className="text-sm text-gray-500">Connected</div>
              </div>
            </div>
            <div className="text-green-600 font-medium">Connected</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Available Networks:</div>
            {['Office-WiFi', 'Home-Network', 'Guest-WiFi'].map((network) => (
              <div key={network} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span>{network}</span>
                </div>
                <button className="text-blue-500 text-sm">Connect</button>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('display');

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`w-64 border-r p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-1">
          {settingsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {settingsCategories.find(cat => cat.id === selectedCategory)?.content}
      </div>
    </div>
  );
};

export default SettingsApp;
