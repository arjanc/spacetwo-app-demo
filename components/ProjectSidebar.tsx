'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AddProjectModal from './AddProjectModal';

interface Project {
  id: string;
  type: 'icon' | 'text';
  icon?: string;
  label?: string;
  bg: string;
  color: string;
  name: string;
  projectCount: number;
}

interface SidebarProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectClick: (project: Project) => void;
  onAddProject?: (project: Project) => void;
}

export default function ProjectSidebar({ projects, selectedProject, onProjectClick, onAddProject }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProject = (projectData: {
    id: string;
    name: string;
    type: 'icon' | 'text';
    icon?: string;
    label?: string;
    bg: string;
    color: string;
  }) => {
    console.log('ProjectSidebar: handleAddProject called with:', projectData);
    if (onAddProject) {
      const projectToCreate = {
        name: projectData.name,
        type: projectData.type,
        icon: projectData.icon,
        label: projectData.label,
        bg: projectData.bg,
        color: projectData.color,
        id: '', // Temporary ID, will be set by container after creation
        projectCount: 0, // New projects start with 0 collections
      };
      console.log('ProjectSidebar: Calling onAddProject with:', projectToCreate);
      onAddProject(projectToCreate);
    }
  };

  return (
    <>
      <div className="w-20 bg-[#111111] border-r border-[#333333] flex flex-col items-center py-6 gap-4 flex-shrink-0">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer overflow-hidden`}
            style={{ backgroundColor: project.bg, color: project.color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onProjectClick(project)}
          >
            {project.type === 'icon' ? (
              <Image src={project.icon! || '/placeholder.svg'} alt="Icon" width={20} height={20} className="w-auto" />
            ) : (
              project.label
            )}
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Button
            variant="ghost"
            size="sm"
            title="Add New Project"
            id="add-project-button"
            className="w-12 h-12 rounded-full border border-[#333333] text-[#827989] hover:text-white hover:border-[#666666] mt-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddProject={handleAddProject} />
    </>
  );
}
