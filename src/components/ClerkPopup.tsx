import React, { useState, useEffect } from 'react';
import { SignIn, SignUp, UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { useOS } from '@/contexts/OSContext';
import { X, Shield, Lock, User, Settings } from 'lucide-react';

interface ClerkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup' | 'profile' | 'settings';
}

const ClerkPopup: React.FC<ClerkPopupProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'signin' 
}) => {
  const { isDarkMode } = useOS();
  const { isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [currentMode, setCurrentMode] = useState(mode);
  const [isSecured, setIsSecured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Add security measures when popup opens
      setIsSecured(true);
      
      // Disable background interactions
      document.body.style.overflow = 'hidden';
      
      // Add blur effect to background
      const mainContent = document.querySelector('#root');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'blur(5px)';
        (mainContent as HTMLElement).style.pointerEvents = 'none';
      }
    } else {
      // Remove security measures when popup closes
      setIsSecured(false);
      document.body.style.overflow = 'auto';
      
      const mainContent = document.querySelector('#root');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'none';
        (mainContent as HTMLElement).style.pointerEvents = 'auto';
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = 'auto';
      const mainContent = document.querySelector('#root');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'none';
        (mainContent as HTMLElement).style.pointerEvents = 'auto';
      }
    };
  }, [isOpen]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderContent = () => {
    if (isSignedIn && (currentMode === 'profile' || currentMode === 'settings')) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {user?.fullName || user?.emailAddresses[0]?.emailAddress}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>

          <div className="space-y-3">
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Account Secured
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your account is protected with advanced security
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Content Protection
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    All content is secured and non-copyable
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Account Settings
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Manage your account preferences
                    </p>
                  </div>
                </div>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Close
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Secure Access Required
          </h2>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please authenticate to access the protected content
          </p>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setCurrentMode('signin')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              currentMode === 'signin'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentMode('signup')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              currentMode === 'signup'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="clerk-container">
          {currentMode === 'signin' ? (
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
                  card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                  headerTitle: isDarkMode ? 'text-white' : 'text-gray-900',
                  headerSubtitle: isDarkMode ? 'text-gray-400' : 'text-gray-600',
                  socialButtonsBlockButton: isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : '',
                  formFieldLabel: isDarkMode ? 'text-gray-300' : 'text-gray-700',
                  formFieldInput: isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : '',
                  footerActionText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
                  footerActionLink: 'text-blue-500 hover:text-blue-600',
                }
              }}
              redirectUrl="/"
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
                  card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                  headerTitle: isDarkMode ? 'text-white' : 'text-gray-900',
                  headerSubtitle: isDarkMode ? 'text-gray-400' : 'text-gray-600',
                  socialButtonsBlockButton: isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : '',
                  formFieldLabel: isDarkMode ? 'text-gray-300' : 'text-gray-700',
                  formFieldInput: isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : '',
                  footerActionText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
                  footerActionLink: 'text-blue-500 hover:text-blue-600',
                }
              }}
              redirectUrl="/"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Secure backdrop with enhanced blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Security indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 text-white">
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">Secure Session</span>
      </div>

      {/* Modal content */}
      <div className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Aczen OS Security
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg hover:bg-gray-200 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ClerkPopup;