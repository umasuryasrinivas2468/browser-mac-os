// Authentication Service - Clerk Integration with Mock Fallback

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

class AuthService {
  private mockUser: User = {
    id: 'mock-user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  };

  private isClerkAvailable(): boolean {
    // Check if Clerk is available in the environment
    return typeof window !== 'undefined' && (window as any).Clerk;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.isClerkAvailable()) {
      try {
        const clerk = (window as any).Clerk;
        const user = clerk.user;
        
        if (user) {
          return {
            id: user.id,
            name: user.fullName || user.firstName || 'Unknown User',
            email: user.primaryEmailAddress?.emailAddress || '',
            avatar: user.imageUrl
          };
        }
      } catch (error) {
        console.warn('Clerk authentication error, falling back to mock:', error);
      }
    }

    // Fallback to mock user for development
    return this.mockUser;
  }

  async signIn(): Promise<void> {
    if (this.isClerkAvailable()) {
      try {
        const clerk = (window as any).Clerk;
        await clerk.openSignIn();
        return;
      } catch (error) {
        console.warn('Clerk sign-in error:', error);
      }
    }

    // Mock sign-in for development
    console.log('Mock sign-in successful');
  }

  async signOut(): Promise<void> {
    if (this.isClerkAvailable()) {
      try {
        const clerk = (window as any).Clerk;
        await clerk.signOut();
        return;
      } catch (error) {
        console.warn('Clerk sign-out error:', error);
      }
    }

    // Mock sign-out for development
    console.log('Mock sign-out successful');
  }

  async getAuthToken(): Promise<string | null> {
    if (this.isClerkAvailable()) {
      try {
        const clerk = (window as any).Clerk;
        const session = clerk.session;
        if (session) {
          return await session.getToken();
        }
      } catch (error) {
        console.warn('Error getting auth token:', error);
      }
    }

    // Return mock token for development
    return 'mock-jwt-token-' + Date.now();
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (this.isClerkAvailable()) {
      try {
        const clerk = (window as any).Clerk;
        const unsubscribe = clerk.addListener('user', callback);
        return unsubscribe;
      } catch (error) {
        console.warn('Error setting up auth state listener:', error);
      }
    }

    // Mock auth state change for development
    setTimeout(() => callback(this.mockUser), 100);
    return () => {}; // No-op unsubscribe
  }

  generateUserColor(userId: string): string {
    // Generate consistent color for user based on ID
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}

export const authService = new AuthService();