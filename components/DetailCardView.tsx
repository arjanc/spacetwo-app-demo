'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Grid3X3, List, ImageIcon, Play, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import PresentationMode from './PresentationMode';
import FileListItem from './FileListItem';
import { useRouter } from 'next/navigation';
import { toSlug, createUserFileUrl } from '../lib/url-utils';
import { useAuth } from '../contexts/AuthContext';
import { uploadFiles, revokeObjectURLs, type UploadedFile } from '@/lib/file-service';
import { CustomToast, CustomToastContainer } from './ui/toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
      duration: 0.4,
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 },
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

interface DetailFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'design';
  preview: string;
  lastEdited: string;
  lastModifiedTimestamp: number;
  likes: number;
  comments: number;
  collaborators: {
    id: number;
    avatar: string;
    name: string;
  }[];
  additionalCollaborators?: number;
}

interface ProjectCardData {
  id: string;
  title: string;
  description: string;
  image: string;
  files: { id: string; image: string }[];
}

interface DetailCardViewProps {
  collectionName: string;
  cardId: string;
  projectName: string;
  collectionData: {
    id: string;
    title: string;
    description: string;
    image: string;
    files: { id: string; image: string }[];
  };
}

type SortOption = 'Last modified' | 'Most Liked' | 'Most Commented';

const sortOptions: SortOption[] = ['Last modified', 'Most Liked', 'Most Commented'];

