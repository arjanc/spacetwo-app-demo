"use client";

import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavigationProps {
  items: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  itemCount: number;
}

export default function NavigationMenu({
  items,
  activeFilter,
  onFilterChange,
  itemCount,
}: NavigationProps) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#333333] bg-[#111111] flex-shrink-0">
      {/* Navigation Items - Scrollable on mobile */}
      <nav className="flex-1 overflow-x-auto">
        <div className="flex items-center gap-4 sm:gap-8 min-w-max pb-1">
          {items.map((item, index) => (
            <motion.button
              key={item}
              onClick={() => onFilterChange(item)}
              className={`text-sm font-medium transition-colors whitespace-nowrap px-1 py-1 touch-manipulation ${
                activeFilter === item
                  ? "text-white"
                  : "text-[#827989] hover:text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="relative">
                {item}
                {activeFilter === item && (
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-white"
                    layoutId="activeTab"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </span>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Right side controls */}
      <div className="flex items-center gap-1 sm:gap-2 ml-4 flex-shrink-0">
        {/* Item count - hidden on mobile */}
        <motion.span
          className="text-xs text-[#827989] hidden sm:inline"
          key={itemCount}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </motion.span>

        {/* Grid view button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-[#827989] hover:text-white p-1.5 sm:p-2"
        >
          <Grid3X3 className="w-3 sm:w-4 h-3 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}
