'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FileImage, Video, Palette, Play, FileText } from 'lucide-react';
import type { CollectionFile } from '@/lib/data-service';

interface FileListItemProps {
  file: CollectionFile;
  index: number;
  projectName: string;
  collectionName: string;
  onClick: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
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

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'image':
      return <FileImage className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'design':
      return <Palette className="w-4 h-4" />;
    case 'document':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileImage className="w-4 h-4" />;
  }
};

const getFileTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'image':
      return 'text-blue-400';
    case 'video':
      return 'text-red-400';
    case 'design':
      return 'text-purple-400';
    case 'document':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

export default function FileListItem({ file, index, projectName, collectionName, onClick }: FileListItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] hover:border-[#5865f2] transition-all duration-300">
        {/* File Thumbnail */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={file.image}
            alt={`File ${file.id}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* File Type Icon */}
          <div className="absolute bottom-1 left-1">
            <div
              className={`w-6 h-6 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center ${getFileTypeColor(
                file.type,
              )}`}
            >
              {getFileIcon(file.type)}
            </div>
          </div>

          {/* Video Play Button */}
          {file.type.toLowerCase() === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 group-hover:bg-black/70 transition-colors">
                <Play className="w-4 h-4 text-white fill-current" />
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm mb-1">File {file.id}</h3>
              <div className="flex items-center gap-2 text-xs text-[#827989]">
                <span className="capitalize">{file.type}</span>
                <span>•</span>
                <span className="capitalize">{file.orientation}</span>
              </div>
            </div>

            {/* File ID */}
            <div className="text-[#827989] text-xs font-mono">#{file.id}</div>
          </div>
        </div>

        {/* Hover Indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-[#5865f2] rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}
