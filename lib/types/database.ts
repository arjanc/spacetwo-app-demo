// Database types that match the Supabase schema

export type ProjectType = 'icon' | 'text'
export type FileType = 'image' | 'video' | 'animation' | 'design'
export type FileOrientation = 'portrait' | 'landscape' | 'square'
export type UserRole = 'admin' | 'editor' | 'viewer'

// Base interface for all database entities
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  deleted: boolean
}

// User interface
export interface User extends BaseEntity {
  email: string
  name: string
  username?: string
  avatar?: string
  role: string
  is_online: boolean
  last_seen: string
}

// Project interface
export interface Project extends BaseEntity {
  name: string
  type: ProjectType
  icon?: string
  label?: string
  bg: string
  color: string
  description?: string
  owner_id: string

  // Computed fields (from joins)
  owner?: User
  spaces_count?: number
  collections_count?: number
  files_count?: number
  collaborators_count?: number
}

// Space interface
export interface Space extends BaseEntity {
  title: string
  description?: string
  project_id: string
  owner_id: string
  is_public: boolean

  // Computed fields (from joins)
  project?: Project
  owner?: User
  collections?: Collection[]
}

// Collection interface
export interface Collection extends BaseEntity {
  title: string
  description?: string
  space_id: string
  project_id: string
  owner_id: string
  is_live: boolean

  // Computed fields (from joins)
  space?: Space
  project?: Project
  owner?: User
  files?: File[]
  file_count?: number
}

// File interface
export interface File extends BaseEntity {
  title: string
  description?: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  type: FileType
  orientation: FileOrientation
  preview_url?: string
  thumbnail_url?: string
  collection_id: string
  owner_id: string

  // Computed fields (from joins)
  collection?: Collection
  owner?: User
  tags?: Tag[]
  likes_count?: number
  comments_count?: number
  views_count?: number
  comments?: Comment[]
  likes?: Like[]
}

// Tag interface
export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

// File tags junction interface
export interface FileTag {
  file_id: string
  tag_id: string
  created_at: string

  // Computed fields (from joins)
  file?: File
  tag?: Tag
}

// Comment interface
export interface Comment extends BaseEntity {
  content: string
  file_id: string
  author_id: string
  parent_id?: string

  // Computed fields (from joins)
  file?: File
  author?: User
  parent?: Comment
  replies?: Comment[]
}

// Like interface
export interface Like {
  id: string
  file_id: string
  user_id: string
  created_at: string

  // Computed fields (from joins)
  file?: File
  user?: User
}

// Project collaborator interface
export interface ProjectCollaborator {
  id: string
  project_id: string
  user_id: string
  role: UserRole
  invited_by?: string
  invited_at: string
  accepted_at?: string
  created_at: string

  // Computed fields (from joins)
  project?: Project
  user?: User
  inviter?: User
}

// File view interface (for analytics)
export interface FileView {
  id: string
  file_id: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  viewed_at: string

  // Computed fields (from joins)
  file?: File
  user?: User
}

// API request/response types
export interface CreateProjectRequest {
  name: string
  type: ProjectType
  icon?: string
  label?: string
  bg: string
  color: string
  description?: string
}

export interface UpdateProjectRequest {
  id: string
  name?: string
  type?: ProjectType
  icon?: string
  label?: string
  bg?: string
  color?: string
  description?: string
}

export interface CreateSpaceRequest {
  title: string
  description?: string
  project_id: string
  is_public?: boolean
}

export interface UpdateSpaceRequest {
  id: string
  title?: string
  description?: string
  is_public?: boolean
}

export interface CreateCollectionRequest {
  title: string
  description?: string
  space_id: string
  project_id: string
  is_live?: boolean
}

export interface UpdateCollectionRequest {
  id: string
  title?: string
  description?: string
  is_live?: boolean
}

export interface CreateFileRequest {
  title: string
  description?: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  type: FileType
  orientation?: FileOrientation
  preview_url?: string
  thumbnail_url?: string
  collection_id: string
}

export interface UpdateFileRequest {
  id: string
  title?: string
  description?: string
  type?: FileType
  orientation?: FileOrientation
}

export interface CreateCommentRequest {
  content: string
  file_id: string
  parent_id?: string
}

export interface UpdateCommentRequest {
  id: string
  content: string
}

export interface CreateUserRequest {
  email: string
  name: string
  username?: string
  avatar?: string
  role?: string
}

export interface UpdateUserRequest {
  id: string
  name?: string
  username?: string
  avatar?: string
  role?: string
}

export interface InviteCollaboratorRequest {
  project_id: string
  user_id: string
  role: UserRole
}

// Query parameter types
export interface GetProjectsQuery {
  owner_id?: string
  search?: string
  limit?: number
  offset?: number
}

export interface GetCollectionsQuery {
  project_id?: string
  space_id?: string
  owner_id?: string
  is_live?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface GetFilesQuery {
  collection_id?: string
  owner_id?: string
  type?: FileType
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'likes_count' | 'comments_count' | 'views_count'
  sort_order?: 'asc' | 'desc'
}

export interface GetCommentsQuery {
  file_id: string
  parent_id?: string
  limit?: number
  offset?: number
}

// Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Statistics types
export interface FileStats {
  id: string
  title: string
  type: FileType
  collection_id: string
  likes_count: number
  comments_count: number
  views_count: number
}

export interface ProjectStats {
  id: string
  name: string
  type: ProjectType
  spaces_count: number
  collections_count: number
  files_count: number
  collaborators_count: number
}

// Supabase Database type (for use with Supabase client)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
      }
      spaces: {
        Row: Space
        Insert: Omit<Space, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Space, 'id' | 'created_at' | 'updated_at'>>
      }
      collections: {
        Row: Collection
        Insert: Omit<Collection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Collection, 'id' | 'created_at' | 'updated_at'>>
      }
      files: {
        Row: File
        Insert: Omit<File, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<File, 'id' | 'created_at' | 'updated_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>
      }
      file_tags: {
        Row: FileTag
        Insert: Omit<FileTag, 'created_at'>
        Update: Partial<FileTag>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at'>>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'>
        Update: Partial<Omit<Like, 'id' | 'created_at'>>
      }
      project_collaborators: {
        Row: ProjectCollaborator
        Insert: Omit<ProjectCollaborator, 'id' | 'created_at'>
        Update: Partial<Omit<ProjectCollaborator, 'id' | 'created_at'>>
      }
      file_views: {
        Row: FileView
        Insert: Omit<FileView, 'id' | 'viewed_at'>
        Update: Partial<Omit<FileView, 'id' | 'viewed_at'>>
      }
    }
    Views: {
      file_stats: {
        Row: FileStats
      }
      project_stats: {
        Row: ProjectStats
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_type: ProjectType
      file_type: FileType
      file_orientation: FileOrientation
      user_role: UserRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
