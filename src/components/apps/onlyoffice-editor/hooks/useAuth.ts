// Authentication Hook

import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Set up auth state listener
        unsubscribe = authService.onAuthStateChange((newUser) => {
          setUser(newUser);
          setIsLoading(false);
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      await authService.signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await authService.getAuthToken();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get auth token');
      return null;
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    getAuthToken,
    isAuthenticated: !!user
  };
};