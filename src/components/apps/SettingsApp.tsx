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
  const { isDarkMode, setIsDarkMode, currentTime } = useOS();
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
    timezone: 'auto',
    batteryLevel: 85,
    cpuUsage: 23,
    memoryUsage: 67,
    storageUsed: 45
  });

  const updateSetting = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
        enabled ? 'bg-blue-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 absolute top-0.5 ${
          enabled ? 'transform translate-x-6' : 'transform translate-x-0.5'
        }`}
      />
    </button>
  );

  const Slider = ({ value, onChange, min = 0, max = 100 }: { value: number; onChange: (value: number) => void; min?: number; max?: number }) => (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, ${isDarkMode ? '#374151' : '#e5e7eb'} ${value}%, ${isDarkMode ? '#374151' : '#e5e7eb'} 100%)`
        }}
      />
    </div>
  );

  // Real system information
  const getSystemInfo = () => {
    const now = new Date();
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const cookieEnabled = navigator.cookieEnabled;
    const onlineStatus = navigator.onLine;
    
    // Detect browser
    let browserName = 'Unknown';
    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';
    
    // Detect OS
    let osName = 'Unknown';
    if (platform.includes('Win')) osName = 'Windows';
    else if (platform.includes('Mac')) osName = 'macOS';
    else if (platform.includes('Linux')) osName = 'Linux';
    else if (userAgent.includes('Android')) osName = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) osName = 'iOS';
    
    // Safe memory access with type checking
    const getMemoryUsage = () => {
      try {
        const perf = performance as any;
        if (perf.memory && perf.memory.usedJSHeapSize) {
          return Math.round(perf.memory.usedJSHeapSize / 1024 / 1024);
        }
      } catch (error) {
        console.log('Memory API not available');
      }
      return 16; // fallback value
    };
    
    return {
      processor: `${browserName} Engine`,
      ram: `${getMemoryUsage()} MB Used`,
      storage: `512 GB Available`,
      graphics: `${osName} Graphics`,
      os: `Aczen OS v2.1.0 (${osName})`,
      build: now.toLocaleDateString(),
      uptime: `${Math.floor(performance.now() / 1000 / 60)} minutes`,
      resolution: `${window.innerWidth} × ${window.innerHeight}`,
      browser: browserName,
      platform: platform,
      language: language,
      cookieEnabled: cookieEnabled,
      onlineStatus: onlineStatus,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const systemInfo = getSystemInfo();

  const settingsCategories = [
    {
      id: 'display',
      title: 'Display & Brightness',
      icon: Monitor,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
            <div className="space-y-4">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 rounded-lg gap-3 sm:gap-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  {isDarkMode ? <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" /> : <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />}
                  <div>
                    <span className={`text-sm lg:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</span>
                    <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <ToggleSwitch enabled={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
              </div>
              
              <div className={`p-3 lg:p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <label className={`block text-xs lg:text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Font Size
                </label>
                <select 
                  value={systemSettings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value)}
                  className={`w-full px-2 lg:px-3 py-1.5 lg:py-2 text-sm lg:text-base rounded-md border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Screen Resolution
                </label>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {systemInfo.resolution} (Current)
                </p>
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
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Audio</h3>
            <div className="space-y-4">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 rounded-lg gap-3 sm:gap-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                  <div>
                    <span className={`text-sm lg:text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Sounds</span>
                    <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Play sounds for notifications and system events
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.soundEnabled} 
                  onChange={() => updateSetting('soundEnabled', !systemSettings.soundEnabled)} 
                />
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Master Volume
                  </label>
                  <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {systemSettings.volume}%
                  </span>
                </div>
                <Slider 
                  value={systemSettings.volume} 
                  onChange={(value) => updateSetting('volume', value)} 
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  <div>
                    <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Allow Notifications</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Receive notifications from apps and system
                    </p>
                  </div>
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
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wireless</h3>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5 text-green-500" />
                  <div>
                    <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wi-Fi</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect to wireless networks
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.wifi} 
                  onChange={() => updateSetting('wifi', !systemSettings.wifi)} 
                />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Bluetooth className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bluetooth</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect to Bluetooth devices
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={systemSettings.bluetooth} 
                  onChange={() => updateSetting('bluetooth', !systemSettings.bluetooth)} 
                />
              </div>
            </div>
          </div>

          {systemSettings.wifi && (
            <div className={`p-4 rounded-lg border-l-4 ${
              isDarkMode 
                ? 'bg-gray-800 border-green-500 text-white' 
                : 'bg-green-50 border-green-500 text-gray-900'
            }`}>
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Aczen-WiFi</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Connected • Strong Signal • 5GHz
                  </div>
                </div>
              </div>
            </div>
          )}
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
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Device Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
              <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Cpu className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Browser Engine</span>
                </div>
                <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.processor}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Usage</span>
                    <span>{systemSettings.cpuUsage}%</span>
                  </div>
                  <div className={`w-full bg-gray-300 rounded-full h-1.5 lg:h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div 
                      className="bg-blue-500 h-1.5 lg:h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemSettings.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <HardDrive className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Storage</span>
                </div>
                <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.storage}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Used</span>
                    <span>{systemSettings.storageUsed}%</span>
                  </div>
                  <div className={`w-full bg-gray-300 rounded-full h-1.5 lg:h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div 
                      className="bg-green-500 h-1.5 lg:h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemSettings.storageUsed}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Battery className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Health</span>
                </div>
                <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemSettings.batteryLevel}% • Excellent</p>
                <div className="mt-2">
                  <div className={`w-full bg-gray-300 rounded-full h-1.5 lg:h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div 
                      className="bg-yellow-500 h-1.5 lg:h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemSettings.batteryLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Monitor className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Memory</span>
                </div>
                <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.ram}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Used</span>
                    <span>{systemSettings.memoryUsage}%</span>
                  </div>
                  <div className={`w-full bg-gray-300 rounded-full h-1.5 lg:h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div 
                      className="bg-purple-500 h-1.5 lg:h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemSettings.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-500" />
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Network</span>
                </div>
                <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {systemInfo.onlineStatus ? 'Connected' : 'Offline'}
                </p>
                <div className="mt-1">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {systemInfo.timezone}
                  </span>
                </div>
              </div>

              <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Platform</span>
                </div>
                <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.platform}</p>
                <div className="mt-1">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {systemInfo.language}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Software Information</h3>
            <div className={`p-3 lg:p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Aczen OS</span>
                  <span className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.os}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Browser</span>
                  <span className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.browser}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Build Date</span>
                  <span className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.build}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Session Time</span>
                  <span className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.uptime}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resolution</span>
                  <span className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{systemInfo.resolution}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={`font-medium text-sm lg:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cookies</span>
                  <span className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {systemInfo.cookieEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`flex h-full relative transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-colors ${
          isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
        w-72 sm:w-80 h-full border-r transition-all duration-300 ease-in-out
        ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
      `}>
        <div className="p-6">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
            <button
              onClick={closeSidebar}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop title */}
          <h2 className={`hidden lg:block text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
          
          <div className="space-y-2">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  closeSidebar();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <category.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{category.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 lg:hidden" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="p-6 lg:p-8">
          {/* Mobile header */}
          <div className="lg:hidden mb-6 pt-12">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {settingsCategories.find(cat => cat.id === selectedCategory)?.title}
            </h1>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
