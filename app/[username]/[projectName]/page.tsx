import { getCollectionNameFromSlug } from '@/lib/url-utils';
import ProjectPageContainer from '@/containers/ProjectPageContainer';

interface ProjectPageProps {
  params: Promise<{
    username: string;
    projectName: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;

  const projectName = getCollectionNameFromSlug(resolvedParams.projectName, [
    'Nike Space',
    'Spacetwo Studio',
    'Photoshop Collections',
    'Design System',
    'Open Source',
  ]);

  return <ProjectPageContainer collectionName={projectName} username={resolvedParams.username} />;
}
