-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom types
CREATE TYPE project_type AS ENUM ('icon', 'text');
CREATE TYPE file_type AS ENUM ('image', 'video', 'animation', 'design');
CREATE TYPE file_orientation AS ENUM ('portrait', 'landscape', 'square');
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar TEXT,
    role TEXT DEFAULT 'viewer',
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type project_type NOT NULL,
    icon TEXT,
    label TEXT,
    bg TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false,
    
    -- Constraints
    CONSTRAINT projects_label_length CHECK (char_length(label) <= 4),
    CONSTRAINT projects_icon_when_type_icon CHECK (
        (type = 'icon' AND icon IS NOT NULL) OR 
        (type = 'text' AND label IS NOT NULL)
    )
);

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_live BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    type file_type NOT NULL,
    orientation file_orientation DEFAULT 'landscape',
    preview_url TEXT,
    thumbnail_url TEXT,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#666666',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File tags junction table
CREATE TABLE IF NOT EXISTS file_tags (
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (file_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT false
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, user_id)
);

-- Project collaborators table
CREATE TABLE IF NOT EXISTS project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'viewer',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- File views table (for analytics)
CREATE TABLE IF NOT EXISTS file_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted);
CREATE INDEX IF NOT EXISTS idx_spaces_project_id ON spaces(project_id);
CREATE INDEX IF NOT EXISTS idx_spaces_owner_id ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_collections_space_id ON collections(space_id);
CREATE INDEX IF NOT EXISTS idx_collections_project_id ON collections(project_id);
CREATE INDEX IF NOT EXISTS idx_files_collection_id ON files(collection_id);
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_comments_file_id ON comments(file_id);
CREATE INDEX IF NOT EXISTS idx_likes_file_id ON likes(file_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_file_views_file_id ON file_views(file_id);
CREATE INDEX IF NOT EXISTS idx_file_views_viewed_at ON file_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_files_title_search ON files USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_files_description_search ON files USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_collections_title_search ON collections USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_projects_name_search ON projects USING gin(to_tsvector('english', name));

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_projects
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_spaces
    BEFORE UPDATE ON spaces
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_collections
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_files
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_comments
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Views for easier querying
CREATE OR REPLACE VIEW file_stats AS
SELECT 
    f.id,
    f.title,
    f.type,
    f.collection_id,
    COUNT(DISTINCT l.id) as likes_count,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT v.id) as views_count
FROM files f
LEFT JOIN likes l ON f.id = l.file_id
LEFT JOIN comments c ON f.id = c.file_id AND c.deleted = false
LEFT JOIN file_views v ON f.id = v.file_id
WHERE f.deleted = false
GROUP BY f.id, f.title, f.type, f.collection_id;

CREATE OR REPLACE VIEW project_stats AS
SELECT 
    p.id,
    p.name,
    p.type,
    COUNT(DISTINCT s.id) as spaces_count,
    COUNT(DISTINCT c.id) as collections_count,
    COUNT(DISTINCT f.id) as files_count,
    COUNT(DISTINCT pc.id) as collaborators_count
FROM projects p
LEFT JOIN spaces s ON p.id = s.project_id AND s.deleted = false
LEFT JOIN collections c ON p.id = c.project_id AND c.deleted = false
LEFT JOIN files f ON c.id = f.collection_id AND f.deleted = false
LEFT JOIN project_collaborators pc ON p.id = pc.project_id
WHERE p.deleted = false
GROUP BY p.id, p.name, p.type;

-- Insert some initial data
INSERT INTO tags (name, color) VALUES
    ('Photography', '#3b82f6'),
    ('Design', '#8b5cf6'),
    ('Motion', '#10b981'),
    ('Brand', '#f59e0b'),
    ('UI Design', '#ef4444'),
    ('Illustration', '#ec4899'),
    ('Prototype', '#14b8a6'); 