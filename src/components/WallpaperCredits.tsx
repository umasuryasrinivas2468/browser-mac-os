
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Mountain, Info } from 'lucide-react';

const WallpaperCredits: React.FC = () => {
  const { isDarkMode } = useOS();
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [currentTime] = useState(new Date());

  // Determine which contributor to show based on time
  const getContributor = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      return { name: 'Smaran P', time: 'Morning' };
    } else if (hour >= 12 && hour < 18) {
      return { name: 'Charita N', time: 'Afternoon' };
    } else {
      return { name: 'Smaran P', time: 'Evening' };
    }
  };

  const contributor = getContributor();

  const handleContributorClick = (contributorName: string) => {
    setSelectedContributor(contributorName);
  };

  const getContributorInfo = (name: string) => {
    switch (name) {
      case 'Smaran P':
        return {
          name: 'Smaran P',
          description: 'A passionate nature photographer who captures the beauty of mornings and evenings through stunning landscape photography.',
          speciality: 'Morning & Evening Landscapes',
          works: ['Sunrise captures', 'Golden hour photography', 'Mountain landscapes', 'Sunset compositions']
        };
      case 'Charita N':
        return {
          name: 'Charita N',
          description: 'An expert in daylight photography, specializing in vibrant afternoon scenes and natural lighting.',
          speciality: 'Afternoon Photography',
          works: ['Daylight landscapes', 'Natural lighting', 'Afternoon scenes', 'Wildlife photography']
        };
      default:
        return null;
    }
  };

  const contributorInfo = selectedContributor ? getContributorInfo(selectedContributor) : null;

  return (
    <>
      {/* Wallpaper Credits - positioned at top right corner, below the time */}
      <div className="fixed top-16 right-8 z-10 pointer-events-auto">
        <button
          onClick={() => handleContributorClick(contributor.name)}
          className={`text-xs px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100 ${
            isDarkMode 
              ? 'bg-black/30 text-white/80 hover:bg-black/40 hover:text-white' 
              : 'bg-white/30 text-black/80 hover:bg-white/40 hover:text-black'
          } hover:shadow-lg border border-white/20`}
          title={`Wallpaper by ${contributor.name} - ${contributor.time}`}
        >
          <div className="flex items-center space-x-2">
            <Camera className="w-3 h-3" />
            <span className="font-medium">{contributor.name}</span>
          </div>
        </button>
      </div>

      <Dialog open={!!selectedContributor} onOpenChange={() => setSelectedContributor(null)}>
        <DialogContent className={`max-w-md ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          {contributorInfo && (
            <>
              <DialogHeader>
                <DialogTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Mountain className="w-5 h-5 text-green-500" />
                  <span>Wallpaper by {contributorInfo.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    About the Photographer
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {contributorInfo.description}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Speciality
                  </h3>
                  <p className={`text-sm text-blue-500 font-medium`}>
                    {contributorInfo.speciality}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notable Works
                  </h3>
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {contributorInfo.works.map((work, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        <span>{work}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-3 rounded-lg border-l-4 border-green-500 ${
                  isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      This wallpaper changes based on the time of day to match your current environment.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WallpaperCredits;
