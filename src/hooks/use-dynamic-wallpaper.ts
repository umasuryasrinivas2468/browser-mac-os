import { useState, useEffect } from 'react';

export interface WallpaperConfig {
  morning: string;
  afternoon: string;
  evening: string;
}

export const defaultWallpapers: WallpaperConfig = {
  morning: 'https://i.pinimg.com/1200x/0e/af/8a/0eaf8a1b97fa457f4fce83f6284522c3.jpg',
  afternoon: 'https://i.ibb.co/3mZVTzX8/Whats-App-Image-2025-07-28-at-22-37-55-c58f01dd.jpg',
  evening: 'https://i.pinimg.com/736x/26/46/16/264616a7b150c04dfea420cbbae797fb.jpg'
};

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export const useDynamicWallpaper = (currentTime: Date) => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [backgroundClass, setBackgroundClass] = useState<string>('bg-morning');

  const getTimeOfDay = (time: Date): TimeOfDay => {
    const hour = time.getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  };

  const getBackgroundClass = (timeOfDay: TimeOfDay): string => {
    return `bg-${timeOfDay}`;
  };

  useEffect(() => {
    const newTimeOfDay = getTimeOfDay(currentTime);
    const newBackgroundClass = getBackgroundClass(newTimeOfDay);
    
    setTimeOfDay(newTimeOfDay);
    setBackgroundClass(newBackgroundClass);
  }, [currentTime]);

  return {
    timeOfDay,
    backgroundClass,
    currentWallpaper: defaultWallpapers[timeOfDay]
  };
};