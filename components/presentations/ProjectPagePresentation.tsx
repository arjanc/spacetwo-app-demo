"use client";

import Header from "../Header";
import CollectionView from "../CollectionView";
import ChatPanel from "../ChatPanel";
import UsersPanel from "../UsersPanel";
import AddNewPanel from "../AddNewPanel";
import type { Collection, Project } from "../../lib/data-service";
import { useMemo } from "react";
import ProjectSidebar from "@/components/ProjectSidebar";

interface ProjectPagePresentationProps {
  collectionName: string;
  sidebarProjects: Project[];
  currentCollections: Collection[];
  onSidebarClick: (project: Project) => void;
  onAddProject?: (project: Project) => void;
  onBackToCommunity: () => void;
  onCollectionUpdate?: (collectionId: number, newFiles: any[]) => void;
  isChatOpen: boolean;
  isUsersOpen: boolean;
  isAddOpen: boolean;
  onChatToggle: () => void;
  onUsersToggle: () => void;
  onAddToggle: () => void;
}

export default function ProjectPagePresentation({
  collectionName,
  sidebarProjects,
  currentCollections,
  onSidebarClick,
  onAddProject,
  onBackToCommunity,
  onCollectionUpdate,
  isChatOpen,
  isUsersOpen,
  isAddOpen,
  onChatToggle,
  onUsersToggle,
  onAddToggle,
}: ProjectPagePresentationProps) {
  const isPanelOpen = isChatOpen || isUsersOpen || isAddOpen;

  // Transform collections to match CollectionView's expected type
  const enhancedCollections = useMemo(() => {
    return currentCollections.map((collection) => ({
      ...collection,
      lastUpdatedTimestamp: Date.now(),
      likes: Math.floor(Math.random() * 150) + 20,
      comments: Math.floor(Math.random() * 40) + 5,
    }));
  }, [currentCollections]);


  enhancedCollections.sort((a, b) => b.id - a.id);

  return (
    <div className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden">
      <Header
        currentView="collection"
        selectedProject={collectionName}
        onBackToCommunity={onBackToCommunity}
        onChatToggle={onChatToggle}
        onUsersToggle={onUsersToggle}
        onAddToggle={onAddToggle}
        isChatOpen={isChatOpen}
        isUsersOpen={isUsersOpen}
        isAddOpen={isAddOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          projects={sidebarProjects}
          selectedProject={collectionName}
          onProjectClick={onSidebarClick}
          onAddProject={onAddProject}
        />

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isPanelOpen ? "w-2/3" : "w-full"
            }`}
          >
            <CollectionView
              selectedCollection={collectionName}
              projectName={collectionName}
              currentCollections={enhancedCollections}
              onCollectionUpdate={onCollectionUpdate}
            />
          </div>

          {isChatOpen && (
            <div className="w-1/3 flex-shrink-0">
              <ChatPanel
                collectionName={collectionName}
                isOpen={isChatOpen}
                onClose={() => onChatToggle()}
              />
            </div>
          )}

          {isUsersOpen && (
            <div className="w-1/3 flex-shrink-0">
              <UsersPanel
                collectionName={collectionName}
                isOpen={isUsersOpen}
                onClose={() => onUsersToggle()}
              />
            </div>
          )}

          {isAddOpen && (
            <div className="w-1/3 flex-shrink-0">
              <AddNewPanel
                collectionName={collectionName}
                isOpen={isAddOpen}
                onClose={() => onAddToggle()}
                availableCollections={currentCollections}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
