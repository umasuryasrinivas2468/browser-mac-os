// Collaboration Hook - Real-time collaboration features

import { useState, useEffect, useCallback } from 'react';
import { CollaborationUser } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { useAuth } from './useAuth';

export const useCollaboration = (documentId: string | null) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize collaboration
  useEffect(() => {
    if (!documentId || !user) return;

    let unsubscribe: (() => void) | null = null;

    const initCollaboration = async () => {
      try {
        setError(null);
        
        // Add current user as collaborator
        const currentUserAsCollaborator: CollaborationUser = {
          id: user.id,
          name: user.name,
          email: user.email || '',
          avatar: user.avatar,
          color: authService.generateUserColor(user.id),
          isOnline: true
        };

        setCollaborators([currentUserAsCollaborator]);
        setIsConnected(true);

        // Subscribe to document changes for real-time collaboration
        unsubscribe = storageService.subscribeToDocument(documentId, (payload) => {
          handleCollaborationUpdate(payload);
        });

        // Simulate other collaborators joining (for demo purposes)
        setTimeout(() => {
          if (Math.random() > 0.7) { // 30% chance of having other collaborators
            addMockCollaborators();
          }
        }, 2000);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize collaboration');
        setIsConnected(false);
      }
    };

    initCollaboration();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      setIsConnected(false);
      setCollaborators([]);
    };
  }, [documentId, user]);

  // Handle collaboration updates
  const handleCollaborationUpdate = useCallback((payload: any) => {
    console.log('Collaboration update:', payload);
    
    // Handle different types of collaboration events
    switch (payload.eventType) {
      case 'user_joined':
        addCollaborator(payload.user);
        break;
      case 'user_left':
        removeCollaborator(payload.userId);
        break;
      case 'cursor_moved':
        updateUserCursor(payload.userId, payload.cursor);
        break;
      case 'user_typing':
        updateUserStatus(payload.userId, 'typing');
        break;
      default:
        console.log('Unknown collaboration event:', payload.eventType);
    }
  }, []);

  // Add collaborator
  const addCollaborator = useCallback((newUser: CollaborationUser) => {
    setCollaborators(prev => {
      const exists = prev.find(user => user.id === newUser.id);
      if (exists) {
        return prev.map(user => 
          user.id === newUser.id 
            ? { ...user, isOnline: true }
            : user
        );
      }
      return [...prev, { ...newUser, isOnline: true }];
    });
  }, []);

  // Remove collaborator
  const removeCollaborator = useCallback((userId: string) => {
    setCollaborators(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isOnline: false }
          : user
      )
    );

    // Remove offline users after delay
    setTimeout(() => {
      setCollaborators(prev => prev.filter(user => user.isOnline));
    }, 5000);
  }, []);

  // Update user cursor position
  const updateUserCursor = useCallback((userId: string, cursor: { x: number; y: number }) => {
    setCollaborators(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, cursor }
          : user
      )
    );
  }, []);

  // Update user status
  const updateUserStatus = useCallback((userId: string, status: string) => {
    // This could be extended to show typing indicators, etc.
    console.log(`User ${userId} is ${status}`);
  }, []);

  // Invite user to collaborate
  const inviteUser = async (email: string, permissions: any): Promise<void> => {
    try {
      setError(null);
      
      // In a real implementation, this would send an invitation email
      console.log('Inviting user:', email, permissions);
      
      // For demo purposes, simulate adding a user
      const mockUser: CollaborationUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
        color: authService.generateUserColor(email),
        isOnline: false // They'll come online when they accept
      };

      // This would typically be handled by the backend
      setTimeout(() => {
        addCollaborator(mockUser);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user');
    }
  };

  // Remove collaborator
  const removeCollaboratorById = async (userId: string): Promise<void> => {
    try {
      setError(null);
      
      // In a real implementation, this would update permissions in the backend
      removeCollaborator(userId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collaborator');
    }
  };

  // Get online collaborators count
  const getOnlineCount = useCallback(() => {
    return collaborators.filter(user => user.isOnline).length;
  }, [collaborators]);

  // Add mock collaborators for demo
  const addMockCollaborators = () => {
    const mockUsers: CollaborationUser[] = [
      {
        id: 'demo_user_1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        color: '#FF6B6B',
        isOnline: true
      },
      {
        id: 'demo_user_2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face',
        color: '#4ECDC4',
        isOnline: Math.random() > 0.5
      }
    ];

    mockUsers.forEach((user, index) => {
      setTimeout(() => {
        addCollaborator(user);
      }, (index + 1) * 1000);
    });
  };

  // Send cursor position (for real-time cursor tracking)
  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (!documentId || !user) return;

    // In a real implementation, this would send cursor position to other users
    console.log('Sending cursor position:', { x, y });
    
    // Update own cursor position
    setCollaborators(prev => 
      prev.map(collaborator => 
        collaborator.id === user.id 
          ? { ...collaborator, cursor: { x, y } }
          : collaborator
      )
    );
  }, [documentId, user]);

  return {
    collaborators,
    isConnected,
    error,
    onlineCount: getOnlineCount(),
    inviteUser,
    removeCollaborator: removeCollaboratorById,
    sendCursorPosition
  };
};