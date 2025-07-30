// Storage Service - Supabase Integration with LocalStorage Fallback

import { DocumentMetadata, FileUploadProgress } from '../types';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class StorageService {
  private supabase: any = null;
  private isSupabaseAvailable = false;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('@supabase/supabase-js');
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isSupabaseAvailable = true;
        console.log('Supabase initialized successfully');
      } else {
        console.warn('Supabase credentials not found, using localStorage fallback');
      }
    } catch (error) {
      console.warn('Failed to initialize Supabase, using localStorage fallback:', error);
    }
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    if (this.isSupabaseAvailable && this.supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { data, error } = await this.supabase.storage
          .from('documents')
          .upload(filePath, file, {
            onUploadProgress: (progress: any) => {
              if (onProgress) {
                onProgress((progress.loaded / progress.total) * 100);
              }
            }
          });

        if (error) throw error;

        const { data: urlData } = this.supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
    }

    // Fallback to localStorage with base64 encoding
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64Data = reader.result as string;
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          localStorage.setItem(`onlyoffice_file_${fileId}`, JSON.stringify({
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
            uploadedAt: new Date().toISOString()
          }));
          
          if (onProgress) onProgress(100);
          resolve(`local://${fileId}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFileUrl(fileId: string): Promise<string> {
    if (fileId.startsWith('local://')) {
      const localId = fileId.replace('local://', '');
      const fileData = localStorage.getItem(`onlyoffice_file_${localId}`);
      if (fileData) {
        const parsed = JSON.parse(fileData);
        return parsed.data;
      }
      throw new Error('File not found in local storage');
    }

    // For Supabase URLs, return as-is
    return fileId;
  }

  async saveDocument(document: DocumentMetadata): Promise<void> {
    if (this.isSupabaseAvailable && this.supabase) {
      try {
        const { error } = await this.supabase
          .from('documents')
          .upsert({
            id: document.id,
            title: document.title,
            type: document.type,
            file_type: document.fileType,
            size: document.size,
            url: document.url,
            thumbnail_url: document.thumbnailUrl,
            owner_id: document.ownerId,
            owner_name: document.ownerName,
            created_at: document.createdAt,
            updated_at: document.updatedAt,
            last_modified_by: document.lastModifiedBy,
            permissions: document.permissions,
            collaborators: document.collaborators,
            is_public: document.isPublic,
            share_link: document.shareLink,
            version: document.version,
            tags: document.tags,
            folder: document.folder
          });

        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase save error:', error);
        throw error;
      }
    }

    // Fallback to localStorage
    localStorage.setItem(`onlyoffice_doc_${document.id}`, JSON.stringify(document));
  }

  async getDocument(documentId: string): Promise<DocumentMetadata | null> {
    if (this.isSupabaseAvailable && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        return {
          id: data.id,
          title: data.title,
          type: data.type,
          fileType: data.file_type,
          size: data.size,
          url: data.url,
          thumbnailUrl: data.thumbnail_url,
          ownerId: data.owner_id,
          ownerName: data.owner_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          lastModifiedBy: data.last_modified_by,
          permissions: data.permissions,
          collaborators: data.collaborators || [],
          isPublic: data.is_public,
          shareLink: data.share_link,
          version: data.version,
          tags: data.tags || [],
          folder: data.folder
        };
      } catch (error) {
        console.error('Supabase get document error:', error);
        return null;
      }
    }

    // Fallback to localStorage
    const docData = localStorage.getItem(`onlyoffice_doc_${documentId}`);
    return docData ? JSON.parse(docData) : null;
  }

  async getUserDocuments(userId: string): Promise<DocumentMetadata[]> {
    if (this.isSupabaseAvailable && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('documents')
          .select('*')
          .or(`owner_id.eq.${userId},collaborators.cs.[{"id":"${userId}"}]`)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        return data.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          fileType: doc.file_type,
          size: doc.size,
          url: doc.url,
          thumbnailUrl: doc.thumbnail_url,
          ownerId: doc.owner_id,
          ownerName: doc.owner_name,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
          lastModifiedBy: doc.last_modified_by,
          permissions: doc.permissions,
          collaborators: doc.collaborators || [],
          isPublic: doc.is_public,
          shareLink: doc.share_link,
          version: doc.version,
          tags: doc.tags || [],
          folder: doc.folder
        }));
      } catch (error) {
        console.error('Supabase get user documents error:', error);
        return [];
      }
    }

    // Fallback to localStorage
    const documents: DocumentMetadata[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('onlyoffice_doc_')) {
        try {
          const doc = JSON.parse(localStorage.getItem(key) || '{}');
          if (doc.ownerId === userId || doc.collaborators?.some((c: any) => c.id === userId)) {
            documents.push(doc);
          }
        } catch (error) {
          console.error('Error parsing document from localStorage:', error);
        }
      }
    }

    return documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (this.isSupabaseAvailable && this.supabase) {
      try {
        const { error } = await this.supabase
          .from('documents')
          .delete()
          .eq('id', documentId);

        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
    }

    // Fallback to localStorage
    localStorage.removeItem(`onlyoffice_doc_${documentId}`);
  }

  async shareDocument(documentId: string, permissions: any): Promise<string> {
    const shareLink = `${window.location.origin}/share/${documentId}`;
    
    if (this.isSupabaseAvailable && this.supabase) {
      try {
        const { error } = await this.supabase
          .from('documents')
          .update({
            is_public: true,
            share_link: shareLink,
            permissions: permissions
          })
          .eq('id', documentId);

        if (error) throw error;
      } catch (error) {
        console.error('Supabase share error:', error);
      }
    }

    return shareLink;
  }

  // Real-time subscriptions for collaboration
  subscribeToDocument(documentId: string, callback: (payload: any) => void): () => void {
    if (this.isSupabaseAvailable && this.supabase) {
      const subscription = this.supabase
        .channel(`document:${documentId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`
        }, callback)
        .subscribe();

      return () => {
        this.supabase.removeChannel(subscription);
      };
    }

    // Mock subscription for localStorage fallback
    return () => {};
  }
}

export const storageService = new StorageService();