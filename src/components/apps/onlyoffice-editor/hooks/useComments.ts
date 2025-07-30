// Comments Hook - Document commenting system

import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentReply } from '../types';
import { useAuth } from './useAuth';

export const useComments = (documentId: string | null) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments for document
  useEffect(() => {
    if (!documentId) {
      setComments([]);
      return;
    }

    loadComments();
  }, [documentId]);

  // Load comments from storage
  const loadComments = async () => {
    if (!documentId) return;

    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would fetch from Supabase
      const storedComments = localStorage.getItem(`comments_${documentId}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      } else {
        setComments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  // Save comments to storage
  const saveComments = useCallback((updatedComments: Comment[]) => {
    if (!documentId) return;

    try {
      localStorage.setItem(`comments_${documentId}`, JSON.stringify(updatedComments));
      setComments(updatedComments);
    } catch (err) {
      console.error('Failed to save comments:', err);
    }
  }, [documentId]);

  // Add new comment
  const addComment = async (
    content: string, 
    position?: { page: number; x: number; y: number }
  ): Promise<Comment> => {
    if (!user || !documentId) {
      throw new Error('User not authenticated or document not selected');
    }

    try {
      setError(null);

      const newComment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        documentId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        position,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolved: false
      };

      const updatedComments = [newComment, ...comments];
      saveComments(updatedComments);

      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Reply to comment
  const replyToComment = async (commentId: string, content: string): Promise<CommentReply> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const reply: CommentReply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        createdAt: new Date().toISOString()
      };

      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              replies: [...comment.replies, reply],
              updatedAt: new Date().toISOString()
            }
          : comment
      );

      saveComments(updatedComments);
      return reply;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reply to comment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Edit comment
  const editComment = async (commentId: string, newContent: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const updatedComments = comments.map(comment => 
        comment.id === commentId && comment.userId === user.id
          ? { 
              ...comment, 
              content: newContent,
              updatedAt: new Date().toISOString()
            }
          : comment
      );

      saveComments(updatedComments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit comment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const comment = comments.find(c => c.id === commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Only allow deletion by comment author or document owner
      if (comment.userId !== user.id) {
        throw new Error('Not authorized to delete this comment');
      }

      const updatedComments = comments.filter(c => c.id !== commentId);
      saveComments(updatedComments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Resolve/unresolve comment
  const toggleCommentResolution = async (commentId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              resolved: !comment.resolved,
              updatedAt: new Date().toISOString()
            }
          : comment
      );

      saveComments(updatedComments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle comment resolution';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get comments by position (for showing comments at specific locations)
  const getCommentsByPosition = useCallback((page: number, x: number, y: number, threshold = 50) => {
    return comments.filter(comment => {
      if (!comment.position) return false;
      
      const distance = Math.sqrt(
        Math.pow(comment.position.x - x, 2) + Math.pow(comment.position.y - y, 2)
      );
      
      return comment.position.page === page && distance <= threshold;
    });
  }, [comments]);

  // Get unresolved comments count
  const getUnresolvedCount = useCallback(() => {
    return comments.filter(comment => !comment.resolved).length;
  }, [comments]);

  // Get comments by user
  const getCommentsByUser = useCallback((userId: string) => {
    return comments.filter(comment => comment.userId === userId);
  }, [comments]);

  // Search comments
  const searchComments = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return comments.filter(comment => 
      comment.content.toLowerCase().includes(lowercaseQuery) ||
      comment.userName.toLowerCase().includes(lowercaseQuery) ||
      comment.replies.some(reply => 
        reply.content.toLowerCase().includes(lowercaseQuery) ||
        reply.userName.toLowerCase().includes(lowercaseQuery)
      )
    );
  }, [comments]);

  // Sort comments
  const getSortedComments = useCallback((sortBy: 'newest' | 'oldest' | 'resolved' | 'unresolved' = 'newest') => {
    const sorted = [...comments];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'resolved':
        return sorted.filter(comment => comment.resolved);
      case 'unresolved':
        return sorted.filter(comment => !comment.resolved);
      default:
        return sorted;
    }
  }, [comments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    replyToComment,
    editComment,
    deleteComment,
    toggleCommentResolution,
    getCommentsByPosition,
    getUnresolvedCount: getUnresolvedCount(),
    getCommentsByUser,
    searchComments,
    getSortedComments,
    loadComments
  };
};