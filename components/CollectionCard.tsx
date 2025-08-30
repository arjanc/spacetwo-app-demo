'use client';

import { Heart, MessageCircle, Upload, Video } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toSlug, createUserCollectionUrl } from '../lib/url-utils';
import { useAuth } from '../contexts/AuthContext';

import { CustomToast, CustomToastContainer } from './ui/toast';

interface CollectionFile {
  id: number;
  image: string;
  type: string;
  orientation: string;
  mime_type?: string;
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

interface CollectionCardProps {
  collection: CollectionCardData;
  index: number;
  collectionName: string;
  projectName: string;
  onFilesUploaded?: (collectionId: number, newFiles: CollectionFile[]) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
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
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
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
  dragOver: {
    scale: 1.05,
    y: -8,
    transition: { duration: 0.15 },
  },
};

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
    },
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

export default function CollectionCard({
  collection,
  index,
  collectionName,
  projectName,
  onFilesUploaded,
}: CollectionCardProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toasts, setToasts] = useState<CustomToast[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleCardClick = useCallback(() => {
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

  // Helper function to check if a file is valid for upload
  const isValidFile = useCallback((file: File): boolean => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    // Only allow video formats that Supabase storage supports
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    return [...validImageTypes, ...validVideoTypes].includes(file.type);
  }, []);

  // Helper function to generate video thumbnail (placeholder for now)
  const generateVideoThumbnail = async (fileId: string, accessToken: string) => {
    try {
      console.log('CollectionCard: Skipping thumbnail generation for now');
      // TODO: Implement proper video thumbnail generation
      // For now, we'll just use the video URL as the preview
      return { success: true };
    } catch (error) {
      console.error('CollectionCard: Error generating thumbnail:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, projectName: string, collectionName: string) => {
    try {
      // Get the user's session for authentication
      const { supabase } = await import('@/lib/supabase');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Map unsupported MIME types to supported ones
      let mappedFileType = file.type;
      if (file.type === 'video/quicktime' || file.type === 'video/x-msvideo') {
        mappedFileType = 'video/mp4';
      }

      // First, get a signed upload URL from the API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: mappedFileType,
          fileSize: file.size,
          projectName,
          collectionName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileId } = await response.json();

      console.log('CollectionCard: Upload URL received:', uploadUrl);
      console.log('CollectionCard: File ID received:', fileId);

      // Upload the file directly to Supabase storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': mappedFileType,
        },
      });

      console.log('CollectionCard: Upload response status:', uploadResponse.status);
      console.log('CollectionCard: Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('CollectionCard: Upload failed with response:', errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('File uploaded successfully:', fileId);

      // Generate thumbnail for video files
      if (file.type.startsWith('video/')) {
        try {
          console.log('CollectionCard: Generating thumbnail for video file');
          await generateVideoThumbnail(fileId, session.access_token);
        } catch (thumbnailError) {
          console.warn('CollectionCard: Failed to generate thumbnail:', thumbnailError);
          // Continue without thumbnail - not critical
        }
      }

      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
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
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) return;

      // Filter valid files
      const validFiles = droppedFiles.filter(isValidFile);
      const invalidFiles = droppedFiles.filter((file) => !isValidFile(file));

      if (validFiles.length === 0) {
        addToast({
          type: 'error',
          title: 'No valid files',
          description: 'Please upload supported formats:\nImages: JPEG, PNG, GIF, WebP, SVG\nVideos: MP4, WebM, OGG',
        });
        return;
      }

      if (invalidFiles.length > 0) {
        addToast({
          type: 'warning',
          title: 'Some files skipped',
          description: `${invalidFiles.length} file${
            invalidFiles.length === 1 ? '' : 's'
          } were skipped. Supported formats: Images (JPEG, PNG, GIF, WebP, SVG) and Videos (MP4, WebM, OGG)`,
        });
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          setUploadProgress((i / validFiles.length) * 100);

          // Call the upload API
          await uploadFile(file, projectName, collection.title);
        }

        setUploadProgress(100);

        // Add a small delay to ensure the upload is complete and database is updated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Call the callback to refresh the collection data
        if (onFilesUploaded) {
          // For now, we'll just call the callback without new files
          // The parent component should refresh the data from the API
          onFilesUploaded(collection.id, []);
        }

        addToast({
          type: 'success',
          title: 'Files uploaded successfully',
          description: `${validFiles.length} file${validFiles.length === 1 ? '' : 's'} added to ${collection.title}`,
        });
      } catch (error) {
        console.error('Error uploading files:', error);
        addToast({
          type: 'error',
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An error occurred',
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [collection.id, collection.title, projectName, onFilesUploaded, addToast],
  );

  return (
    <>
      <motion.div
        key={`${collectionName}-${collection.id}`}
        className="col-span-1"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        custom={index}
      >
        <div
          ref={dropZoneRef}
          className={`group relative cursor-pointer transition-all duration-200`}
          onClick={handleCardClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div
            className="relative overflow-hidden rounded-lg mb-3 transition-all duration-200"
            style={{
              background: 'linear-gradient(238.99deg, rgba(49, 88, 107, 0.3) -14.89%, rgba(141, 110, 42, 0.3) 124.21%)',
            }}
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-64">
              {collection.files.slice(-4).map((file, index) => (
                <div key={index} className="relative overflow-hidden">
                  {file.mime_type?.startsWith('video/') ? (
                    <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333333] flex items-center justify-center rounded-sm">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                          <Video className="w-4 h-4 text-white fill-current" />
                        </div>
                        <p className="text-white text-xs font-medium">Video</p>
                      </div>
                      {/* Video play button overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={file.image || '/placeholder.svg'}
                      alt={`${collection.title} - Image ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Drag & Drop Overlay */}
            <AnimatePresence>
              {isDragOver && (
                <motion.div
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 bg-[#1a1a1a]/95 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="border-2 border-dashed border-[#eefe05] rounded-xl p-16 bg-[#1a1a1a]/80">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-[#eefe05] mx-auto mb-4" />
                      <p className="text-white text-lg font-medium mb-2">Drop files here!</p>
                      <p className="text-[#827989] text-sm">Add files to {collection.title}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Progress Overlay */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 bg-[#1a1a1a]/95 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#333333] border-t-[#eefe05] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg font-medium mb-2">Uploading files...</p>
                    <div className="w-64 bg-[#333333] rounded-full h-2 mb-2">
                      <div
                        className="bg-[#eefe05] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-[#827989] text-sm">{Math.round(uploadProgress)}% complete</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-3 left-3" style={{ opacity: 1, transform: 'scale(1)' }}>
              <div className="w-8 h-8 bg-[#333333] rounded flex items-center justify-center text-xs">
                {collection.fileCount}
              </div>
            </div>
            <div className="absolute top-3 right-3" style={{ opacity: 1, transform: 'translateX(0)' }}>
              <div className="px-2 py-1 bg-black/50 rounded text-xs text-white">
                {collection.isLive ? 'Live' : 'Draft'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between" style={{ opacity: 1 }}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#827989]">{collection.title}</span>
            </div>
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
      </motion.div>
      <CustomToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
