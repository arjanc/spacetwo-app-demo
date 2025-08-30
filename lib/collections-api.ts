import { supabase } from './supabase';

// Frontend Collection interface that matches the component expectations
export interface Collection {
  id: string;
  title: string;
  description?: string;
  fileCount: number;
  lastUpdated: string;
  isLive: boolean;
  files: CollectionFile[];
}

export interface CollectionFile {
  id: string;
  title?: string;
  image: string;
  type: string;
  orientation: string;
}

export interface CollectionCreateData {
  title: string;
  description?: string;
  project_id: string;
  is_live?: boolean;
}

// Fetch collections for a specific project
export async function fetchProjectCollections(projectId: string): Promise<Collection[]> {
  try {
    // Get the user's session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.warn('No valid session found, returning empty collections');
      return [];
    }

    const response = await fetch(`/api/collections?project_id=${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching collections:', errorData);
      throw new Error(errorData.error || 'Failed to fetch collections');
    }

    const collections = await response.json();

    // Transform to ensure consistent types
    return collections.map((collection: any) => ({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      fileCount: collection.fileCount || 0,
      lastUpdated: collection.lastUpdated,
      isLive: collection.isLive,
      files: collection.files || [],
    }));
  } catch (error) {
    console.error('Error in fetchProjectCollections:', error);
    throw error;
  }
}

// Fetch a single collection by ID
export async function fetchCollection(collectionId: string): Promise<Collection> {
  try {
    // Get the user's session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No valid session found');
    }

    const response = await fetch(`/api/collections?id=${collectionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching collection:', errorData);
      throw new Error(errorData.error || 'Failed to fetch collection');
    }

    const collection = await response.json();

    return {
      id: collection.id,
      title: collection.title,
      description: collection.description,
      fileCount: collection.files?.length || 0,
      lastUpdated: collection.updated_at,
      isLive: collection.is_live,
      files:
        collection.files?.map((file: any) => ({
          id: file.id,
          image: file.preview_url || file.thumbnail_url || file.file_path,
          type: getFileTypeFromOrientation(file.orientation),
          orientation: file.orientation,
        })) || [],
    };
  } catch (error) {
    console.error('Error in fetchCollection:', error);
    throw error;
  }
}

// Create a new collection
export async function createCollection(collectionData: CollectionCreateData): Promise<Collection> {
  try {
    // Get the user's session for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error. Please try logging in again.');
    }

    if (!session?.access_token) {
      console.error('No session or access token found:', { session });
      throw new Error('Please log in to create a collection');
    }

    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(collectionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create collection');
    }

    const result = await response.json();

    // Return the created collection
    return result.data;
  } catch (error) {
    console.error('Error in createCollection:', error);
    throw error;
  }
}

// Helper function to get file type from orientation
function getFileTypeFromOrientation(orientation: string): string {
  switch (orientation) {
    case 'portrait':
      return 'vertical';
    case 'landscape':
      return 'horizontal';
    case 'square':
      return 'square';
    default:
      return 'horizontal';
  }
}
