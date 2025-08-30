-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_views ENABLE ROW LEVEL SECURITY;

-- Note: Using auth.uid() directly instead of creating wrapper function
-- auth.uid() returns the current authenticated user's ID

-- Helper function to check if user is project collaborator
CREATE OR REPLACE FUNCTION is_project_collaborator(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM project_collaborators 
    WHERE project_id = project_uuid 
    AND user_id = user_uuid
    AND accepted_at IS NOT NULL
  );
$$;

-- Helper function to check if user is project owner
CREATE OR REPLACE FUNCTION is_project_owner(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM projects 
    WHERE id = project_uuid 
    AND owner_id = user_uuid
    AND deleted = false
  );
$$;

-- Helper function to check if user has access to project
CREATE OR REPLACE FUNCTION has_project_access(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT is_project_owner(project_uuid, user_uuid) OR is_project_collaborator(project_uuid, user_uuid);
$$;

-- Helper function to get project ID from collection ID
CREATE OR REPLACE FUNCTION get_project_id_from_collection(collection_uuid UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT project_id FROM collections WHERE id = collection_uuid;
$$;

-- Helper function to get project ID from file ID
CREATE OR REPLACE FUNCTION get_project_id_from_file(file_uuid UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT c.project_id FROM files f 
  JOIN collections c ON f.collection_id = c.id 
  WHERE f.id = file_uuid;
$$;

-- USERS TABLE POLICIES
-- Users can view their own profile and other users' public info
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can view other users' basic info (needed for collaboration)
CREATE POLICY "Users can view other users basic info" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROJECTS TABLE POLICIES
-- Users can view projects they own or collaborate on
CREATE POLICY "Users can view accessible projects" ON projects
  FOR SELECT USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      has_project_access(id, auth.uid())
    )
  );

-- Users can create projects
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update projects they own
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (
    owner_id = auth.uid() AND deleted = false
  );

-- Users can delete (soft delete) projects they own
CREATE POLICY "Users can delete their own projects" ON projects
  FOR UPDATE USING (
    owner_id = auth.uid() AND deleted = false
  );

-- SPACES TABLE POLICIES
-- Users can view spaces in projects they have access to
CREATE POLICY "Users can view accessible spaces" ON spaces
  FOR SELECT USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      has_project_access(project_id, auth.uid()) OR
      is_public = true
    )
  );

-- Users can create spaces in projects they have access to
CREATE POLICY "Users can create spaces in accessible projects" ON spaces
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() AND 
    has_project_access(project_id, auth.uid())
  );

-- Users can update spaces they own or have editor access to
CREATE POLICY "Users can update accessible spaces" ON spaces
  FOR UPDATE USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      (has_project_access(project_id, auth.uid()) AND 
       EXISTS(
         SELECT 1 FROM project_collaborators 
         WHERE project_id = spaces.project_id 
         AND user_id = auth.uid() 
         AND role IN ('admin', 'editor')
       ))
    )
  );

-- Users can delete spaces they own or have admin access to
CREATE POLICY "Users can delete accessible spaces" ON spaces
  FOR UPDATE USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      (has_project_access(project_id, auth.uid()) AND 
       EXISTS(
         SELECT 1 FROM project_collaborators 
         WHERE project_id = spaces.project_id 
         AND user_id = auth.uid() 
         AND role = 'admin'
       ))
    )
  );

-- COLLECTIONS TABLE POLICIES
-- Users can view collections in projects they have access to
CREATE POLICY "Users can view accessible collections" ON collections
  FOR SELECT USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      has_project_access(project_id, auth.uid())
    )
  );

-- Users can create collections in projects they have access to
CREATE POLICY "Users can create collections in accessible projects" ON collections
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() AND 
    has_project_access(project_id, auth.uid())
  );

-- Users can update collections they own or have editor access to
CREATE POLICY "Users can update accessible collections" ON collections
  FOR UPDATE USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      (has_project_access(project_id, auth.uid()) AND 
       EXISTS(
         SELECT 1 FROM project_collaborators 
         WHERE project_id = collections.project_id 
         AND user_id = auth.uid() 
         AND role IN ('admin', 'editor')
       ))
    )
  );

-- Users can delete collections they own or have admin access to
CREATE POLICY "Users can delete accessible collections" ON collections
  FOR UPDATE USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      (has_project_access(project_id, auth.uid()) AND 
       EXISTS(
         SELECT 1 FROM project_collaborators 
         WHERE project_id = collections.project_id 
         AND user_id = auth.uid() 
         AND role = 'admin'
       ))
    )
  );

-- FILES TABLE POLICIES
-- Users can view files in projects they have access to
CREATE POLICY "Users can view accessible files" ON files
  FOR SELECT USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      has_project_access(get_project_id_from_file(id), auth.uid())
    )
  );

-- Users can create files in collections they have access to
CREATE POLICY "Users can create files in accessible collections" ON files
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() AND 
    has_project_access(get_project_id_from_collection(collection_id), auth.uid())
  );

