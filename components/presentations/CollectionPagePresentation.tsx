'use client';

import Header from '../Header';
import CollectionView from '../CollectionView';
import ChatPanel from '../ChatPanel';
import UsersPanel from '../UsersPanel';
import AddNewPanel from '../AddNewPanel';
import AddCollectionModal from '../AddCollectionModal';
import type { Project } from '../../lib/data-service';
import type { Collection } from '../../lib/collections-api';
import { useMemo, useState } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';

interface CollectionPagePresentationProps {
  collectionName: string;
  sidebarProjects: Project[];
  currentCollections: Collection[];
  onSidebarClick: (project: Project) => void;
  onAddProject?: (project: Project) => void;
  onBackToCommunity: () => void;
  onCollectionUpdate?: (collectionId: string, newFiles: any[]) => void;
  onAddCollection: (collectionData: { title: string; description?: string; is_live?: boolean }) => void;
  isChatOpen: boolean;
  isUsersOpen: boolean;
  isAddOpen: boolean;
  onChatToggle: () => void;
  onUsersToggle: () => void;
  onAddToggle: () => void;
}

export default function CollectionPagePresentation({
  collectionName,
  sidebarProjects,
  currentCollections,
  onSidebarClick,
  onAddProject,
  onBackToCommunity,
  onCollectionUpdate,
  onAddCollection,
  isChatOpen,
  isUsersOpen,
  isAddOpen,
  onChatToggle,
  onUsersToggle,
  onAddToggle,
}: CollectionPagePresentationProps) {
  const isPanelOpen = isChatOpen || isUsersOpen || isAddOpen;
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);

  // Transform collections to match CollectionView's expected type
  const enhancedCollections = useMemo(() => {
    return currentCollections.map((collection) => ({
      ...collection,
      id: parseInt(collection.id), // Convert string ID to number for compatibility
      lastUpdatedTimestamp: Date.now(), // You might want to parse this from collection.lastUpdated
      likes: Math.floor(Math.random() * 150) + 20, // Mock data
      comments: Math.floor(Math.random() * 40) + 5, // Mock data
      files: collection.files.map((file) => ({
        ...file,
        id: parseInt(file.id.toString()), // Ensure file ID is number
      })),
    }));
  }, [currentCollections]);

  // Wrapper function to convert collection ID back to string for the handler
  const handleCollectionUpdate = (collectionId: number, newFiles: any[]) => {
    if (onCollectionUpdate) {
      onCollectionUpdate(collectionId.toString(), newFiles);
    }
  };

  // Handle opening the add collection modal
  const handleOpenAddCollectionModal = () => {
    setIsAddCollectionModalOpen(true);
  };

  // Handle closing the add collection modal
  const handleCloseAddCollectionModal = () => {
    setIsAddCollectionModalOpen(false);
  };

  // Handle adding a new collection
  const handleAddCollectionSubmit = async (collectionData: {
    title: string;
    description?: string;
    is_live?: boolean;
  }) => {
    console.log('handleAddCollectionSubmit called with:', collectionData);
    console.log('onAddCollection function details:', {
      exists: !!onAddCollection,
      type: typeof onAddCollection,
      isFunction: typeof onAddCollection === 'function',
      value: onAddCollection,
    });

    if (typeof onAddCollection !== 'function') {
      console.error('onAddCollection is not a function! Type:', typeof onAddCollection, 'Value:', onAddCollection);
      alert('Error: onAddCollection is not a function. Please refresh the page and try again.');
      return;
    }

    console.log('Calling onAddCollection from presentation');

    try {
      await onAddCollection(collectionData);
      console.log('onAddCollection completed in presentation');
    } catch (error) {
      console.error('Error calling onAddCollection:', error);
      throw error;
    }
  };

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
          {/* Main Content Area */}
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${isPanelOpen ? 'w-2/3' : 'w-full'}`}
          >
            <CollectionView
              selectedCollection={collectionName}
              projectName={collectionName}
              currentCollections={enhancedCollections}
              onCollectionUpdate={handleCollectionUpdate}
              onAddCollection={typeof onAddCollection === 'function' ? handleOpenAddCollectionModal : undefined}
            />
          </div>

          {/* Chat Panel */}
          {isChatOpen && (
            <div className="w-1/3 flex-shrink-0">
              <ChatPanel collectionName={collectionName} isOpen={isChatOpen} onClose={() => onChatToggle()} />
            </div>
          )}

          {/* Users Panel */}
          {isUsersOpen && (
            <div className="w-1/3 flex-shrink-0">
              <UsersPanel collectionName={collectionName} isOpen={isUsersOpen} onClose={() => onUsersToggle()} />
            </div>
          )}

          {/* Add New Panel */}
          {isAddOpen && (
            <div className="w-1/3 flex-shrink-0">
              <AddNewPanel
                collectionName={collectionName}
                isOpen={isAddOpen}
                onClose={() => onAddToggle()}
                availableCollections={enhancedCollections}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Collection Modal */}
      <AddCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={handleCloseAddCollectionModal}
        onAddCollection={handleAddCollectionSubmit}
        projectName={collectionName}
      />
    </div>
  );
}
