import { getCollectionNameFromSlug } from '@/lib/url-utils';
import FileDetailPageContainer from '@/containers/FileDetailPageContainer';

interface FileDetailPageProps {
  params: Promise<{
    username: string;
    projectName: string;
    collectionName: string;
    fileId: string;
  }>;
}

export default async function FileDetailPage({ params }: FileDetailPageProps) {
  const resolvedParams = await params;

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

  return (
    <FileDetailPageContainer
      username={resolvedParams.username}
      fileId={resolvedParams.fileId}
      projectName={projectName}
      collectionName={collectionName}
    />
  );
}
