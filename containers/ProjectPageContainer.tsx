'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CollectionPagePresentation from '../components/presentations/CollectionPagePresentation';
import { fetchUserProjects, createProject, type Project } from '../lib/projects-api';
import { fetchProjectCollections, createCollection, type Collection } from '../lib/collections-api';
import { toSlug, createUserProjectUrl, createUserCollectionUrl } from '../lib/url-utils';

interface CollectionPageContainerProps {
  collectionName: string;
  username: string;
}

export default function CollectionPageContainer({ collectionName, username }: CollectionPageContainerProps) {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [sidebarProjects, setSidebarProjects] = useState<Project[]>([]);
  const [currentCollections, setCurrentCollections] = useState<Collection[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First fetch all user projects
        const projects = await fetchUserProjects();
        setSidebarProjects(projects);

        // Find the current project by name (collectionName is actually the project name)
        const project = projects.find((p) => p.name.toLowerCase() === collectionName.toLowerCase());

        if (!project) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        setCurrentProject(project);

        // Fetch collections for this project
        const collections = await fetchProjectCollections(project.id);
        setCurrentCollections(collections);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName]);

  const handleSidebarClick = (project: Project) => {
    router.push(createUserProjectUrl(username, project.name));
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

  const handleAddCollection = useCallback(
    async (collectionData: { title: string; description?: string; is_live?: boolean }) => {
      console.log('handleAddCollection called with:', collectionData);

      if (!currentProject) {
        console.error('No current project selected');
        alert('No project selected. Please refresh the page and try again.');
        return;
      }

      console.log('Current project:', currentProject);

      try {
        console.log('Creating collection with data:', {
          title: collectionData.title,
          description: collectionData.description,
          project_id: currentProject.id,
          is_live: collectionData.is_live || false,
        });

        // Create the collection in the database
        const createdCollection = await createCollection({
          title: collectionData.title,
          description: collectionData.description,
          project_id: currentProject.id,
          is_live: collectionData.is_live || false,
        });

        console.log('Collection created successfully:', createdCollection);

        // Add the created collection to the current collections
        setCurrentCollections((prev) => {
          const updated = [createdCollection, ...prev];
          console.log('Updated collections:', updated);
          return updated;
        });
      } catch (error) {
        console.error('Error creating collection:', error);
        alert(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [currentProject],
  );

  const handleCollectionUpdate = async (collectionId: string, newFiles: any[]) => {
    console.log('ProjectPageContainer: Refreshing collection data after file upload');

    if (!currentProject) {
      console.error('No current project for refresh');
      return;
    }

    try {
      // Fetch updated collections for this project from the API
      const updatedCollections = await fetchProjectCollections(currentProject.id);

      // Update the state with the fresh data from the API
      setCurrentCollections(updatedCollections);

      console.log('ProjectPageContainer: Collection data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing collection data:', error);
      // Fallback to local state update if API refresh fails
      setCurrentCollections((prevCollections) =>
        prevCollections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                files: [...collection.files, ...newFiles],
                fileCount: collection.files.length + newFiles.length,
                lastUpdated: 'Just now',
              }
            : collection,
        ),
      );
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

  // Debug the function before passing it
  console.log('ProjectPageContainer - handleAddCollection function:', {
    exists: !!handleAddCollection,
    type: typeof handleAddCollection,
    value: handleAddCollection,
    isFunction: typeof handleAddCollection === 'function',
  });

  return (
    <CollectionPagePresentation
      collectionName={collectionName}
      sidebarProjects={sidebarProjects}
      currentCollections={currentCollections}
      onSidebarClick={handleSidebarClick}
      onAddProject={handleAddProject}
      onBackToCommunity={handleBackToCommunity}
      onCollectionUpdate={handleCollectionUpdate}
      onAddCollection={handleAddCollection}
      isChatOpen={isChatOpen}
      isUsersOpen={isUsersOpen}
      isAddOpen={isAddOpen}
      onChatToggle={handleChatToggle}
      onUsersToggle={handleUsersToggle}
      onAddToggle={handleAddToggle}
    />
  );
}
