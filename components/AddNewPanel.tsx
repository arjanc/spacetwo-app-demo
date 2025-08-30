"use client";

import { useState } from "react";
import { X, ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface CollectionData {
  id: number;
  title: string;
  fileCount: number;
  lastUpdated: string;
  isLive: boolean;
  files: any[]; // Added files property
}

interface AddNewPanelProps {
  collectionName?: string;
  isOpen: boolean;
  onClose: () => void;
  availableCollections?: CollectionData[];
}

export default function AddNewPanel({
  collectionName,
  isOpen,
  onClose,
  availableCollections = [],
}: AddNewPanelProps) {
  const [embedUrl, setEmbedUrl] = useState(
    "https://adobe.premiere.com/Oe-tP6z..."
  );
  const [selectedUser, setSelectedUser] = useState("John Doe");
  const [selectedCollection, setSelectedCollection] =
    useState("Select collection");
  const [publishToCommunity, setPublishToCommunity] = useState(true);
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] =
    useState(false);

  const handleCollectionSelect = (collection: CollectionData) => {
    setSelectedCollection(collection.title);
    setIsCollectionDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full h-full bg-[#111111] border-l border-[#333333] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333333]">
        <h3 className="text-[#827989] text-sm font-medium">Add New</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#827989] text-sm">Embed link</span>
            <ChevronDown className="w-4 h-4 text-[#827989]" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#827989] hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* URL Input */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#eefe05] rounded-lg text-[#cccccc] bg-[#222222] focus:outline-none focus:border-[#eefe05] placeholder-[#827989]"
              placeholder="Enter URL to embed..."
            />
          </div>
          <p className="text-[#827989] text-sm">
            Works with Figma, Adobe, Notion and more
          </p>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-[#222222] aspect-video">
            <div className="w-full h-full bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
              <div className="relative">
                {/* Nike shoe silhouette */}
                <div className="w-32 h-20 relative">
                  <div className="absolute inset-0 bg-red-600 rounded-lg opacity-80"></div>
                  <div className="absolute top-2 left-2 w-28 h-16 border-2 border-white rounded-lg"></div>
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#333333] rounded flex items-center justify-center">
              <Play className="w-3 h-3 text-white" />
            </div>
            <span className="text-[#827989] text-sm">NK Jordan animation</span>
          </div>
        </div>

        {/* User Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 border border-[#333333] rounded-lg bg-[#222222]">
            <Image
              src="https://picsum.photos/seed/johndoe/100/100"
              alt="John Doe"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white font-medium">{selectedUser}</span>
          </div>
        </div>

        {/* Collection Selection */}
        <div className="space-y-2 relative">
          <div
            className="flex items-center justify-between p-3 border border-[#333333] rounded-lg bg-[#222222] cursor-pointer hover:bg-[#1a1a1a]"
            onClick={() =>
              availableCollections.length > 0 &&
              setIsCollectionDropdownOpen(!isCollectionDropdownOpen)
            }
          >
            <span
              className={
                availableCollections.length > 0
                  ? "text-white"
                  : "text-[#827989]"
              }
            >
              {availableCollections.length > 0
                ? selectedCollection
                : "No collections available"}
            </span>
            {availableCollections.length > 0 && (
              <ChevronDown
                className={`w-4 h-4 text-[#827989] transition-transform ${
                  isCollectionDropdownOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isCollectionDropdownOpen && availableCollections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-[#222222] border border-[#333333] rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {availableCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#333333] last:border-b-0"
                    onClick={() => handleCollectionSelect(collection)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                          {collection.title}
                        </h4>
                        <p className="text-[#827989] text-xs">
                          {collection.files.length} files • Updated{" "}
                          {collection.lastUpdated}
                        </p>
                      </div>
                      {collection.isLive && (
                        <div className="ml-2">
                          <div className="px-2 py-1 bg-[#666666] rounded-full text-xs text-white font-medium flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-[#26c940] rounded-full"></div>
                            LIVE
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Publish to Community Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-[#333333] rounded-lg bg-[#222222]">
            <span className="text-white font-medium">Publish to Community</span>
            <button
              onClick={() => setPublishToCommunity(!publishToCommunity)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                publishToCommunity ? "bg-[#eefe05]" : "bg-[#333333]"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  publishToCommunity ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="p-4 border-t border-[#333333]">
        <Button className="w-full bg-[#eefe05] hover:bg-[#d4e004] text-[#333333] font-semibold py-3 rounded-lg">
          Add New +
        </Button>
      </div>
    </motion.div>
  );
}
