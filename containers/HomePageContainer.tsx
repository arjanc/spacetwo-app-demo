'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomePagePresentation from '../components/presentations/HomePagePresentation';
import { dataService, type CommunityCard } from '../lib/data-service';
import { fetchUserProjects, createProject, type Project } from '../lib/projects-api';
import { toSlug, createUserProjectUrl } from '../lib/url-utils';
import { useAuth } from '../contexts/AuthContext';

export default function HomePageContainer() {
  const [activeFilter, setActiveFilter] = useState('Trending');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [navigationItems, setNavigationItems] = useState<string[]>([]);
  const [sidebarProjects, setSidebarProjects] = useState<Project[]>([]);
  const [filteredCards, setFilteredCards] = useState<CommunityCard[]>([]);

  const router = useRouter();
  const { profile } = useAuth();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [navItems, projects] = await Promise.all([dataService.getNavigationItems(), fetchUserProjects()]);

        setNavigationItems(navItems);
        setSidebarProjects(projects);

        // Fetch initial filtered cards
        const cards = await dataService.getFilteredCards(activeFilter);
        setFilteredCards(cards);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update filtered cards when filter changes
  useEffect(() => {
    const updateFilteredCards = async () => {
      try {
        const cards = await dataService.getFilteredCards(activeFilter);
        setFilteredCards(cards);
      } catch (err) {
        console.error('Error filtering cards:', err);
      }
    };

    if (!loading) {
      updateFilteredCards();
    }
  }, [activeFilter, loading]);

  const handleProjectClick = (project: Project) => {
    console.log(profile);
    if (profile?.username) {
      console.log(profile.username, project.name);

      router.push(createUserProjectUrl(profile.username, project.name));
    }
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

  const handleBackToCommunity = () => {
    router.push('/');
  };

  const handleAddToggle = () => {
    setIsAddOpen(!isAddOpen);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
          suppressHydrationWarning
        ></div>
        <p className="text-[#827989]">Loading...</p>
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

  return (
    <HomePagePresentation
      navigationItems={navigationItems}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      filteredCards={filteredCards}
      sidebarProjects={sidebarProjects}
      onProjectClick={handleProjectClick}
      onAddProject={handleAddProject}
      onBackToCommunity={handleBackToCommunity}
      isAddOpen={isAddOpen}
      onAddToggle={handleAddToggle}
    />
  );
}
