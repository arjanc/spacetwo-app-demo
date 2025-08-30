import { supabase } from './supabase/client';

export interface Project {
  id: string;
  type: 'icon' | 'text';
  icon?: string;
  label?: string;
  bg: string;
  color: string;
  name: string;
  projectCount: number;
}

export interface ProjectCreateData {
  name: string;
  type: 'icon' | 'text';
  icon?: string;
  label?: string;
  bg: string;
  color: string;
}

export async function fetchUserProjects(): Promise<Project[]> {
  try {
    // Get the user's session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.warn('No valid session found, returning empty projects');
      return [];
    }

    const response = await fetch('/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching projects:', errorData);
      throw new Error(errorData.error || 'Failed to fetch projects');
    }

    const projects = await response.json();

    // Map database projects to the UI format
    return projects.map((project: any) => ({
      id: project.id.toString(),
      type: project.type as 'icon' | 'text',
      icon: project.icon,
      label: project.label,
      bg: project.bg,
      color: project.color,
      name: project.name,
      projectCount: 0, // TODO: Calculate actual collection count when collections are implemented
    }));
  } catch (error) {
    console.error('Error in fetchUserProjects:', error);
    throw error;
  }
}

export async function createProject(projectData: ProjectCreateData): Promise<Project> {
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
      throw new Error('Please log in to create a project');
    }

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }

    const result = await response.json();

    // Map the created project to the UI format
    return {
      id: result.data.id.toString(),
      type: result.data.type as 'icon' | 'text',
      icon: result.data.icon,
      label: result.data.label,
      bg: result.data.bg,
      color: result.data.color,
      name: result.data.name,
      projectCount: 0,
    };
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
}
