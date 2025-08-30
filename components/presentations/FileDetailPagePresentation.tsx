'use client';

import { Play, Heart, MessageCircle, Share, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '../Header';
import ChatPanel from '../ChatPanel';
import UsersPanel from '../UsersPanel';
import AddNewPanel from '../AddNewPanel';
import type { FileDetail, Project } from '../../lib/data-service';
import ProjectSidebar from '@/components/ProjectSidebar';

interface FileDetailPagePresentationProps {
  fileId: string;
  projectName?: string;
  fileData: FileDetail | null;
  sidebarProjects: Project[];
  onSidebarClick: (project: Project) => void;
  onAddProject?: (project: Project) => void;
  onBackToCommunity: () => void;
  isChatOpen: boolean;
  isUsersOpen: boolean;
  isAddOpen: boolean;
  isLiked: boolean;
  onChatToggle: () => void;
  onUsersToggle: () => void;
  onAddToggle: () => void;
  onLikeToggle: () => void;
}

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      duration: 0.6,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const tagVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 10,
    },
  },
};

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export default function FileDetailPagePresentation({
  fileId,
  projectName,
  fileData,
  sidebarProjects,
  onSidebarClick,
  onAddProject,
  onBackToCommunity,
  isChatOpen,
  isUsersOpen,
  isAddOpen,
  isLiked,
  onChatToggle,
  onUsersToggle,
  onAddToggle,
  onLikeToggle,
}: FileDetailPagePresentationProps) {
  const isPanelOpen = isChatOpen || isUsersOpen || isAddOpen;

  // Handle file not found
  if (!fileData) {
    return (
      <motion.div
        className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Header
          currentView="project"
          selectedProject="File Not Found"
          onBackToCommunity={onBackToCommunity}
          onChatToggle={() => {}}
          onUsersToggle={() => {}}
          onAddToggle={() => {}}
          isChatOpen={false}
          isUsersOpen={false}
          isAddOpen={false}
        />
        <div className="flex flex-1 overflow-hidden">
          <motion.div className="flex-1 flex items-center justify-center p-4" variants={contentVariants}>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">File Not Found</h1>
              <p className="text-[#827989] mb-6 text-sm sm:text-base">The file you're looking for doesn't exist.</p>
              <Button onClick={onBackToCommunity} className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                Go Back
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Header
        currentView="project"
        selectedProject={`${projectName || 'Community'} | ${fileData.title}`}
        onBackToCommunity={onBackToCommunity}
        onChatToggle={onChatToggle}
        onUsersToggle={onUsersToggle}
        onAddToggle={onAddToggle}
        isChatOpen={isChatOpen}
        isUsersOpen={isUsersOpen}
        isAddOpen={isAddOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Now visible on mobile */}
        <motion.div variants={sidebarVariants}>
          <ProjectSidebar
            projects={sidebarProjects}
            selectedProject={projectName || null}
            onProjectClick={onSidebarClick}
            onAddProject={onAddProject}
          />
        </motion.div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isPanelOpen ? 'w-full md:w-2/3' : 'w-full'
            }`}
          >
            <div className="flex-1 overflow-y-auto">
              <motion.div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" variants={contentVariants}>
                {/* File Header */}
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4"
                  variants={contentVariants}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
                    <motion.h1
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      {fileData.title}
                    </motion.h1>

                    <motion.div
                      className="flex items-center gap-3 sm:gap-4 text-[#827989]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {fileData.type === 'animation' && (
                        <Button variant="ghost" size="sm" className="text-[#827989] hover:text-white p-2">
                          <Play className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Play</span>
                        </Button>
                      )}
                      <span className="text-xs sm:text-sm">Shots</span>
                      <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full border border-[#333333]" />
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Image
                      src={fileData.author.avatar || '/placeholder.svg'}
                      alt={fileData.author.name}
                      width={32}
                      height={32}
                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover"
                    />
                    <Image
                      src="https://picsum.photos/seed/collab1/100/100"
                      alt="Collaborator"
                      width={32}
                      height={32}
                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover -ml-2 sm:-ml-3 border-2 border-[#111111]"
                    />
                  </motion.div>
                </motion.div>

                {/* Main Image/Video */}
                <motion.div
                  className={`relative rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 bg-[#111111] ${
                    fileData.orientation === 'portrait' 
                      ? 'aspect-[3/4] sm:aspect-[3/4] max-h-[80vh]' 
                      : 'aspect-[4/3] sm:aspect-video'
                  }`}
                  variants={imageVariants}
                >
                  <Image
                    src={fileData.image || '/placeholder.svg'}
                    alt={fileData.title}
                    fill
                    className="object-contain"
                  />
                  {fileData.type === 'animation' && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        size="lg"
                        className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                      >
                        <Play className="w-4 sm:w-6 h-4 sm:h-6 ml-0.5 sm:ml-1" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div className="mb-6 sm:mb-8" variants={contentVariants}>
                  <p className="text-[#cccccc] text-base sm:text-lg leading-relaxed max-w-4xl">
                    {fileData.description}
                  </p>
                </motion.div>

                {/* Tags */}
                <motion.div
                  className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {fileData.tags.map((tag, index) => (
                    <motion.button
                      key={tag}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-transparent border border-[#333333] rounded-full text-[#827989] hover:text-white hover:border-[#666666] transition-colors text-sm sm:text-base touch-manipulation"
                      variants={tagVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Actions */}
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-[#333333] gap-4 sm:gap-0"
                  variants={contentVariants}
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 p-2 touch-manipulation ${
                        isLiked ? 'text-red-500' : 'text-[#827989] hover:text-white'
                      }`}
                      onClick={onLikeToggle}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm sm:text-base">{fileData.stats.likes + (isLiked ? 1 : 0)}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#827989] hover:text-white flex items-center gap-2 p-2 touch-manipulation"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{fileData.stats.comments}</span>
                    </Button>
                    <span className="text-[#827989] text-xs sm:text-sm">{fileData.stats.views} views</span>
                  </div>

                  <div className="flex items-center gap-2 justify-start sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#827989] hover:text-white p-2 touch-manipulation"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#827989] hover:text-white p-2 touch-manipulation"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#827989] hover:text-white p-2 touch-manipulation"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Author Info */}
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 sm:mt-8 p-4 sm:p-6 bg-[#1a1a1a] rounded-xl"
                  variants={contentVariants}
                >
                  <Image
                    src={fileData.author.avatar || '/placeholder.svg'}
                    alt={fileData.author.name}
                    width={48}
                    height={48}
                    className="w-12 sm:w-15 h-12 sm:h-15 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base sm:text-lg truncate">{fileData.author.name}</h3>
                    <p className="text-[#827989] text-sm sm:text-base">{fileData.author.username}</p>
                    <p className="text-[#827989] text-xs sm:text-sm mt-1">Created {fileData.createdAt}</p>
                  </div>
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white self-start sm:self-auto touch-manipulation">
                    Follow
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Panels - Hidden on mobile */}
          {isChatOpen && (
            <div className="hidden md:block w-1/3 flex-shrink-0">
              <ChatPanel
                collectionName={projectName || 'Community'}
                isOpen={isChatOpen}
                onClose={() => onChatToggle()}
              />
            </div>
          )}

          {isUsersOpen && (
            <div className="hidden md:block w-1/3 flex-shrink-0">
              <UsersPanel
                collectionName={projectName || 'Community'}
                isOpen={isUsersOpen}
                onClose={() => onUsersToggle()}
              />
            </div>
          )}

          {isAddOpen && (
            <div className="hidden md:block w-1/3 flex-shrink-0">
              <AddNewPanel
                collectionName={projectName}
                isOpen={isAddOpen}
                onClose={() => onAddToggle()}
                availableCollections={[]}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
