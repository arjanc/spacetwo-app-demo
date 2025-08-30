'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileDetailView from '../components/FileDetailView';
import { fetchFileById } from '../lib/files-api';
import { fetchUserProjects, createProject, type Project } from '../lib/projects-api';

import { toSlug, createUserProjectUrl, createUserCollectionUrl } from '../lib/url-utils';
import type { FileDetail } from '../lib/data-service';

interface FileDetailPageContainerProps {
  username: string;
  projectName: string;
  collectionName: string;
  fileId: string;
}

export default function FileDetailPageContainer({
  username,
  projectName,
  collectionName,
  fileId,
}: FileDetailPageContainerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [fileData, setFileData] = useState<FileDetail | null>(null);
  const [sidebarProjects, setSidebarProjects] = useState<Project[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log('FileDetailPageContainer: Fetching data for file ID:', fileId);
        console.log('FileDetailPageContainer: File ID type:', typeof fileId);
        console.log('FileDetailPageContainer: File ID length:', fileId.length);

        // Fetch both file data and projects in parallel
        const [file, projects] = await Promise.all([fetchFileById(fileId), fetchUserProjects()]);

        console.log('FileDetailPageContainer: Fetched file:', file);
        console.log('FileDetailPageContainer: Fetched projects:', projects);

        setFileData(file);
        setSidebarProjects(projects);
        setLoading(false);
      } catch (err) {
        console.error('FileDetailPageContainer: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

  const handleBackToCollection = () => {
    // Navigate back to the collection page
    router.push(createUserCollectionUrl(username, projectName, collectionName));
  };

  const handleSidebarClick = (project: Project) => {
    // Navigate to the selected project
    router.push(createUserProjectUrl(username, project.name));
  };

  const handleAddProject = async (newProject: Project) => {
    console.log('FileDetailPageContainer: handleAddProject called with:', newProject);
    try {
      // Create the project in the database
      const createdProject = await createProject({
        name: newProject.name,
        type: newProject.type,
        icon: newProject.icon,
        label: newProject.label,
        bg: newProject.bg,
        color: newProject.color,
      });

      // Add the created project to the sidebar
      setSidebarProjects((prev) => [...prev, createdProject]);

      console.log('FileDetailPageContainer: Created new project:', createdProject);
    } catch (error) {
      console.error('FileDetailPageContainer: Error creating project:', error);
      // Optionally show a toast or error message to the user
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#827989]">Loading file details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#5865f2] rounded hover:bg-[#4752c4]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">File not found</p>
          <button onClick={handleBackToCollection} className="px-4 py-2 bg-[#5865f2] rounded hover:bg-[#4752c4]">
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <FileDetailView
      fileData={fileData}
      onBackToCollection={handleBackToCollection}
      projectName={projectName}
      collectionName={collectionName}
      sidebarProjects={sidebarProjects}
      onSidebarClick={handleSidebarClick}
      onAddProject={handleAddProject}
    />
  );
}
