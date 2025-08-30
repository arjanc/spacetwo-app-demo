'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FileImage, Video, Palette, Play, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CollectionFile } from '@/lib/data-service';

interface FileCardProps {
  file: CollectionFile;
  index: number;
  onClick: () => void;
}

// Custom hook to detect image orientation
const useImageOrientation = (imageUrl: string) => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical' | 'square' | null>(null);

  useEffect(() => {
    if (!imageUrl || imageUrl === '/placeholder.svg') {
      setOrientation('horizontal'); // Default fallback
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const { width, height } = img;
      const ratio = width / height;

      if (ratio > 1.1) {
        setOrientation('horizontal');
      } else if (ratio < 0.9) {
        setOrientation('vertical');
      } else {
        setOrientation('square');
      }
    };

    img.onerror = () => {
      setOrientation('horizontal'); // Default fallback on error
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return orientation;
};

const cardVariants = {
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
      return 'bg-blue-500/20 text-blue-400';
    case 'video':
      return 'bg-red-500/20 text-red-400';
    case 'design':
      return 'bg-purple-500/20 text-purple-400';
    case 'document':
      return 'bg-green-500/20 text-green-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const getOrientationAspectRatio = (orientation: string) => {
  switch (orientation.toLowerCase()) {
    case 'portrait':
      return 'aspect-[3/4]';
    case 'landscape':
      return 'aspect-[4/3]';
    case 'square':
      return 'aspect-square';
    default:
      return 'aspect-[4/3]';
  }
};

export default function FileCard({ file, index, onClick }: FileCardProps) {
  const detectedOrientation = useImageOrientation(file.image);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#333333] hover:border-[#5865f2] transition-all duration-300 hover:shadow-lg hover:shadow-[#5865f2]/20">
        {/* File Preview */}
        <div className={`relative ${getOrientationAspectRatio(file.orientation)} overflow-hidden`}>
          {file.type.toLowerCase() === 'video' || file.mime_type?.startsWith('video/') ? (
            <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333333] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-white fill-current" />
                </div>
                <p className="text-white text-sm font-medium">Video</p>
                <p className="text-white/70 text-xs mt-1">{file.title || `Video ${file.id}`}</p>
              </div>
              {/* Video play button overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                  <Play className="w-6 h-6 text-white fill-current" />
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={file.image}
              alt={file.title || `File ${file.id}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}

          {/* Orientation Badge */}
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
              <span className="capitalize">{detectedOrientation || file.orientation}</span>
            </div>
          </div>

          {/* Orientation Badge */}
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
              {detectedOrientation || file.orientation}
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* File Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm mb-1">{file.title || `File ${file.id}`}</h3>
              <p className="text-[#827989] text-xs">
                {detectedOrientation ? `${detectedOrientation} image` : `${file.type} • ${file.orientation}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
