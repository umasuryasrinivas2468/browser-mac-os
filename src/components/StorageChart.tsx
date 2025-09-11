import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { HardDrive, RefreshCw } from 'lucide-react';
import { useStorageInfo } from '@/hooks/useStorageInfo';

interface StorageChartProps {
  isDarkMode: boolean;
}

const StorageChart: React.FC<StorageChartProps> = ({ isDarkMode }) => {
  const { storageInfo, isLoading, error, refresh } = useStorageInfo();

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !storageInfo) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            {error || 'Unable to load storage information'}
          </p>
          <button 
            onClick={refresh}
            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = [
    {
      name: 'Used',
      value: storageInfo.used,
      color: '#ef4444',
      formatted: storageInfo.usedFormatted
    },
    {
      name: 'Available',
      value: storageInfo.available,
      color: '#10b981',
      formatted: storageInfo.availableFormatted
    }
  ];

  const COLORS = {
    Used: '#ef4444',
    Available: '#10b981'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.name}: {data.formatted}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <HardDrive className="w-5 h-5 text-blue-500" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Storage Usage
          </h3>
        </div>
        <button
          onClick={refresh}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Refresh storage data"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className={`p-4 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Storage
              </span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {storageInfo.totalFormatted}
              </span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${storageInfo.usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-red-500">Used: {storageInfo.usedFormatted}</span>
              <span className="text-green-500">Available: {storageInfo.availableFormatted}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-red-600 text-xs font-medium">USED</div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                {storageInfo.usedFormatted}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-red-500' : 'text-red-600'}`}>
                {storageInfo.usagePercentage.toFixed(1)}%
              </div>
            </div>

            <div className={`p-3 rounded ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <div className="text-green-600 text-xs font-medium">FREE</div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                {storageInfo.availableFormatted}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-green-600'}`}>
                {(100 - storageInfo.usagePercentage).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageChart;