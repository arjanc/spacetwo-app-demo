'use client';

import { ChevronDown, Grid3X3, List, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CollectionCard from './CollectionCard';
import CollectionListItem from './CollectionListItem';

interface CollectionFile {
  id: number;
  image: string;
  type: string;
  orientation: string;
}

interface CollectionCardData {
  id: number;
  title: string;
  fileCount: number;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  likes: number;
  comments: number;
  isLive: boolean;
  files: CollectionFile[];
}

interface CollectionViewProps {
  selectedCollection: string | null;
  projectName: string;
  currentCollections: CollectionCardData[];
  onCollectionUpdate?: (collectionId: number, newFiles: CollectionFile[]) => void;
  onAddCollection?: () => void;
}

type SortOption = 'Last modified' | 'Most Liked' | 'Most Commented';

const sortOptions: SortOption[] = ['Last modified', 'Most Liked', 'Most Commented'];

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

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Helper function to convert time strings to timestamps for sorting
const getTimestampFromString = (timeString: string): number => {
  const now = Date.now();

  if (timeString.includes('mins ago')) {
    const minutes = Number.parseInt(timeString.match(/(\d+)/)?.[0] || '0');
    return now - minutes * 60 * 1000;
  } else if (timeString.includes('hour')) {
    const hours = Number.parseInt(timeString.match(/(\d+)/)?.[0] || '0');
    return now - hours * 60 * 60 * 1000;
  } else if (timeString.includes('day')) {
    const days = Number.parseInt(timeString.match(/(\d+)/)?.[0] || '0');
    return now - days * 24 * 60 * 60 * 1000;
  }

  return now;
};

export default function CollectionView({
  selectedCollection,
  projectName,
  currentCollections,
  onCollectionUpdate,
  onAddCollection,
}: CollectionViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('Last modified');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Enhance collections with mock data for sorting
  const enhancedCollections: CollectionCardData[] = currentCollections.map((collection) => ({
    ...collection,
    lastUpdatedTimestamp: getTimestampFromString(collection.lastUpdated),
    likes: Math.floor(Math.random() * 150) + 20,
    comments: Math.floor(Math.random() * 40) + 5,
  }));

  // Sort collections based on selected option
  const sortedCollections = [...enhancedCollections].sort((a, b) => {
    switch (sortBy) {
      case 'Last modified':
        return b.lastUpdatedTimestamp - a.lastUpdatedTimestamp;
      case 'Most Liked':
        return b.likes - a.likes;
      case 'Most Commented':
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsDropdownOpen(false);
  };

  const handleCollectionUpdate = (collectionId: number, newFiles: CollectionFile[]) => {
    if (onCollectionUpdate) {
      onCollectionUpdate(collectionId, newFiles);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#333333] bg-[#111111] flex-shrink-0">
        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            className="text-[#827989] hover:text-white hover:bg-transparent flex items-center gap-2 text-sm sm:text-base p-2 sm:p-3"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="truncate max-w-[120px] sm:max-w-none">{sortBy}</span>
            <ChevronDown
              className={`w-3 sm:w-4 h-3 sm:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </Button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-2 w-44 sm:w-48 bg-[#222222] border border-[#333333] rounded-lg shadow-lg z-10"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-[#827989] hover:text-white hover:bg-[#333333] transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between text-sm sm:text-base"
                    onClick={() => handleSortChange(option)}
                  >
                    <span>{option}</span>
                    {sortBy === option && <Check className="w-3 sm:w-4 h-3 sm:h-4 text-[#eefe05]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <motion.span
            className="text-xs text-[#827989] hidden sm:inline"
            key={sortedCollections.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {sortedCollections.length} {sortedCollections.length === 1 ? 'collection' : 'collections'}
          </motion.span>

          {onAddCollection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddCollection}
              className="text-[#827989] hover:text-white hover:bg-[#333333] p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2"
            >
              <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Add Collection</span>
            </Button>
          )}

          <div className="w-px h-4 bg-[#333333] mx-1"></div>

          <Button
            variant="ghost"
            size="sm"
            className={`p-1.5 sm:p-2 ${
              viewMode === 'grid' ? 'text-white bg-[#333333]' : 'text-[#827989] hover:text-white'
            }`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-3 sm:w-4 h-3 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1.5 sm:p-2 ${
              viewMode === 'list' ? 'text-white bg-[#333333]' : 'text-[#827989] hover:text-white'
            }`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-3 sm:w-4 h-3 sm:h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        {/* Content */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key={`grid-${selectedCollection}-${sortBy}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {sortedCollections.map((collection, index) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    index={index}
                    collectionName={selectedCollection || ''}
                    projectName={projectName}
                    onFilesUploaded={handleCollectionUpdate}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${selectedCollection}-${sortBy}`}
                className="space-y-3 sm:space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {sortedCollections.map((collection, index) => (
                  <CollectionListItem
                    key={collection.id}
                    collection={collection}
                    index={index}
                    collectionName={selectedCollection || ''}
                    projectName={projectName}
                    onFilesUploaded={handleCollectionUpdate}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Click outside to close dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />}
    </div>
  );
}