export default function DetailCardView({ collectionName, cardId, projectName, collectionData }: DetailCardViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Last modified');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<CustomToast[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<DetailFile[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { profile } = useAuth();

  const addToast = useCallback((toast: Omit<CustomToast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Function to create a new DetailFile from an UploadedFile
  const createDetailFile = useCallback((uploadedFile: UploadedFile): DetailFile => {
    const now = Date.now();
    return {
      id: uploadedFile.id.toString(),
      name: `File ${uploadedFile.id}`,
      type: uploadedFile.type as 'image' | 'video' | 'design',
      preview: uploadedFile.image,
      lastEdited: 'Edited just now',
      lastModifiedTimestamp: now,
      likes: 0,
      comments: 0,
      collaborators: [
        {
          id: 1,
          avatar: `https://picsum.photos/seed/user${uploadedFile.id}1/100/100`,
          name: 'You',
        },
      ],
      additionalCollaborators: 0,
    };
  }, []);

  // Function to handle file upload and storage
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      try {
        const result = await uploadFiles(files);

        if (result.success) {
          const newDetailFiles = result.files.map(createDetailFile);
          setUploadedFiles((prev) => [...prev, ...newDetailFiles]);

          addToast({
            type: 'success',
            title: 'Files uploaded successfully',
            description: `${result.files.length} file${result.files.length === 1 ? '' : 's'} uploaded`,
          });
        }

        if (result.errors.length > 0) {
          result.errors.forEach((error) => {
            addToast({
              type: 'error',
              title: `Failed to upload ${error.fileName}`,
              description: error.error,
            });
          });
        }

        setTimeout(() => {
          revokeObjectURLs(result.files);
        }, 5000);
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An error occurred',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [addToast, createDetailFile],
  );

  // Function to remove a file
  const handleRemoveFile = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      addToast({
        type: 'success',
        title: 'File removed',
        description: 'The file has been removed from your uploads',
      });
    },
    [addToast],
  );

  // Generate files with mock data for sorting - keep original file IDs
  // Use useMemo or keep this stable to prevent re-sorting during navigation
  const baseFiles: DetailFile[] =
    collectionData.files.map((file, index) => {
      // Use file.id as seed for consistent random values
      const seed = Number.parseInt(file.id) || index;
      const randomMinutes = (seed * 37) % 1440; // Deterministic "random" based on file ID
      const randomLikes = ((seed * 73) % 200) + 10;
      const randomComments = ((seed * 41) % 50) + 1;

      return {
        id: file.id,
        name: `File ${file.id}`,
        type: (index % 3 === 0 ? 'image' : index % 3 === 1 ? 'video' : 'design') as 'image' | 'video' | 'design',
        preview: file.image,
        lastEdited: `Edited ${Math.floor(randomMinutes / 60) || 1} ${randomMinutes >= 60 ? 'hours' : 'minutes'} ago`,
        lastModifiedTimestamp: Date.now() - randomMinutes * 60 * 1000,
        likes: randomLikes,
        comments: randomComments,
        collaborators: [
          {
            id: 1,
            avatar: `https://picsum.photos/seed/user${file.id}1/100/100`,
            name: 'User 1',
          },
          {
            id: 2,
            avatar: `https://picsum.photos/seed/user${file.id}2/100/100`,
            name: 'User 2',
          },
        ],
        additionalCollaborators: seed % 4,
      };
    }) || [];

  // Combine base files with uploaded files
  const allFiles = [...(baseFiles || []), ...uploadedFiles];

  // Sort all files based on selected option
  const sortedFiles = [...allFiles].sort((a, b) => {
    switch (sortBy) {
      case 'Last modified':
        return b.lastModifiedTimestamp - a.lastModifiedTimestamp;
      case 'Most Liked':
        return b.likes - a.likes;
      case 'Most Commented':
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 sm:w-5 h-4 sm:h-5" />;
      case 'design':
        return (
          <div className="w-4 sm:w-5 h-4 sm:h-5 bg-[#5865f2] rounded flex items-center justify-center text-xs text-white">
            F
          </div>
        );
      default:
        return <ImageIcon className="w-4 sm:w-5 h-4 sm:h-5" />;
    }
  };

  const handleFileClick = (fileId: string) => {
    if (profile?.username) {
      router.push(createUserFileUrl(profile.username, projectName, collectionName, fileId));
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsDropdownOpen(false);
  };

  // Convert files for presentation mode
  const presentationFiles = collectionData.files || [];

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!e.dataTransfer?.files.length) return;
      const files = Array.from(e.dataTransfer.files);
      await handleFileUpload(files);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleFileUpload]);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col h-full"
      ref={dropZoneRef}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#333333] bg-[#111111] flex-shrink-0">
        <h1 className="text-lg sm:text-2xl font-semibold text-white truncate pr-4">
          {collectionData?.title || 'Collection Details'}
        </h1>
        <button
          className="p-0 border-0 bg-transparent hover:opacity-80 transition-opacity flex-shrink-0"
          onClick={() => setIsPresentationOpen(true)}
        >
          <Image
            src="/icons/display_mode.svg"
            alt="Display mode"
            width={110}
            height={26}
            className="w-20 sm:w-auto h-5 sm:h-6"
          />
        </button>
      </div>

      {/* Controls */}
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
            key={sortedFiles.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {sortedFiles.length} {sortedFiles.length === 1 ? 'file' : 'files'}
          </motion.span>
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

      {/* Files Content */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Drag & Drop Overlay */}
        <AnimatePresence>
          {(isDragging || isUploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="border-2 border-dashed border-[#444444] rounded-xl p-12 bg-[#1a1a1a]/50">
                <div className="text-center">
                  <Upload className={`w-16 h-16 text-[#827989] mx-auto mb-6 ${isUploading ? 'animate-bounce' : ''}`} />
                  <p className="text-white text-xl font-medium mb-2">
                    {isUploading ? 'Uploading files...' : 'Drop files here'}
                  </p>
                  <p className="text-[#827989] text-sm">Supported formats: PNG, JPG, GIF, SVG</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-6">
          <motion.div
            key={`${viewMode}-view-${sortBy}`}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6'
                : 'space-y-3 sm:space-y-4'
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {sortedFiles.map((file, index) =>
              viewMode === 'grid' ? (
                <motion.div
                  key={file.id}
                  className="group cursor-pointer relative"
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  custom={index}
                  onClick={() => handleFileClick(file.id)}
                >
                  {/* Add remove button for uploaded files */}
                  {uploadedFiles.some((f) => f.id === file.id) && (
                    <button
                      className="absolute top-2 right-2 z-50 bg-black/70 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveFile(file.id);
                      }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <div
                    className={`bg-[#1a1a1a] rounded-xl overflow-hidden transition-all duration-300 hover:bg-[#222222] border border-[#333333] hover:border-[#444444] max-w-sm`}
                  >
                    {/* Main Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={file.preview || '/placeholder.svg'}
                        alt={file.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* File Type Icon - Bottom Left */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                        <div className="w-7 sm:w-8 h-7 sm:h-8 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
                          {getFileIcon(file.type)}
                        </div>
                      </div>

                      {/* Stats Badge - Top Right */}
                      {sortBy !== 'Last modified' && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium">
                            {sortBy === 'Most Liked' ? `${file.likes} ♥` : `${file.comments} 💬`}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        {/* File Info */}
                        <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                          <h3 className="text-white font-semibold text-sm sm:text-base truncate mb-1">{file.name}</h3>
                          <p className="text-[#827989] text-xs sm:text-sm">{file.lastEdited}</p>
                        </div>

                        {/* Collaborators */}
                        <div className="flex-shrink-0">
                          <div className="flex items-center -space-x-1.5 sm:-space-x-2">
                            {file.collaborators.slice(0, 3).map((collaborator, idx) => (
                              <motion.div
                                key={collaborator.id}
                                className="relative"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + idx * 0.05 }}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                              >
                                <Image
                                  src={collaborator.avatar || '/placeholder.svg'}
                                  alt={collaborator.name}
                                  width={24}
                                  height={24}
                                  className="w-6 sm:w-7 h-6 sm:h-7 rounded-full object-cover border-2 border-[#1a1a1a] hover:border-[#333333] transition-colors"
                                />
                              </motion.div>
                            ))}
                            {file.additionalCollaborators && file.additionalCollaborators > 0 && (
                              <motion.div
                                className="w-6 sm:w-7 h-6 sm:h-7 bg-[#333333] rounded-full flex items-center justify-center text-xs text-[#827989] font-medium border-2 border-[#1a1a1a]"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.25 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                +{file.additionalCollaborators}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <FileListItem
                  key={file.id}
                  file={file}
                  projectName={projectName}
                  collectionName={collectionName}
                  onRemove={uploadedFiles.some((f) => f.id === file.id) ? handleRemoveFile : undefined}
                />
              ),
            )}
          </motion.div>
        </div>
      </div>

      {/* Presentation Mode */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        files={presentationFiles}
        projectTitle={collectionData?.title || 'Collection'}
      />

      {/* Click outside to close dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />}

      <CustomToastContainer toasts={toasts} onClose={removeToast} />
    </motion.div>
  );
}
