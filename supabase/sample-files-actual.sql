-- Sample files for actual collections in the database
-- This script adds sample files to existing collections: "Other project" and "asdasd"

-- Add sample files to "Other project" collection
INSERT INTO files (
    id,
    title,
    description,
    file_name,
    file_path,
    file_size,
    mime_type,
    type,
    orientation,
    preview_url,
    thumbnail_url,
    collection_id,
    owner_id,
    created_at,
    updated_at
) VALUES 
(
    uuid_generate_v4(),
    'Project Design Concept',
    'Initial design concept for the project',
    'project-concept.jpg',
    'https://picsum.photos/800/600?random=1',
    2048000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/400/300?random=1',
    (SELECT id FROM collections WHERE title = 'Other project' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Other project' LIMIT 1),
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Project Logo Draft',
    'Logo variations and iterations',
    'logo-draft.jpg',
    'https://picsum.photos/800/600?random=2',
    1536000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/400/300?random=2',
    (SELECT id FROM collections WHERE title = 'Other project' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Other project' LIMIT 1),
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Project Mockup',
    'User interface mockup with interactions',
    'project-mockup.jpg',
    'https://picsum.photos/600/800?random=3',
    2560000,
    'image/jpeg',
    'image',
    'portrait',
    'https://picsum.photos/600/800?random=3',
    'https://picsum.photos/300/400?random=3',
    (SELECT id FROM collections WHERE title = 'Other project' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Other project' LIMIT 1),
    NOW(),
    NOW()
);

-- Add sample files to "asdasd" collection  
INSERT INTO files (
    id,
    title,
    description,
    file_name,
    file_path,
    file_size,
    mime_type,
    type,
    orientation,
    preview_url,
    thumbnail_url,
    collection_id,
    owner_id,
    created_at,
    updated_at
) VALUES 
(
    uuid_generate_v4(),
    'Creative Experiment',
    'Experimental design exploration',
    'experiment.jpg',
    'https://picsum.photos/800/800?random=4',
    1024000,
    'image/jpeg',
    'image',
    'square',
    'https://picsum.photos/800/800?random=4',
    'https://picsum.photos/400/400?random=4',
    (SELECT id FROM collections WHERE title = 'asdasd' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'asdasd' LIMIT 1),
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Design Study',
    'Visual design study and research',
    'design-study.jpg',
    'https://picsum.photos/800/600?random=5',
    4096000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=5',
    'https://picsum.photos/400/300?random=5',
    (SELECT id FROM collections WHERE title = 'asdasd' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'asdasd' LIMIT 1),
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Prototype Demo',
    'Interactive prototype demonstration',
    'prototype-demo.mp4',
    'https://picsum.photos/800/600?random=6',
    8192000,
    'video/mp4',
    'video',
    'landscape',
    'https://picsum.photos/800/600?random=6',
    'https://picsum.photos/400/300?random=6',
    (SELECT id FROM collections WHERE title = 'asdasd' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'asdasd' LIMIT 1),
    NOW(),
    NOW()
);

-- Show summary of files per collection
SELECT 
    c.title as collection_title,
    COUNT(f.id) as file_count,
    array_agg(f.title ORDER BY f.created_at) as file_titles
FROM collections c
LEFT JOIN files f ON c.id = f.collection_id AND f.deleted = false
WHERE c.deleted = false
GROUP BY c.id, c.title
ORDER BY c.title; 