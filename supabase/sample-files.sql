-- Sample files for testing collection file display
-- This script adds sample files to existing collections

-- First, let's get some collection IDs to work with
-- You'll need to replace these UUIDs with actual collection IDs from your database

-- Add sample files to collections
-- Note: Replace the collection_id and owner_id values with actual IDs from your database

-- Sample file 1: Image in first collection
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
) VALUES (
    uuid_generate_v4(),
    'Nike Air Max Concept',
    'Modern sneaker design concept with gradient background',
    'nike-air-max-concept.jpg',
    'https://picsum.photos/800/600?random=1',
    2048000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/400/300?random=1',
    (SELECT id FROM collections WHERE title = 'New Nike Graphic' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'New Nike Graphic' LIMIT 1),
    NOW(),
    NOW()
);

-- Sample file 2: Another image in first collection
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
) VALUES (
    uuid_generate_v4(),
    'Nike Logo Variation',
    'Alternative Nike logo design with modern typography',
    'nike-logo-variation.jpg',
    'https://picsum.photos/800/600?random=2',
    1536000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/400/300?random=2',
    (SELECT id FROM collections WHERE title = 'New Nike Graphic' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'New Nike Graphic' LIMIT 1),
    NOW(),
    NOW()
);

-- Sample file 3: Portrait image
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
) VALUES (
    uuid_generate_v4(),
    'Product Photography',
    'High-quality product shot with professional lighting',
    'product-photo.jpg',
    'https://picsum.photos/600/800?random=3',
    2560000,
    'image/jpeg',
    'image',
    'portrait',
    'https://picsum.photos/600/800?random=3',
    'https://picsum.photos/300/400?random=3',
    (SELECT id FROM collections WHERE title = 'Product Showcase' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Product Showcase' LIMIT 1),
    NOW(),
    NOW()
);

-- Sample file 4: Square image
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
) VALUES (
    uuid_generate_v4(),
    'Instagram Story Template',
    'Social media template with brand colors',
    'instagram-story.jpg',
    'https://picsum.photos/800/800?random=4',
    1024000,
    'image/jpeg',
    'image',
    'square',
    'https://picsum.photos/800/800?random=4',
    'https://picsum.photos/400/400?random=4',
    (SELECT id FROM collections WHERE title = 'Instagram Story' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Instagram Story' LIMIT 1),
    NOW(),
    NOW()
);

-- Sample file 5: Design file
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
) VALUES (
    uuid_generate_v4(),
    'Brand Guidelines',
    'Complete brand identity guidelines and specifications',
    'brand-guidelines.pdf',
    'https://picsum.photos/800/600?random=5',
    4096000,
    'application/pdf',
    'design',
    'landscape',
    'https://picsum.photos/800/600?random=5',
    'https://picsum.photos/400/300?random=5',
    (SELECT id FROM collections WHERE title = 'Brand Identity' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Brand Identity' LIMIT 1),
    NOW(),
    NOW()
);

-- Sample file 6: Video file
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
) VALUES (
    uuid_generate_v4(),
    'Website Demo Video',
    'Interactive prototype demonstration video',
    'website-demo.mp4',
    'https://picsum.photos/800/600?random=6',
    8192000,
    'video/mp4',
    'video',
    'landscape',
    'https://picsum.photos/800/600?random=6',
    'https://picsum.photos/400/300?random=6',
    (SELECT id FROM collections WHERE title = 'Website Redesign' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Website Redesign' LIMIT 1),
    NOW(),
    NOW()
);

-- Add more files to make collections look fuller
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
    'Nike Color Palette',
    'Official brand color specifications',
    'nike-colors.jpg',
    'https://picsum.photos/800/600?random=7',
    1024000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=7',
    'https://picsum.photos/400/300?random=7',
    (SELECT id FROM collections WHERE title = 'New Nike Graphic' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'New Nike Graphic' LIMIT 1),
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Typography Study',
    'Font exploration for brand identity',
    'typography.jpg',
    'https://picsum.photos/800/600?random=8',
    1536000,
    'image/jpeg',
    'image',
    'landscape',
    'https://picsum.photos/800/600?random=8',
    'https://picsum.photos/400/300?random=8',
    (SELECT id FROM collections WHERE title = 'Brand Identity' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Brand Identity' LIMIT 1),
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Digital Art Experiment',
    'Creative digital artwork using new techniques',
    'digital-art.jpg',
    'https://picsum.photos/800/600?random=9',
    3072000,
    'image/jpeg',
    'image',
    'square',
    'https://picsum.photos/800/800?random=9',
    'https://picsum.photos/400/400?random=9',
    (SELECT id FROM collections WHERE title = 'Digital Art' LIMIT 1),
    (SELECT owner_id FROM collections WHERE title = 'Digital Art' LIMIT 1),
    NOW(),
    NOW()
);

-- Show summary of added files
SELECT 
    c.title as collection_title,
    COUNT(f.id) as file_count
FROM collections c
LEFT JOIN files f ON c.id = f.collection_id AND f.deleted = false
WHERE c.deleted = false
GROUP BY c.id, c.title
ORDER BY c.title; 