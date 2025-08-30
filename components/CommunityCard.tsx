"use client";

import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CommunityCardData {
  id: number;
  image: string;
  title: string;
  author: string;
  avatar: string;
  likes: number;
  comments: number;
  appIcon: string;
  category: string;
}

interface CommunityCardProps {
  card: CommunityCardData;
  className?: string;
  index: number;
  activeFilter: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
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
};

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
    },
  },
};

export default function CommunityCard({
  card,
  className = "col-span-1",
  index,
  activeFilter,
}: CommunityCardProps) {
  return (
    <motion.div
      key={`${activeFilter}-${card.id}`}
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      custom={index}
    >
      <div className="group">
        <div
          className="relative overflow-hidden rounded-lg mb-3 transition-all duration-300"
          style={{
            background:
              "linear-gradient(238.99deg, rgba(49, 88, 107, 0.3) -14.89%, rgba(141, 110, 42, 0.3) 124.21%)",
          }}
        >
          <motion.div variants={imageVariants} whileHover="hover">
            <Image
              src={card.image || "/placeholder.svg"}
              alt={card.title}
              width={400}
              height={300}
              className="w-full h-64 object-cover"
            />
          </motion.div>
          <motion.div
            className="absolute bottom-3 left-3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="w-8 h-8 bg-[#333333] rounded flex items-center justify-center text-xs">
              {card.appIcon}
            </div>
          </motion.div>
          <motion.div
            className="absolute top-3 right-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <div className="px-2 py-1 bg-black/50 rounded text-xs text-white">
              {card.category}
            </div>
          </motion.div>
        </div>
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src={card.avatar || "/placeholder.svg"}
                alt="User avatar"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            </motion.div>
            <span className="text-sm text-[#827989]">{card.title}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#827989]">
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span>{card.likes}</span>
              <Heart className="w-3 h-3" />
            </motion.div>
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span>{card.comments}</span>
              <MessageCircle className="w-3 h-3" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
