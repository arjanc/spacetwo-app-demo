'use client';

import { motion } from 'framer-motion';
import Header from '../Header';
import ProjectSidebar from '../ProjectSidebar';
import ChatPanel from '../ChatPanel';
import UsersPanel from '../UsersPanel';
import AddNewPanel from '../AddNewPanel';
import FilesView from '../FilesView';
import type { Collection, Project } from '../../lib/data-service';

interface CollectionDetailPagePresentationProps {
  projectName: string;
  collectionName: string;
  collection: Collection;
  sidebarProjects: Project[];
  onSidebarClick: (project: Project) => void;
  onAddProject?: (project: Project) => void;
  onBackToProject: () => void;
  onBackToCommunity: () => void;
  onFileClick: (fileId: string) => void;
  onAddFile?: () => void;
  isChatOpen: boolean;
  isUsersOpen: boolean;
  isAddOpen: boolean;
  onChatToggle: () => void;
  onUsersToggle: () => void;
  onAddToggle: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export default function CollectionDetailPagePresentation({
  projectName,
  collectionName,
  collection,
  sidebarProjects,
  onSidebarClick,
  onAddProject,
  onBackToProject,
  onBackToCommunity,
  onFileClick,
  onAddFile,
  isChatOpen,
  isUsersOpen,
  isAddOpen,
  onChatToggle,
  onUsersToggle,
  onAddToggle,
}: CollectionDetailPagePresentationProps) {
  const isPanelOpen = isChatOpen || isUsersOpen || isAddOpen;

  return (
    <motion.div
      className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Header
        currentView="collection"
        selectedProject={`${projectName} | ${collectionName}`}
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
          selectedProject={projectName}
          onProjectClick={onSidebarClick}
          onAddProject={onAddProject}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${isPanelOpen ? 'w-2/3' : 'w-full'}`}
          >
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Collection Header */}
              <motion.div className="flex-shrink-0 p-4 sm:p-6 pb-0" variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{collectionName}</h1>
                    <p className="text-[#827989] text-sm sm:text-base">
                      {collection.fileCount} files • Last updated {collection.lastUpdated}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        collection.isLive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {collection.isLive ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Files View */}
              <div className="flex-1 overflow-hidden">
                <FilesView
                  files={collection.files}
                  collectionName={collectionName}
                  projectName={projectName}
                  onFileClick={onFileClick}
                  onAddFile={onAddFile}
                />
              </div>
            </div>
          </div>

          {/* Panels */}
          {isChatOpen && (
            <div className="w-1/3 flex-shrink-0">
              <ChatPanel collectionName={collectionName} isOpen={isChatOpen} onClose={onChatToggle} />
            </div>
          )}

          {isUsersOpen && (
            <div className="w-1/3 flex-shrink-0">
              <UsersPanel collectionName={collectionName} isOpen={isUsersOpen} onClose={onUsersToggle} />
            </div>
          )}

          {isAddOpen && (
            <div className="w-1/3 flex-shrink-0">
              <AddNewPanel
                collectionName={collectionName}
                isOpen={isAddOpen}
                onClose={onAddToggle}
                availableCollections={[collection]}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
