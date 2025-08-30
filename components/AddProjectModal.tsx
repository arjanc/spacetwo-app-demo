'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Palette, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: {
    id: string;
    name: string;
    type: 'icon' | 'text';
    icon?: string;
    label?: string;
    bg: string;
    color: string;
  }) => void;
}

const colorOptions = [
  { bg: '#FF6B6B', color: '#ffffff' },
  { bg: '#4ECDC4', color: '#ffffff' },
  { bg: '#45B7D1', color: '#ffffff' },
  { bg: '#96CEB4', color: '#ffffff' },
  { bg: '#FFEAA7', color: '#2d3436' },
  { bg: '#DDA0DD', color: '#ffffff' },
  { bg: '#98D8C8', color: '#ffffff' },
  { bg: '#F7DC6F', color: '#2d3436' },
  { bg: '#BB8FCE', color: '#ffffff' },
  { bg: '#85C1E9', color: '#ffffff' },
  { bg: '#F8C471', color: '#ffffff' },
  { bg: '#82E0AA', color: '#ffffff' },
];

export default function AddProjectModal({ isOpen, onClose, onAddProject }: AddProjectModalProps) {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'icon' | 'text'>('text');
  const [projectLabel, setProjectLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setErrorDetails('');

    // Check authentication first
    if (!user) {
      setError('Please log in to create a project');
      setIsLoading(false);
      return;
    }

    // Validate type-specific requirements
    if (projectType === 'icon' && !iconPreview) {
      setError('Please upload an icon for icon-type projects');
      setIsLoading(false);
      return;
    }

    if (projectType === 'text' && !projectLabel.trim()) {
      setError('Please enter a label for text-type projects');
      setIsLoading(false);
      return;
    }

    if (projectType === 'text' && projectLabel.trim().length > 4) {
      setError('Project label cannot exceed 4 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Get the user's session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Please log in again');
        setErrorDetails('No valid session found');
        return;
      }

      // Prepare the project data for the API
      const projectData = {
        name: projectName.trim(),
        type: projectType,
        icon: projectType === 'icon' ? iconPreview : undefined,
        label: projectType === 'text' ? projectLabel.trim() : undefined,
        bg: selectedColor.bg,
        color: selectedColor.color,
      };

      // Pass the project data to the parent component for creation
      const newProject = {
        id: '', // Will be set by the parent after creation
        name: projectData.name,
        type: projectData.type,
        icon: projectData.icon,
        label: projectData.label,
        bg: projectData.bg,
        color: projectData.color,
      };

      console.log('AddProjectModal: Calling onAddProject with:', newProject);
      onAddProject(newProject);
      handleClose();
    } catch (error) {
      console.error('Error adding project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
      setErrorDetails(error instanceof Error ? error.stack?.split('\n')[0] || '' : 'Network or unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName('');
    setProjectType('text');
    setProjectLabel('');
    setSelectedColor(colorOptions[0]);
    setIconFile(null);
    setIconPreview('');
    setIsLoading(false);
    setError('');
    setErrorDetails('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Project</h2>
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-[#827989] hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authentication Status */}
              {!user && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">Not logged in</p>
                      <p className="text-yellow-300 text-xs mt-1 opacity-80">Please log in to create a project</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 text-sm font-medium">{error}</p>
                      {errorDetails && <p className="text-red-300 text-xs mt-1 opacity-80">{errorDetails}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-lg text-white placeholder-[#827989] focus:outline-none focus:border-[#5865f2] transition-colors"
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setProjectType('text')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      projectType === 'text'
                        ? 'border-[#5865f2] bg-[#5865f2]/20 text-white'
                        : 'border-[#444444] bg-[#333333] text-[#827989] hover:border-[#666666]'
                    }`}
                  >
                    <Palette className="w-4 h-4 mr-2 inline" />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectType('icon')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      projectType === 'icon'
                        ? 'border-[#5865f2] bg-[#5865f2]/20 text-white'
                        : 'border-[#444444] bg-[#333333] text-[#827989] hover:border-[#666666]'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2 inline" />
                    Icon
                  </button>
                </div>
              </div>

              {/* Project Label (for text type) */}
              {projectType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Label *</label>
                  <input
                    type="text"
                    value={projectLabel}
                    onChange={(e) => setProjectLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#444444] rounded-lg text-white placeholder-[#827989] focus:outline-none focus:border-[#5865f2] transition-colors"
                    placeholder="Enter label (e.g., NIKE)"
                    maxLength={4}
                    required
                  />
                </div>
              )}

              {/* Icon Upload (for icon type) */}
              {projectType === 'icon' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Icon *</label>
                  <div className="border-2 border-dashed border-[#444444] rounded-lg p-4 text-center">
                    {iconPreview ? (
                      <div className="space-y-2">
                        <Image
                          src={iconPreview}
                          alt="Icon preview"
                          width={48}
                          height={48}
                          className="mx-auto rounded"
                        />
                        <p className="text-sm text-[#827989]">Icon uploaded</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIconFile(null);
                            setIconPreview('');
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-[#827989] mx-auto mb-2" />
                        <p className="text-sm text-[#827989] mb-2">Click to upload icon</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="hidden"
                          id="icon-upload"
                        />
                        <label
                          htmlFor="icon-upload"
                          className="cursor-pointer text-[#5865f2] hover:text-[#4752c4] text-sm"
                        >
                          Choose file
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor.bg === color.bg
                          ? 'border-white scale-110'
                          : 'border-[#444444] hover:border-[#666666]'
                      }`}
                      style={{ backgroundColor: color.bg }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Preview</label>
                <div className="flex justify-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: selectedColor.bg,
                      color: selectedColor.color,
                      overflow: 'hidden',
                    }}
                  >
                    {projectType === 'icon' && iconPreview ? (
                      <Image
                        src={iconPreview}
                        alt="Preview"
                        width={26}
                        height={26}
                        className="w-[100%] h-[100%] object-cover"
                      />
                    ) : projectType === 'text' ? (
                      projectLabel.slice(0, 2).toUpperCase()
                    ) : (
                      '?'
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1 text-[#827989] hover:text-white"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={
                    isLoading || 
                    !projectName.trim() || 
                    !user ||
                    (projectType === 'icon' && !iconPreview) ||
                    (projectType === 'text' && !projectLabel.trim())
                  }
                >
                  {isLoading ? 'Adding...' : !user ? 'Please Login' : 'Add Project'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
