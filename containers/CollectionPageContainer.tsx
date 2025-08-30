'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CollectionPagePresentation from '../components/presentations/CollectionPagePresentation'
import { dataService, type Collection } from '../lib/data-service'
import { fetchUserProjects, createProject, type Project } from '../lib/projects-api'
import { toSlug } from '../lib/url-utils'


interface CollectionPageContainerProps {
  collectionName: string
}

export default function CollectionPageContainer({ collectionName }: CollectionPageContainerProps) {
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isUsersOpen, setIsUsersOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [sidebarProjects, setSidebarProjects] = useState<Project[]>([])
  const [currentCollections, setCurrentCollections] = useState<Collection[]>([])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [projects, collections] = await Promise.all([
          fetchUserProjects(),
          dataService.getCollectionsByName(collectionName),
        ])

        setSidebarProjects(projects)

        setCurrentCollections(collections)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionName])

  const handleSidebarClick = (project: Project) => {
    router.push(`/${toSlug(project.name)}`)
  }

  const handleAddProject = async (newProject: Project) => {
    try {
      // Create the project in the database
      const createdProject = await createProject({
        name: newProject.name,
        type: newProject.type,
        icon: newProject.icon,
        label: newProject.label,
        bg: newProject.bg,
        color: newProject.color,
      })

      // Add the created project to the sidebar
      setSidebarProjects((prev) => [...prev, createdProject])
    } catch (error) {
      console.error('Error creating project:', error)
      // Optionally show a toast or error message to the user
    }
  }

  const handleBackToCommunity = () => {
    router.push('/')
  }

  const handleChatToggle = () => {
    if (isUsersOpen) setIsUsersOpen(false)
    if (isAddOpen) setIsAddOpen(false)
    setIsChatOpen(!isChatOpen)
  }

  const handleUsersToggle = () => {
    if (isChatOpen) setIsChatOpen(false)
    if (isAddOpen) setIsAddOpen(false)
    setIsUsersOpen(!isUsersOpen)
  }

  const handleAddToggle = () => {
    if (isChatOpen) setIsChatOpen(false)
    if (isUsersOpen) setIsUsersOpen(false)
    setIsAddOpen(!isAddOpen)
  }

  const handleCollectionUpdate = (collectionId: number, newFiles: any[]) => {
    // Update the collections state with new files
    setCurrentCollections((prevCollections) =>
      prevCollections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              files: [...collection.files, ...newFiles],
              fileCount: collection.files.length + newFiles.length,
              lastUpdated: 'Just now',
            }
          : collection
      )
    )
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#827989]">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#5865f2] rounded hover:bg-[#4752c4]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <CollectionPagePresentation
      collectionName={collectionName}
      sidebarProjects={sidebarProjects}
      currentCollections={currentCollections}
      onSidebarClick={handleSidebarClick}
      onAddProject={handleAddProject}
      onBackToCommunity={handleBackToCommunity}
      onCollectionUpdate={handleCollectionUpdate}
      isChatOpen={isChatOpen}
      isUsersOpen={isUsersOpen}
      isAddOpen={isAddOpen}
      onChatToggle={handleChatToggle}
      onUsersToggle={handleUsersToggle}
      onAddToggle={handleAddToggle}
    />
  )
}
