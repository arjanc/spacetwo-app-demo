'use client'

import { Dispatch, SetStateAction } from 'react'
import Header from '../Header'
import CommunityView from '../CommunityView'
import AddNewPanel from '../AddNewPanel'
import type { CommunityCard, Project } from '../../lib/data-service'
import ProjectSidebar from '@/components/ProjectSidebar'

interface HomePagePresentationProps {
  navigationItems: string[]
  activeFilter: string
  onFilterChange: Dispatch<SetStateAction<string>>
  filteredCards: CommunityCard[]
  sidebarProjects: Project[]
  onProjectClick: (project: Project) => void
  onAddProject?: (project: Project) => void
  onBackToCommunity: () => void
  isAddOpen: boolean
  onAddToggle: () => void
}

export default function HomePagePresentation({
  navigationItems,
  activeFilter,
  onFilterChange,
  filteredCards,
  sidebarProjects,
  onProjectClick,
  onAddProject,
  onBackToCommunity,
  isAddOpen,
  onAddToggle,
}: HomePagePresentationProps) {
  return (
    <div className="h-screen bg-[#111111] text-white flex flex-col overflow-hidden">
      <Header
        currentView="community"
        selectedProject={null}
        onBackToCommunity={onBackToCommunity}
        onAddToggle={onAddToggle}
        isAddOpen={isAddOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          projects={sidebarProjects}
          selectedProject={null}
          onProjectClick={onProjectClick}
          onAddProject={onAddProject}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${isAddOpen ? 'w-2/3' : 'w-full'}`}
          >
            <CommunityView
              navigationItems={navigationItems}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
              filteredCards={filteredCards}
            />
          </div>

          {/* Add New Panel */}
          {isAddOpen && (
            <div className="w-1/3 flex-shrink-0">
              <AddNewPanel isOpen={isAddOpen} onClose={() => onAddToggle()} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
