
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Monitor, 
  User, 
  Wifi, 
  Moon, 
  Sun, 
  Volume2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Keyboard, 
  Mouse, 
  HardDrive, 
  Cpu, 
  Battery, 
  Bluetooth,
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const SettingsApp: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useOS();
  const [selectedCategory, setSelectedCategory] = useState('display');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    soundEnabled: true,
    volume: 75,
    autoUpdate: true,
    locationServices: false,
    bluetooth: true,
    wifi: true,
    screenTimeout: 15,
    fontSize: 'medium',
    wallpaper: 'default',
    language: 'en',
    timezone: 'auto'
  });

  const updateSetting = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
          enabled ? 'transform translate-x-6' : 'transform translate-x-0.5'
        }`}
      />
    </button>
  );

  const Slider = ({ value, onChange, min = 0, max = 100 }: { value: number; onChange: (value: number) => void; min?: number; max?: number }) => (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
    />
  );

  const settingsCategories = [
    {
      id: 'display',
      title: 'Display & Brightness',
      icon: Monitor,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>Dark Mode</span>
                </div>
                <ToggleSwitch enabled={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Size</label>
                <select 
                  value={systemSettings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Screen Timeout (minutes)</label>
                <select 
                  value={systemSettings.screenTimeout}
                  onChange={(e) => updateSetting('screenTimeout', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sound',
      title: 'Sound & Notifications',
      icon: Volume2,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Audio</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5" />
                  <span>System Sounds</span>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.soundEnabled} 
                  onChange={() => updateSetting('soundEnabled', !systemSettings.soundEnabled)} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Volume</label>
                  <span className="text-sm text-gray-500">{systemSettings.volume}%</span>
                </div>
                <Slider 
                  value={systemSettings.volume} 
                  onChange={(value) => updateSetting('volume', value)} 
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5" />
                  <span>Allow Notifications</span>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.notifications} 
                  onChange={() => updateSetting('notifications', !systemSettings.notifications)} 
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'network',
      title: 'Network & Internet',
      icon: Wifi,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Wireless</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5" />
                  <span>Wi-Fi</span>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.wifi} 
                  onChange={() => updateSetting('wifi', !systemSettings.wifi)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bluetooth className="w-5 h-5" />
                  <span>Bluetooth</span>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.bluetooth} 
                  onChange={() => updateSetting('bluetooth', !systemSettings.bluetooth)} 
                />
              </div>
            </div>
          </div>

          {systemSettings.wifi && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Aczen-WiFi</div>
                  <div className="text-sm text-gray-500">Connected • Strong Signal</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5" />
                  <span>Location Services</span>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.locationServices} 
                  onChange={() => updateSetting('locationServices', !systemSettings.locationServices)} 
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5" />
                  <span>Auto Updates</span>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.autoUpdate} 
                  onChange={() => updateSetting('autoUpdate', !systemSettings.autoUpdate)} 
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'system',
      title: 'System Information',
      icon: Cpu,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Device Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Processor</span>
                </div>
                <p className="text-sm text-gray-500">Intel Core i7-12700K</p>
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <HardDrive className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Storage</span>
                </div>
                <p className="text-sm text-gray-500">512 GB SSD</p>
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Battery className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Battery</span>
                </div>
                <p className="text-sm text-gray-500">85% • Good Health</p>
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Monitor className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Display</span>
                </div>
                <p className="text-sm text-gray-500">1920 × 1080</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Software</h3>
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Aczen OS</span>
                  <span className="text-sm text-gray-500">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Build</span>
                  <span className="text-sm text-gray-500">2024.01.15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'language',
      title: 'Language & Region',
      icon: Globe,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Language</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">System Language</label>
                <select 
                  value={systemSettings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Time Zone</label>
                <select 
                  value={systemSettings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="auto">Automatic</option>
                  <option value="utc">UTC</option>
                  <option value="est">Eastern Time</option>
                  <option value="pst">Pacific Time</option>
                  <option value="gmt">GMT</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`flex h-full relative ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50'}`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
        } shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-50 md:z-auto
        w-64 md:w-64 lg:w-72 h-full border-r transition-transform duration-300 ease-in-out
        ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}
      `}>
        <div className="p-4">
          {/* Mobile close button */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button
              onClick={closeSidebar}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop title */}
          <h2 className="hidden md:block text-lg font-semibold mb-4">Settings</h2>
          
          <div className="space-y-1">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  closeSidebar();
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <category.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm md:text-base">{category.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 md:hidden" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Mobile header */}
          <div className="md:hidden mb-6 pt-12">
            <h1 className="text-xl font-semibold">
              {settingsCategories.find(cat => cat.id === selectedCategory)?.title}
            </h1>
          </div>

          {/* Desktop header */}
          <div className="hidden md:block mb-6">
            <h1 className="text-2xl font-semibold">
              {settingsCategories.find(cat => cat.id === selectedCategory)?.title}
            </h1>
          </div>

          {/* Content */}
          <div className="max-w-4xl">
            {settingsCategories.find(cat => cat.id === selectedCategory)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
