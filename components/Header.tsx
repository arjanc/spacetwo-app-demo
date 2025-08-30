"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";

interface HeaderProps {
  currentView: "community" | "project" | "collection";
  selectedProject: string | null;
  onBackToCommunity: () => void;
  onChatToggle?: () => void;
  onUsersToggle?: () => void;
  onAddToggle?: () => void;
  isChatOpen?: boolean;
  isUsersOpen?: boolean;
  isAddOpen?: boolean;
}

export default function Header({
  currentView,
  selectedProject,
  onBackToCommunity,
  onChatToggle,
  onUsersToggle,
  onAddToggle,
  isChatOpen,
  isUsersOpen,
  isAddOpen,
}: HeaderProps) {
  return (
    <div className="bg-[#222222] border-b border-[#333333] flex-shrink-0">
      {/* Main header row */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#827989] hover:text-white p-1.5 sm:p-2"
              onClick={onBackToCommunity}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {/* Hide forward button on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-[#827989] hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-[#827989] ml-1 sm:ml-2 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
              {currentView === "community" ? (
                <>
                  <span className="sm:hidden">SpaceTwo</span>
                  <span className="hidden sm:inline">Spacetwo Community</span>
                </>
              ) : (
                selectedProject
              )}
            </span>
          </div>
        </div>

        {/* Search Bar - Always visible but responsive */}
        <div className="flex-1 max-w-[200px] sm:max-w-md mx-2 sm:mx-8">
          <SearchBar />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Add button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className={`p-1.5 sm:p-2 ${
              isAddOpen
                ? "text-white bg-[#333333]"
                : "text-[#827989] hover:text-white"
            }`}
            onClick={onAddToggle}
          >
            <Image
              src="/icons/add_box.svg"
              alt="Add"
              width={16}
              height={16}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </Button>

          {/* Project-specific buttons - hidden on mobile */}
          {currentView === "project" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={`hidden sm:flex ${
                  isChatOpen
                    ? "text-white bg-[#333333]"
                    : "text-[#827989] hover:text-white"
                }`}
                onClick={onChatToggle}
              >
                <Image
                  src="/icons/chat.svg"
                  alt="Chat"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`hidden sm:flex ${
                  isUsersOpen
                    ? "text-white bg-[#333333]"
                    : "text-[#827989] hover:text-white"
                }`}
                onClick={onUsersToggle}
              >
                <Image
                  src="/icons/users.svg"
                  alt="Users"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </Button>
            </>
          )}

          {/* More button - hidden on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex text-[#827989] hover:text-white"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {/* User Profile - always visible */}
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
