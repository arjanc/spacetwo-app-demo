import { supabase } from './supabase';
import type { FileDetail } from '@/lib/data-service';

// Function to fetch a single file by ID
export async function fetchFileById(fileId: string): Promise<FileDetail> {
  try {
    console.log('Files API Client: Fetching file with ID:', fileId);

    // Get the user's session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No valid session found');
    }

    console.log('Files API Client: Making request with auth token');

    const response = await fetch(`/api/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    console.log('Files API Client: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Files API Client: Error response:', errorData);
      throw new Error(errorData.error || `Failed to fetch file: ${response.status}`);
    }

    const file = await response.json();
    console.log('Files API Client: Successfully fetched file:', file);

    return file;
  } catch (error) {
    console.error('Files API Client: Error in fetchFileById:', error);
    throw error;
  }
}

// Function to check if user has access to a file
export async function checkFileAccess(fileId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Simple check - just verify the file exists and user owns it
    const { data: file } = await supabase
      .from('files')
      .select('id, owner_id')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .eq('deleted', false)
      .single();

    return !!file;
  } catch (error) {
    console.error('Error checking file access:', error);
    return false;
  }
}
