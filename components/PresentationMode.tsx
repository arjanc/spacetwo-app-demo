"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

interface PresentationFile {
  id: string;
  image: string;
}

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  files: PresentationFile[];
  projectTitle: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

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
      duration: 0.4,
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

export default function PresentationMode({
  isOpen,
  onClose,
  files,
  projectTitle,
}: PresentationModeProps) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });

  // Transform for title parallax effect
  const titleY = useTransform(scrollY, [0, 1000], [0, -50]);
  const titleOpacity = useTransform(scrollY, [0, 200, 400], [1, 0.8, 0.6]);

  // Generate random sizes for masonry layout
  const getRandomSize = (index: number) => {
    const sizes = [
      { width: "w-64", height: "h-80", span: "col-span-1" }, // Small
      { width: "w-80", height: "h-96", span: "col-span-2" }, // Medium
      { width: "w-96", height: "h-64", span: "col-span-2" }, // Wide
      { width: "w-64", height: "h-96", span: "col-span-1" }, // Tall
      { width: "w-80", height: "h-80", span: "col-span-2" }, // Square large
    ];
    return sizes[index % sizes.length];
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || !isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    let currentScroll = 0;
    const scrollSpeed = 0.3; // Slower for better viewing

    const autoScroll = () => {
      if (container) {
        currentScroll += scrollSpeed;
        if (currentScroll >= scrollHeight) {
          currentScroll = 0; // Reset to top
        }
        container.scrollTop = currentScroll;
      }
    };

    const interval = setInterval(autoScroll, 16); // ~60fps
    return () => clearInterval(interval);
  }, [isAutoScrolling, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsAutoScrolling(!isAutoScrolling);
      }
      if (e.key === "ArrowUp" && containerRef.current) {
        containerRef.current.scrollBy({ top: -300, behavior: "smooth" });
      }
      if (e.key === "ArrowDown" && containerRef.current) {
        containerRef.current.scrollBy({ top: 300, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose, isAutoScrolling]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <motion.div
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Scroll to explore • {files.length} files
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className="text-white hover:bg-white/10"
            >
              {isAutoScrolling ? "Pause" : "Auto Scroll"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scroll Navigation */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              containerRef.current?.scrollBy({ top: -400, behavior: "smooth" })
            }
            className="text-white hover:bg-white/10"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              containerRef.current?.scrollBy({ top: 400, behavior: "smooth" })
            }
            className="text-white hover:bg-white/10"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Fixed Centered Title */}
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <h1
            className="text-white text-center uppercase px-8 py-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20"
            style={{
              fontFamily: "Roboto, sans-serif",
              fontWeight: 900,
              fontSize: "48px",
              lineHeight: "100%",
              letterSpacing: "-1%",
              textAlign: "center",
              textTransform: "uppercase",
              textShadow: "0 0 30px rgba(0,0,0,0.8)",
            }}
          >
            {projectTitle}
          </h1>
        </motion.div>

        {/* Scrollable Masonry Content */}
        <motion.div
          ref={containerRef}
          className="w-full h-full overflow-y-auto overflow-x-hidden py-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => setIsAutoScrolling(true)}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 px-4">
            {files.map((file, index) => {
              const randomHeight = [
                "h-64",
                "h-80",
                "h-96",
                "h-72",
                "h-88",
                "h-60",
                "h-84",
                "h-92",
              ][index % 8];

              return (
                <motion.div
                  key={file.id}
                  className={`break-inside-avoid mb-4 ${randomHeight} group cursor-pointer`}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <div
                    className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      background:
                        "linear-gradient(238.99deg, rgba(49, 88, 107, 0.3) -14.89%, rgba(141, 110, 42, 0.3) 124.21%)",
                    }}
                  >
                    <Image
                      src={file.image || "/placeholder.svg"}
                      alt={`Project file ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                    {/* File number indicator */}
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom spacer */}
          <div className="h-32" />
        </motion.div>

        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <motion.div
            className="flex flex-col items-center gap-2 text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="text-xs">Scroll to explore</div>
            <motion.div
              className="w-0.5 h-8 bg-white/40 rounded-full"
              animate={{ scaleY: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
