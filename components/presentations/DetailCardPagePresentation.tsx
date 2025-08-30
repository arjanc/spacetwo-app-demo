"use client";

import Header from "../Header";
import DetailCardView from "../DetailCardView";
import type { Collection, Project } from "../../lib/data-service";
import ProjectSidebar from "@/components/ProjectSidebar";

interface DetailCardPagePresentationProps {
  collectionData: Collection;
  sidebarProjects: Project[];
  projectName: string;
  onSidebarClick: (project: Project) => void;
  onBackToCollection: () => void;
  onBackToCommunity: () => void;
  onAddProject?: (project: Project) => void;
  isChatOpen: boolean;
  isUsersOpen: boolean;
  isAddOpen: boolean;
  onChatToggle: () => void;
  onUsersToggle: () => void;
  onAddToggle: () => void;
}

export default function DetailCardPagePresentation({
  collectionData,
  sidebarProjects,
  projectName,
  onSidebarClick,
  onBackToCollection,
  onBackToCommunity,
  onAddProject,
  isChatOpen,
  isUsersOpen,
  isAddOpen,
  onChatToggle,
  onUsersToggle,
  onAddToggle,
}: DetailCardPagePresentationProps) {
  return (
    <div className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden">
      <Header
        currentView="collection"
        selectedProject={collectionData.title}
        onBackToCommunity={onBackToCommunity}
      />

      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          projects={sidebarProjects}
          selectedProject={collectionData.title}
          onProjectClick={onSidebarClick}
          onAddProject={onAddProject}
        />

        <div className="flex-1 overflow-hidden">
          <DetailCardView
            collectionName={collectionData.title}
            cardId={collectionData.id.toString()}
            projectName={projectName}
            collectionData={{
              id: collectionData.id.toString(),
              title: collectionData.title,
              description: `${collectionData.fileCount} files • Last updated ${collectionData.lastUpdated}`,
              image: collectionData.files[0]?.image || "",
              files: collectionData.files.map((f) => ({
                id: f.id.toString(),
                image: f.image,
              })),
            }}
          />
        </div>
      </div>
    </div>
  );
}
