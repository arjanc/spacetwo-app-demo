-- Remove the restrictive constraint from projects table
-- This constraint was too restrictive and confusingly named
-- We'll handle validation at the application level instead

-- Drop the problematic constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_icon_when_type_icon;

-- Keep the label length constraint as it's still useful
-- CONSTRAINT projects_label_length CHECK (char_length(label) <= 4)

-- Note: The constraint projects_label_length is kept as it's still useful
-- and doesn't cause the same issues as the icon/label constraint 