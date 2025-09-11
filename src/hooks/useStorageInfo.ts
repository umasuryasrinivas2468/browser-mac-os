import { useState, useEffect } from 'react';

export interface StorageInfo {
  used: number;
  total: number;
  available: number;
  usedFormatted: string;
  totalFormatted: string;
  availableFormatted: string;
  usagePercentage: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const useStorageInfo = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateStorageInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const available = total - used;
        const usagePercentage = total > 0 ? (used / total) * 100 : 0;

        setStorageInfo({
          used,
          total,
          available,
          usedFormatted: formatBytes(used),
          totalFormatted: formatBytes(total),
          availableFormatted: formatBytes(available),
          usagePercentage: Math.round(usagePercentage * 100) / 100
        });
      } else {
        // Fallback for browsers that don't support Storage API
        const fallbackTotal = 1024 * 1024 * 1024; // 1GB fallback
        const fallbackUsed = fallbackTotal * 0.3; // 30% used
        const fallbackAvailable = fallbackTotal - fallbackUsed;

        setStorageInfo({
          used: fallbackUsed,
          total: fallbackTotal,
          available: fallbackAvailable,
          usedFormatted: formatBytes(fallbackUsed),
          totalFormatted: formatBytes(fallbackTotal),
          availableFormatted: formatBytes(fallbackAvailable),
          usagePercentage: 30
        });
      }
    } catch (err) {
      setError('Failed to retrieve storage information');
      console.error('Storage API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateStorageInfo();
    
    // Update storage info every 30 seconds
    const interval = setInterval(updateStorageInfo, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { storageInfo, isLoading, error, refresh: updateStorageInfo };
};