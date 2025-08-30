'use client';

import { Heart, MessageCircle, Upload } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toSlug, createUserCollectionUrl } from '../lib/url-utils';
import { useAuth } from '../contexts/AuthContext';
import { uploadFiles, revokeObjectURLs, type UploadedFile, convertBlobUrlToDataUrl } from '@/lib/file-service';

import { CustomToast, CustomToastContainer } from './ui/toast';

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

interface CollectionListItemProps {
  collection: CollectionCardData;
  index: number;
  collectionName: string;
  projectName: string;
  onFilesUploaded?: (collectionId: number, newFiles: CollectionFile[]) => void;
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
  hover: {
    x: 5,
    transition: { duration: 0.2 },
  },
  dragOver: {
    x: 8,
    scale: 1.02,
    transition: { duration: 0.15 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

export default function CollectionListItem({
  collection,
  index,
  collectionName,
  projectName,
  onFilesUploaded,
}: CollectionListItemProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<CustomToast[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemClick = useCallback(() => {
    if (!isUploading && profile?.username) {
      router.push(createUserCollectionUrl(profile.username, projectName, collection.title));
    }
  }, [router, projectName, collection.title, isUploading, profile?.username]);

  const addToast = useCallback((toast: Omit<CustomToast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const setDragState = useCallback((dragging: boolean) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (dragging !== dragStateRef.current) {
      dragStateRef.current = dragging;
      setIsDragging(dragging);
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes('Files')) {
      dropZoneRef.current?.classList.add('drag-over');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      dropZoneRef.current?.classList.remove('drag-over');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dropZoneRef.current?.classList.remove('drag-over');

      if (!e.dataTransfer.files.length) return;

      const files = Array.from(e.dataTransfer.files);

      setIsUploading(true);
      try {
        const result = await uploadFiles(files);

        if (result.success) {
          // Convert uploaded files to CollectionFile format
          const newFiles: CollectionFile[] = result.files.map((file, index) => ({
            id: Date.now() + index, // Generate unique ID
            image: file.image,
            type: file.type || 'image',
            orientation: 'landscape', // Default orientation
          }));

          // Call the callback to update the collection
          if (onFilesUploaded) {
            onFilesUploaded(collection.id, newFiles);
          }

          addToast({
            type: 'success',
            title: 'Files uploaded successfully',
            description: `${result.files.length} file${result.files.length === 1 ? '' : 's'} added to ${
              collection.title
            }`,
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
    [collection.id, collection.title, onFilesUploaded, addToast],
  );

  return (
    <>
      <motion.div
        key={`${collectionName}-${collection.id}`}
        variants={listItemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover="hover"
        custom={index}
      >
        <div
          ref={dropZoneRef}
          className="group relative cursor-pointer bg-[#1a1a1a] rounded-lg p-4 border border-[#333333] hover:border-[#444444] transition-all duration-200"
          onClick={handleItemClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200">
                <Image
                  src={collection.files[0]?.image || '/placeholder.svg'}
                  alt={collection.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />

                {/* Drag & Drop Overlay */}
                <div className="absolute inset-0 bg-[#1a1a1a]/95 backdrop-blur-sm flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200 drag-overlay">
                  <div className="border-2 border-dashed border-[#eefe05] rounded-lg p-2 bg-[#1a1a1a]/80">
                    <div className="text-center">
                      <Upload
                        className={`w-6 h-6 text-[#eefe05] mx-auto mb-1 ${isUploading ? 'animate-bounce' : ''}`}
                      />
                      <p className="text-white text-xs font-medium">{isUploading ? 'Uploading...' : 'Drop files !!'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium truncate">{collection.title}</h3>
                <div className="flex items-center gap-2">
                  {collection.isLive && (
                    <div className="px-2 py-1 bg-[#26c940]/20 border border-[#26c940]/30 rounded text-xs text-[#26c940]">
                      Live
                    </div>
                  )}
                  <div className="text-xs text-[#827989]">{collection.fileCount} files</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#827989] text-sm">Updated {collection.lastUpdated}</p>
                <div className="flex items-center gap-4 text-xs text-[#827989]">
                  <div className="flex items-center gap-1">
                    <span>{collection.likes}</span>
                    <Heart className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{collection.comments}</span>
                    <MessageCircle className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <CustomToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
