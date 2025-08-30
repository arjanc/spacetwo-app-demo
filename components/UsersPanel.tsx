"use client";

import { useState } from "react";
import { X, MoreVertical, Headphones, UserPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  role?: string;
}

interface UsersPanelProps {
  collectionName: string;
  isOpen: boolean;
  onClose: () => void;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Martin Berry",
    avatar: "https://picsum.photos/seed/martin/100/100",
    isOnline: true,
    role: "Designer",
  },
  {
    id: 2,
    name: "Kate Winburn",
    avatar: "https://picsum.photos/seed/kate/100/100",
    isOnline: true,
    role: "Developer",
  },
  {
    id: 3,
    name: "John Doe",
    avatar: "https://picsum.photos/seed/john/100/100",
    isOnline: true,
    role: "Product Manager",
  },
  {
    id: 4,
    name: "Charlie Rail",
    avatar: "https://picsum.photos/seed/charlie/100/100",
    isOnline: true,
    role: "Designer",
  },
  {
    id: 5,
    name: "Shawn DGK",
    avatar: "https://picsum.photos/seed/shawn/100/100",
    isOnline: true,
    role: "Developer",
  },
  {
    id: 6,
    name: "Sam Blomqvist",
    avatar: "https://picsum.photos/seed/sam/100/100",
    isOnline: true,
    role: "Designer",
  },
  {
    id: 7,
    name: "Monica Cervantes",
    avatar: "https://picsum.photos/seed/monica/100/100",
    isOnline: true,
    role: "UX Researcher",
  },
];

export default function UsersPanel({
  collectionName,
  isOpen,
  onClose,
}: UsersPanelProps) {
  const [users] = useState(mockUsers);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full h-full bg-[#111111] border-l border-[#333333] flex flex-col"
    >
      {/* Users Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333333]">
        <span className="text-[#827989] text-sm font-medium">
          {users.length} members
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#827989] hover:text-white"
          >
            <Headphones className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#827989] hover:text-white"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#827989] hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#827989] hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Project Section Header */}
      <div className="px-4 py-3 border-b border-[#333333]">
        <h3 className="text-[#827989] text-sm font-medium">
          # {collectionName}
        </h3>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#26c940] rounded-full border-2 border-[#111111]"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[#ffb563]">
                    {user.name}
                  </span>
                  {user.role && (
                    <span className="text-xs text-[#827989]">{user.role}</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#827989] hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#333333]">
        <Button className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Members
        </Button>
      </div>
    </motion.div>
  );
}