-- Users can update files they own or have editor access to
CREATE POLICY "Users can update accessible files" ON files
  FOR UPDATE USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      (has_project_access(get_project_id_from_file(id), auth.uid()) AND 
       EXISTS(
         SELECT 1 FROM project_collaborators 
         WHERE project_id = get_project_id_from_file(files.id) 
         AND user_id = auth.uid() 
         AND role IN ('admin', 'editor')
       ))
    )
  );

-- Users can delete files they own or have admin access to
CREATE POLICY "Users can delete accessible files" ON files
  FOR UPDATE USING (
    deleted = false AND (
      owner_id = auth.uid() OR 
      (has_project_access(get_project_id_from_file(id), auth.uid()) AND 
       EXISTS(
         SELECT 1 FROM project_collaborators 
         WHERE project_id = get_project_id_from_file(files.id) 
         AND user_id = auth.uid() 
         AND role = 'admin'
       ))
    )
  );

-- TAGS TABLE POLICIES
-- Everyone can view tags
CREATE POLICY "Everyone can view tags" ON tags
  FOR SELECT USING (true);

-- Only authenticated users can create tags
CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- FILE_TAGS TABLE POLICIES
-- Users can view file tags for files they have access to
CREATE POLICY "Users can view file tags for accessible files" ON file_tags
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = file_tags.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Users can create file tags for files they have access to
CREATE POLICY "Users can create file tags for accessible files" ON file_tags
  FOR INSERT WITH CHECK (
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = file_tags.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Users can delete file tags for files they have access to
CREATE POLICY "Users can delete file tags for accessible files" ON file_tags
  FOR DELETE USING (
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = file_tags.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- COMMENTS TABLE POLICIES
-- Users can view comments on files they have access to
CREATE POLICY "Users can view comments on accessible files" ON comments
  FOR SELECT USING (
    deleted = false AND 
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = comments.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Users can create comments on files they have access to
CREATE POLICY "Users can create comments on accessible files" ON comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND 
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = comments.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    author_id = auth.uid() AND deleted = false
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR UPDATE USING (
    author_id = auth.uid() AND deleted = false
  );

-- LIKES TABLE POLICIES
-- Users can view likes on files they have access to
CREATE POLICY "Users can view likes on accessible files" ON likes
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = likes.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Users can create likes on files they have access to
CREATE POLICY "Users can create likes on accessible files" ON likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = likes.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (user_id = auth.uid());

-- PROJECT_COLLABORATORS TABLE POLICIES
-- Users can view collaborators of projects they have access to
CREATE POLICY "Users can view collaborators of accessible projects" ON project_collaborators
  FOR SELECT USING (
    has_project_access(project_id, auth.uid())
  );

-- Project owners can invite collaborators
CREATE POLICY "Project owners can invite collaborators" ON project_collaborators
  FOR INSERT WITH CHECK (
    is_project_owner(project_id, auth.uid()) AND 
    invited_by = auth.uid()
  );

-- Users can accept their own invitations
CREATE POLICY "Users can accept their own invitations" ON project_collaborators
  FOR UPDATE USING (
    user_id = auth.uid() AND accepted_at IS NULL
  );

-- Project owners can update collaborator roles
CREATE POLICY "Project owners can update collaborator roles" ON project_collaborators
  FOR UPDATE USING (
    is_project_owner(project_id, auth.uid())
  );

-- Project owners can remove collaborators
CREATE POLICY "Project owners can remove collaborators" ON project_collaborators
  FOR DELETE USING (
    is_project_owner(project_id, auth.uid())
  );

-- Users can remove themselves from projects
CREATE POLICY "Users can remove themselves from projects" ON project_collaborators
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- FILE_VIEWS TABLE POLICIES
-- Users can view file views for files they have access to
CREATE POLICY "Users can view file views for accessible files" ON file_views
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = file_views.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- System can insert file views for accessible files
CREATE POLICY "System can insert file views for accessible files" ON file_views
  FOR INSERT WITH CHECK (
    EXISTS(
      SELECT 1 FROM files 
      WHERE id = file_views.file_id 
      AND (
        owner_id = auth.uid() OR 
        has_project_access(get_project_id_from_file(id), auth.uid())
      )
      AND deleted = false
    )
  );

-- Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_project ON project_collaborators(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_deleted ON projects(owner_id, deleted);
CREATE INDEX IF NOT EXISTS idx_spaces_owner_deleted ON spaces(owner_id, deleted);
CREATE INDEX IF NOT EXISTS idx_collections_owner_deleted ON collections(owner_id, deleted);
CREATE INDEX IF NOT EXISTS idx_files_owner_deleted ON files(owner_id, deleted);
CREATE INDEX IF NOT EXISTS idx_comments_author_deleted ON comments(author_id, deleted);
CREATE INDEX IF NOT EXISTS idx_likes_user_file ON likes(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_file_views_user_file ON file_views(user_id, file_id); 