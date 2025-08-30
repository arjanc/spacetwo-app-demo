-- Create storage buckets for different types of files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-files', 'project-files', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('previews', 'previews', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('thumbnails', 'thumbnails', true, 1048576, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

-- Storage policies for project-files bucket
CREATE POLICY "Users can view project files they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  -- Check if user has access to the file based on the file path structure
  -- Expected path format: project_id/collection_id/file_name
  (
    -- Users can access files from their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can access files from projects they collaborate on
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
    )
  )


);

CREATE POLICY "Users can upload files to accessible projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  -- Check if user has access to upload to the project
  (
    -- Users can upload to their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can upload to projects they collaborate on with editor/admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can update files in accessible projects"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  -- Check if user has access to update the file
  (
    -- Users can update files in their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can update files in projects they collaborate on with editor/admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can delete files in accessible projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  -- Check if user has access to delete the file
  (
    -- Users can delete files from their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can delete files from projects they collaborate on with admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role = 'admin'
    )
  )
);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Storage policies for previews bucket
CREATE POLICY "Anyone can view previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'previews');

CREATE POLICY "Users can upload previews for accessible projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'previews' AND
  -- Check if user has access to upload to the project
  (
    -- Users can upload to their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can upload to projects they collaborate on with editor/admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can update previews in accessible projects"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'previews' AND
  -- Check if user has access to update the preview
  (
    -- Users can update previews in their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can update previews in projects they collaborate on with editor/admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can delete previews in accessible projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'previews' AND
  -- Check if user has access to delete the preview
  (
    -- Users can delete previews from their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can delete previews from projects they collaborate on with admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role = 'admin'
    )
  )
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails for accessible projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' AND
  -- Check if user has access to upload to the project
  (
    -- Users can upload to their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can upload to projects they collaborate on with editor/admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can update thumbnails in accessible projects"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'thumbnails' AND
  -- Check if user has access to update the thumbnail
  (
    -- Users can update thumbnails in their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can update thumbnails in projects they collaborate on with editor/admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role IN ('admin', 'editor')
    )
  )
);

CREATE POLICY "Users can delete thumbnails in accessible projects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' AND
  -- Check if user has access to delete the thumbnail
  (
    -- Users can delete thumbnails from their own projects
    auth.uid()::text = split_part(name, '/', 1) OR
    -- Users can delete thumbnails from projects they collaborate on with admin role
    EXISTS (
      SELECT 1 FROM project_collaborators pc
      JOIN projects p ON pc.project_id = p.id
      WHERE pc.user_id = auth.uid()
      AND p.id::text = split_part(name, '/', 1)
      AND pc.accepted_at IS NOT NULL
      AND pc.role = 'admin'
    )
  )
);

-- Function to generate upload paths
CREATE OR REPLACE FUNCTION generate_upload_path(project_id UUID, collection_id UUID, file_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN project_id::text || '/' || collection_id::text || '/' || file_name;
END;
$$;

-- Function to generate preview path
CREATE OR REPLACE FUNCTION generate_preview_path(project_id UUID, file_id UUID, file_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN project_id::text || '/' || file_id::text || '/' || 'preview_' || file_name;
END;
$$;

-- Function to generate thumbnail path
CREATE OR REPLACE FUNCTION generate_thumbnail_path(project_id UUID, file_id UUID, file_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN project_id::text || '/' || file_id::text || '/' || 'thumb_' || file_name;
END;
$$;

-- Function to generate avatar path
CREATE OR REPLACE FUNCTION generate_avatar_path(user_id UUID, file_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN user_id::text || '/' || file_name;
END;
$$; 