"use client";

import type React from "react";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: number;
  user: {
    name: string;
    avatar: string;
    color: string;
    icon?: string;
  };
  message: string;
  timestamp: string;
  emoji?: string;
  reply?: {
    user: string;
    message: string;
  };
}

interface ChatPanelProps {
  collectionName: string;
  isOpen: boolean;
  onClose: () => void;
}

const mockMessages: ChatMessage[] = [
  {
    id: 1,
    user: {
      name: "Martin B",
      avatar: "https://picsum.photos/seed/martin/100/100",
      color: "#ffb563",
      icon: "💬",
    },
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint non proident",
    timestamp: "Feb 03 - 7:22 PM",
    emoji: "😂",
  },
  {
    id: 2,
    user: {
      name: "Kate W.",
      avatar: "https://picsum.photos/seed/kate/100/100",
      color: "#ffb563",
      icon: "🎨",
    },
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cupidatat non proident",
    timestamp: "Feb 02 - 7:22 PM",
    emoji: "😂",
  },
  {
    id: 3,
    user: {
      name: "John Doe",
      avatar: "https://picsum.photos/seed/john/100/100",
      color: "#ffb563",
      icon: "💼",
    },
    message:
      "Labore et dolore magna aliqua. Ut enim ad minim veniam, laboris nisi ut aliquip ex ea commodo consequat.",
    timestamp: "Feb 02 - 9:46 AM",
    emoji: "🙌",
    reply: {
      user: "Sam B",
      message: "Excepteur sint pro aliqu...",
    },
  },
  {
    id: 4,
    user: {
      name: "Charlie Rail",
      avatar: "https://picsum.photos/seed/charlie/100/100",
      color: "#ffb563",
      icon: "⚡",
    },
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    timestamp: "Feb 01 - 3:45 PM",
  },
];

export default function ChatPanel({
  collectionName,
  isOpen,
  onClose,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: messages.length + 1,
        user: {
          name: "You",
          avatar: "https://picsum.photos/seed/you/100/100",
          color: "#ffb563",
        },
        message: newMessage,
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333333]">
        <h3 className="text-[#827989] text-sm font-medium">
          # {collectionName}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[#827989] hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3"
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={message.user.avatar || "/placeholder.svg"}
                  alt={message.user.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {message.user.icon && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#333333] rounded-full flex items-center justify-center text-xs">
                    {message.user.icon}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-medium"
                    style={{ color: message.user.color }}
                  >
                    {message.user.name}
                  </span>
                  <span className="text-xs text-[#827989]">
                    {message.timestamp}
                  </span>
                </div>

                {message.reply && (
                  <div className="bg-[#333333] rounded-lg p-3 mb-2 border-l-2 border-[#666666]">
                    <div className="flex items-center gap-2 mb-1">
                      <Image
                        src="https://picsum.photos/seed/sam/100/100"
                        alt="Sam B"
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full"
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: message.user.color }}
                      >
                        {message.reply.user}
                      </span>
                    </div>
                    <p className="text-sm text-[#999999]">
                      {message.reply.message}
                    </p>
                  </div>
                )}

                <p className="text-sm text-[#cccccc] leading-relaxed">
                  {message.message}
                  {message.emoji && (
                    <span className="ml-2 text-base">{message.emoji}</span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[#333333]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${collectionName
              .toLowerCase()
              .replace(/\s+/g, "")}`}
            className="flex-1 bg-[#222222] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#827989] focus:outline-none focus:border-[#666666]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
