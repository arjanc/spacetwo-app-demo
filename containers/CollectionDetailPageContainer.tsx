'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CollectionDetailPagePresentation from '../components/presentations/CollectionDetailPagePresentation';
import { fetchUserProjects, createProject, type Project } from '../lib/projects-api';
import { fetchProjectCollections, type Collection as APICollection } from '../lib/collections-api';
import { type Collection } from '../lib/data-service';
import { toSlug, createUserProjectUrl, createUserFileUrl } from '../lib/url-utils';

interface CollectionDetailPageContainerProps {
  username: string;
  projectName: string;
  collectionName: string;
}

export default function CollectionDetailPageContainer({
  username,
  projectName,
  collectionName,
}: CollectionDetailPageContainerProps) {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [sidebarProjects, setSidebarProjects] = useState<Project[]>([]);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log('CollectionDetailPageContainer: Starting fetch with:', { projectName, collectionName });

        // First get all projects to find the project with the matching name
        const projects = await fetchUserProjects();
        console.log('CollectionDetailPageContainer: Fetched projects:', projects);
        setSidebarProjects(projects);

        // Find the project with the matching name
        const project = projects.find((p) => p.name === projectName);
        console.log('CollectionDetailPageContainer: Looking for project with name:', projectName);
        console.log('CollectionDetailPageContainer: Found project:', project);

        if (!project) {
          console.error(
            'CollectionDetailPageContainer: Project not found. Available projects:',
            projects.map((p) => p.name),
          );
          setError(`Project not found: ${projectName}`);
          setLoading(false);
          return;
        }

        // Get collections for this project
        console.log('CollectionDetailPageContainer: Fetching collections for project ID:', project.id);
        const projectCollections = await fetchProjectCollections(project.id.toString());
        console.log('CollectionDetailPageContainer: Fetched collections:', projectCollections);

        // Find the collection with the matching name
        console.log('CollectionDetailPageContainer: Looking for collection with title:', collectionName);
        const targetAPICollection = projectCollections.find(
          (collection) => collection.title.toLowerCase() === collectionName.toLowerCase(),
        );
        console.log('CollectionDetailPageContainer: Found collection:', targetAPICollection);

        if (!targetAPICollection) {
          console.error(
            'CollectionDetailPageContainer: Collection not found. Available collections:',
            projectCollections.map((c) => c.title),
          );
          setError(
            `Collection not found: ${collectionName}. Available: ${projectCollections.map((c) => c.title).join(', ')}`,
          );
          setLoading(false);
          return;
        }

        // Transform API collection to the expected format
        const targetCollection: Collection = {
          id: targetAPICollection.id, // Keep as string (UUID)
          title: targetAPICollection.title,
          fileCount: targetAPICollection.fileCount,
          lastUpdated: targetAPICollection.lastUpdated,
          isLive: targetAPICollection.isLive,
          files: targetAPICollection.files.map((file) => ({
            id: file.id, // Keep as string (UUID)
            title: file.title,
            image: file.image,
            type: file.type,
            orientation: file.orientation,
          })),
        };

        setCurrentCollection(targetCollection);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [projectName, collectionName]);

  const handleSidebarClick = (project: Project) => {
    router.push(createUserProjectUrl(username, project.name));
  };

  const handleAddProject = async (newProject: Project) => {
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
    } catch (error) {
      console.error('Error creating project:', error);
      // Optionally show a toast or error message to the user
    }
  };

  const handleBackToProject = () => {
    router.push(createUserProjectUrl(username, projectName));
  };

  const handleBackToCommunity = () => {
    router.push('/');
  };

  const handleChatToggle = () => {
    if (isUsersOpen) setIsUsersOpen(false);
    if (isAddOpen) setIsAddOpen(false);
    setIsChatOpen(!isChatOpen);
  };

  const handleUsersToggle = () => {
    if (isChatOpen) setIsChatOpen(false);
    if (isAddOpen) setIsAddOpen(false);
    setIsUsersOpen(!isUsersOpen);
  };

  const handleAddToggle = () => {
    if (isChatOpen) setIsChatOpen(false);
    if (isUsersOpen) setIsUsersOpen(false);
    setIsAddOpen(!isAddOpen);
  };

  const handleFileClick = (fileId: string) => {
    router.push(createUserFileUrl(username, projectName, collectionName, fileId));
  };

  const handleAddFile = async () => {
    try {
      console.log('CollectionDetailPageContainer: Refreshing collection data after file upload');

      // Find the project with the matching name
      const project = sidebarProjects.find((p) => p.name === projectName);
      if (!project) {
        console.error('Project not found for refresh');
        return;
      }

      // Fetch updated collections for this project
      const projectCollections = await fetchProjectCollections(project.id.toString());

      // Find the updated collection
      const updatedAPICollection = projectCollections.find(
        (collection) => collection.title.toLowerCase() === collectionName.toLowerCase(),
      );
      if (!updatedAPICollection) {
        console.error('Updated collection not found');
        return;
      }

      // Transform and update the collection
      const updatedCollection: Collection = {
        id: updatedAPICollection.id,
        title: updatedAPICollection.title,
        fileCount: updatedAPICollection.fileCount,
        lastUpdated: updatedAPICollection.lastUpdated,
        isLive: updatedAPICollection.isLive,
        files: updatedAPICollection.files.map((file) => ({
          id: file.id,
          title: file.title || '',
          image: file.image,
          type: file.type,
          orientation: file.orientation,
        })),
      };

      setCurrentCollection(updatedCollection);
      console.log('CollectionDetailPageContainer: Collection data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing collection data:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#827989]">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !currentCollection) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || 'Collection not found'}</p>
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

  return (
    <CollectionDetailPagePresentation
      projectName={projectName}
      collectionName={collectionName}
      collection={currentCollection}
      sidebarProjects={sidebarProjects}
      onSidebarClick={handleSidebarClick}
      onAddProject={handleAddProject}
      onBackToProject={handleBackToProject}
      onBackToCommunity={handleBackToCommunity}
      onFileClick={handleFileClick}
      isChatOpen={isChatOpen}
      isUsersOpen={isUsersOpen}
      isAddOpen={isAddOpen}
      onChatToggle={handleChatToggle}
      onUsersToggle={handleUsersToggle}
      onAddToggle={handleAddToggle}
      onAddFile={handleAddFile}
    />
  );
}
