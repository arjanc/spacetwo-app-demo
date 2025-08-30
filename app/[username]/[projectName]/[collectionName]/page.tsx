import { getCollectionNameFromSlug } from '@/lib/url-utils';
import CollectionDetailPageContainer from '@/containers/CollectionDetailPageContainer';

interface CollectionPageProps {
  params: Promise<{
    username: string;
    projectName: string;
    collectionName: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const resolvedParams = await params;

  console.log('CollectionPage: Raw URL params:', resolvedParams);

  // Get the original project name from the slug
  const projectName = getCollectionNameFromSlug(resolvedParams.projectName, [
    'Nike Space',
    'Spacetwo Studio',
    'Photoshop Collections',
    'Design System',
    'Open Source',
  ]);

  // Get the original collection name from the slug
  const collectionName = getCollectionNameFromSlug(resolvedParams.collectionName, [
    'New Nike Graphic',
    'Instagram Story',
    'Product Showcase',
    'Brand Identity',
    'Website Redesign',
    'Photo Manipulation',
    'Digital Art',
    'Component Library',
    'UI Kit',
    'Other project',
    'asdasd',
  ]);

  console.log('CollectionPage: Converted names:', {
    username: resolvedParams.username,
    rawProjectName: resolvedParams.projectName,
    convertedProjectName: projectName,
    rawCollectionName: resolvedParams.collectionName,
    convertedCollectionName: collectionName,
  });

  return (
    <CollectionDetailPageContainer
      username={resolvedParams.username}
      projectName={projectName}
      collectionName={collectionName}
    />
  );
}
