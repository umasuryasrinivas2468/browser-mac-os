
import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import Desktop from './Desktop';

const AuthWrapper: React.FC = () => {
  return (
    <>
      <SignedIn>
        <Desktop />
      </SignedIn>
      <SignedOut>
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">Welcome to macOS Web</h1>
              <p className="text-white/80 text-lg">Please sign in to continue</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <SignInButton>
                <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              
              <SignUpButton>
                <button className="px-8 py-3 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
};

export default AuthWrapper;
