
import { useState, useEffect } from 'react';

export interface WallpaperConfig {
  morning: string;
  afternoon: string;
  evening: string;
}

export const defaultWallpapers: WallpaperConfig = {
  morning: 'https://i.pinimg.com/1200x/0e/af/8a/0eaf8a1b97fa457f4fce83f6284522c3.jpg',
  afternoon: 'https://i.ibb.co/3mZVTzX/Whats-App-Image-2025-07-28-at-22-37-55-c58f01dd.jpg',
  evening: 'https://i.pinimg.com/736x/26/46/16/264616a7b150c04dfea420cbbae797fb.jpg'
};

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export const useDynamicWallpaper = () => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [backgroundClass, setBackgroundClass] = useState<string>('');

  const getTimeOfDay = (time: Date = new Date()): TimeOfDay => {
    const hour = time.getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  };

  const getBackgroundStyle = (wallpaperUrl: string): string => {
    return `background-image: url('${wallpaperUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
  };

  const updateWallpaper = () => {
    const now = new Date();
    const currentTimeOfDay = getTimeOfDay(now);
    const wallpaperUrl = defaultWallpapers[currentTimeOfDay];
    
    console.log('Updating wallpaper:', { 
      hour: now.getHours(), 
      timeOfDay: currentTimeOfDay, 
      wallpaperUrl 
    });
    
    setTimeOfDay(currentTimeOfDay);
    
    // Apply the wallpaper directly to the body
    const style = getBackgroundStyle(wallpaperUrl);
    document.body.style.cssText = style;
    
    setBackgroundClass('dynamic-wallpaper');
  };

  // Initial wallpaper setup
  useEffect(() => {
    updateWallpaper();
  }, []);

  // Set up interval to check and update wallpaper every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateWallpaper();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    timeOfDay,
    backgroundClass,
    currentWallpaper: defaultWallpapers[timeOfDay],
    updateWallpaper // Expose for manual updates if needed
  };
};
