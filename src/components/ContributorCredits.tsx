
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Mountain } from 'lucide-react';

const ContributorCredits: React.FC = () => {
  const { isDarkMode, setIsDockVisible } = useOS();
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [currentTime] = useState(new Date());

  // Determine which contributor to show based on time
  const getContributor = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      return { name: 'Smaran P', time: 'Morning' };
    } else if (hour >= 12 && hour < 18) {
      return { name: 'Charitha', time: 'Afternoon' };
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
      case 'Charitha':
        return {
          name: 'Charitha',
          description: 'A talented nature photographer specializing in vibrant afternoon scenes and natural lighting.',
          speciality: 'Afternoon Nature Photography',
          works: ['Daylight landscapes', 'Natural lighting', 'Afternoon scenes', 'Wildlife photography']
        };
      default:
        return null;
    }
  };

  const contributorInfo = selectedContributor ? getContributorInfo(selectedContributor) : null;

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 z-20 h-16 pointer-events-none"
        onMouseEnter={() => setIsDockVisible(true)}
        onMouseLeave={() => setIsDockVisible(false)}
      >
        <div className="absolute bottom-2 right-4 pointer-events-auto">
          <button
            onClick={() => handleContributorClick(contributor.name)}
            className={`text-xs px-3 py-1 rounded-full backdrop-blur-md border transition-all duration-200 hover:scale-105 ${
              isDarkMode 
                ? 'bg-black/30 border-white/10 text-white/80 hover:bg-black/40' 
                : 'bg-white/30 border-black/10 text-black/80 hover:bg-white/40'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Camera className="w-3 h-3" />
              <span>Contributor: {contributor.name}</span>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={!!selectedContributor} onOpenChange={() => setSelectedContributor(null)}>
        <DialogContent className={`max-w-md ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          {contributorInfo && (
            <>
              <DialogHeader>
                <DialogTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Mountain className="w-5 h-5 text-green-500" />
                  <span>{contributorInfo.name}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium text-green-500">Nature Photographer</span>
                </div>
                
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {contributorInfo.description}
                </p>
                
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Speciality: {contributorInfo.speciality}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {contributorInfo.works.map((work, index) => (
                      <div
                        key={index}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-400' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {work}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`text-xs pt-2 border-t ${
                  isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'
                }`}>
                  Thank you for contributing to the beauty of this desktop experience!
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContributorCredits;
