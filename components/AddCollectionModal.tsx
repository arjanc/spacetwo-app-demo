'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCollection: (collectionData: { title: string; description?: string; is_live?: boolean }) => void;
  projectName: string;
}

export default function AddCollectionModal({ isOpen, onClose, onAddCollection, projectName }: AddCollectionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onAddCollection({
        title: title.trim(),
        description: description.trim() || undefined,
        is_live: isLive,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setIsLive(false);
      onClose();
    } catch (error) {
      console.error('Error adding collection:', error);
      setError(error instanceof Error ? error.message : 'Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setDescription('');
      setIsLive(false);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-[#222222] border border-[#333333] rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Add New Collection</h2>
                <p className="text-sm text-[#827989] mt-1">Create a new collection in {projectName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
                className="text-[#827989] hover:text-white p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Collection Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter collection title"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-[#827989] focus:outline-none focus:ring-2 focus:ring-[#5865f2] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter collection description"
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-lg text-white placeholder-[#827989] focus:outline-none focus:ring-2 focus:ring-[#5865f2] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  maxLength={500}
                />
              </div>

              {/* Live Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isLive"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-[#333333] bg-[#111111] text-[#5865f2] focus:ring-[#5865f2] focus:ring-2 disabled:opacity-50"
                />
                <label htmlFor="isLive" className="text-sm text-white">
                  Make this collection live
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 text-[#827989] hover:text-white border border-[#333333] hover:border-[#444444]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim()}
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isLoading ? 'Creating...' : 'Create Collection'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
