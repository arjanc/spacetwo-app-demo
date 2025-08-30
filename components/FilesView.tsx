'use client';

import { ChevronDown, Grid3X3, List, Check, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import FileCard from './FileCard';
import FileListItem from './FileListItem';
import type { CollectionFile } from '@/lib/data-service';

interface FilesViewProps {
  files: CollectionFile[];
  collectionName: string;
  projectName: string;
  onFileClick: (fileId: string) => void;
  onAddFile?: () => void;
}

type SortOption = 'Most Recent' | 'File Type' | 'Orientation';

const sortOptions: SortOption[] = ['Most Recent', 'File Type', 'Orientation'];

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

const dragOverlayVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

export default function FilesView({ files, collectionName, projectName, onFileClick, onAddFile }: FilesViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('Most Recent');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dragContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to check if a file is valid for upload
  const isValidFile = useCallback((file: File): boolean => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    // Only allow video formats that Supabase storage supports
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    return [...validImageTypes, ...validVideoTypes].includes(file.type);
  }, []);

  // Sort files based on selected option
  const sortedFiles = [...files].sort((a, b) => {
    switch (sortBy) {
      case 'Most Recent':
        return a.id.localeCompare(b.id); // Sort by UUID string
      case 'File Type':
        return a.type.localeCompare(b.type);
      case 'Orientation':
        return a.orientation.localeCompare(b.orientation);
      default:
        return 0;
    }
  });

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsDropdownOpen(false);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set drag over to false if we're leaving the container entirely
    if (!dragContainerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        console.error('No valid files found for upload');
        // Show user-friendly error message
        alert(
          'No valid files found. Please upload supported formats:\n\nImages: JPEG, PNG, GIF, WebP, SVG\nVideos: MP4, WebM, OGG',
        );
        return;
      }

      if (invalidFiles.length > 0) {
        console.warn(`${invalidFiles.length} files were skipped (not supported)`);
        alert(
          `${invalidFiles.length} file(s) were skipped because they are not supported.\n\nSupported formats:\nImages: JPEG, PNG, GIF, WebP, SVG\nVideos: MP4, WebM, OGG`,
        );
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          setUploadProgress((i / validFiles.length) * 100);

          // Call the upload API
          await uploadFile(file, projectName, collectionName);
        }

        setUploadProgress(100);

        // Add a small delay to ensure the upload is complete and database is updated
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Optionally refresh the files list or add the new files
        if (onAddFile) {
          onAddFile();
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        // You might want to show a toast notification here
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [projectName, collectionName, onAddFile],
  );

  // Helper function to generate video thumbnail (placeholder for now)
  const generateVideoThumbnail = async (fileId: string, accessToken: string) => {
    try {
      console.log('FilesView: Skipping thumbnail generation for now');
      // TODO: Implement proper video thumbnail generation
      // For now, we'll just use the video URL as the preview
      return { success: true };
    } catch (error) {
      console.error('FilesView: Error generating thumbnail:', error);
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

      console.log('FilesView: Upload URL received:', uploadUrl);
      console.log('FilesView: File ID received:', fileId);

      // Upload the file directly to Supabase storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': mappedFileType,
        },
      });

      console.log('FilesView: Upload response status:', uploadResponse.status);
      console.log('FilesView: Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('FilesView: Upload failed with response:', errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('File uploaded successfully:', fileId);

      // Generate thumbnail for video files
      if (file.type.startsWith('video/')) {
        try {
          console.log('FilesView: Generating thumbnail for video file');
          await generateVideoThumbnail(fileId, session.access_token);
        } catch (thumbnailError) {
          console.warn('FilesView: Failed to generate thumbnail:', thumbnailError);
          // Continue without thumbnail - not critical
        }
      }

      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
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
            key={sortedFiles.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {sortedFiles.length} {sortedFiles.length === 1 ? 'file' : 'files'}
          </motion.span>

          {onAddFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddFile}
              className="text-[#827989] hover:text-white hover:bg-[#333333] p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2"
            >
              <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Add File</span>
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

      <div
        ref={dragContainerRef}
        className="flex-1 overflow-y-auto relative"
        id="drag-container"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              variants={dragOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-[#5865f2]/20 border-2 border-dashed border-[#5865f2] rounded-lg z-50 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-[#5865f2] mx-auto mb-4" />
                <p className="text-[#5865f2] text-lg font-medium">Drop files here to upload</p>
                <p className="text-[#827989] text-sm mt-1">Files will be added to this collection</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              variants={dragOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-[#111111]/90 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#333333] border-t-[#5865f2] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg font-medium mb-2">Uploading files...</p>
                <div className="w-64 bg-[#333333] rounded-full h-2 mb-2">
                  <div
                    className="bg-[#5865f2] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-[#827989] text-sm">{Math.round(uploadProgress)}% complete</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key={`grid-${collectionName}-${sortBy}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {sortedFiles.length > 0 ? (
                  sortedFiles.map((file, index) => (
                    <FileCard key={file.id} file={file} index={index} onClick={() => onFileClick(file.id)} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Upload className="w-12 h-12 text-[#827989] mx-auto mb-4" />
                    <p className="text-[#827989] text-lg mb-2">No files in this collection yet</p>
                    <p className="text-[#827989] text-sm">
                      Drag and drop files here or click "Add File" to get started
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${collectionName}-${sortBy}`}
                className="space-y-3 sm:space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {sortedFiles.length > 0 ? (
                  sortedFiles.map((file, index) => (
                    <FileListItem
                      key={file.id}
                      file={file}
                      index={index}
                      projectName={projectName}
                      collectionName={collectionName}
                      onClick={() => onFileClick(file.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Upload className="w-12 h-12 text-[#827989] mx-auto mb-4" />
                    <p className="text-[#827989] text-lg mb-2">No files in this collection yet</p>
                    <p className="text-[#827989] text-sm">
                      Drag and drop files here or click "Add File" to get started
                    </p>
                  </div>
                )}
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
