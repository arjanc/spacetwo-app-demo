// Data service for fetching external JSON data
export interface CommunityCard {
  id: number;
  image: string;
  title: string;
  author: string;
  avatar: string;
  likes: number;
  comments: number;
  appIcon: string;
  category: string;
}

export interface Project {
  id: string;
  type: 'icon' | 'text';
  icon?: string;
  label?: string;
  bg: string;
  color: string;
  name: string;
  projectCount: number;
}

export interface CollectionFile {
  id: string;
  title?: string;
  image: string;
  type: string;
  orientation: string;
  mime_type?: string;
}

export interface Collection {
  id: string;
  title: string;
  fileCount: number;
  lastUpdated: string;
  isLive: boolean;
  files: CollectionFile[];
}

export interface FileDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  orientation?: string;
  mime_type?: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  tags: string[];
  type: 'image' | 'video' | 'animation';
  category: string;
  createdAt: string;
  collection?: string;
  project?: string;
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  role?: string;
}

// Import data from TypeScript files
import { communityCardsData } from './data/community-cards';
import { sidebarProjectsData } from './data/projects';
import { collectionsData } from './data/collections';
import { fileDetailsData } from './data/file-details';
import { navigationItemsData } from './data/navigation-items';
import { usersData } from './data/users';

class DataService {
  async getCommunityCards(): Promise<CommunityCard[]> {
    return Promise.resolve(communityCardsData);
  }

  async getProjects(): Promise<Project[]> {
    return Promise.resolve(sidebarProjectsData);
  }

  async getCollections(): Promise<Record<string, Collection[]>> {
    return Promise.resolve(collectionsData);
  }

  async getFileDetails(): Promise<Record<string, FileDetail>> {
    return Promise.resolve(fileDetailsData);
  }

  async getNavigationItems(): Promise<string[]> {
    return Promise.resolve(navigationItemsData);
  }

  async getUsers(): Promise<User[]> {
    return Promise.resolve(usersData);
  }

  async getFileById(id: string): Promise<FileDetail | null> {
    const fileDetails = await this.getFileDetails();
    return fileDetails[id] || null;
  }

  async getFileByCollectionAndId(collectionName: string, fileId: string): Promise<FileDetail | null> {
    // First, check static collections data
    const collections = await this.getCollections();

    let targetFile: CollectionFile | null = null;
    let targetCollection: Collection | null = null;

    // Search through all projects to find the collection and file
    for (const [projectKey, projectCollections] of Object.entries(collections)) {
      for (const collection of projectCollections) {
        // Check if this is the collection we're looking for
        if (collection.title === collectionName) {
          // Look for the file in this collection
          const file = collection.files.find((f) => f.id.toString() === fileId);
          if (file) {
            targetFile = file;
            targetCollection = collection;
            break;
          }
        }
      }
      if (targetFile && targetCollection) break;
    }

    // Note: No longer checking localStorage for projects as they're now stored in database

    if (!targetFile || !targetCollection) {
      return null;
    }

    // Create a unique file detail that matches the clicked file
    const fileDetail: FileDetail = {
      id: fileId,
      title: `${targetCollection.title} - File ${fileId}`,
      description: `This is file ${fileId} from the ${targetCollection.title} collection in ${collectionName}. This file showcases the creative work and design elements that are part of this collection's vision.`,
      image: targetFile.image,
      author: {
        name: 'Creative Team',
        avatar: `https://picsum.photos/seed/author${fileId}/100/100`,
        username: '@creativeteam',
      },
      stats: {
        likes: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        views: Math.floor(Math.random() * 1000) + 100,
      },
      tags: [targetCollection.title.toLowerCase().replace(/\s+/g, '-'), 'design', 'creative'],
      type: targetFile.type === 'video' ? 'video' : targetFile.type === 'animation' ? 'animation' : 'image',
      category: collectionName,
      createdAt: '2 days ago',
      collection: collectionName,
    };

    return fileDetail;
  }

  async getCollectionsByName(collectionName: string): Promise<Collection[]> {
    const collections = await this.getCollections();
    return collections[collectionName] || [];
  }

  async getFilteredCards(filter: string): Promise<CommunityCard[]> {
    const cards = await this.getCommunityCards();

    if (filter === 'Trending') {
      return cards.sort((a, b) => b.likes - a.likes);
    }

    return cards.filter((card) => card.category === filter);
  }

  async searchFiles(query: string, limit: number = 8): Promise<FileDetail[]> {
    if (!query.trim()) {
      return [];
    }

    const fileDetails = await this.getFileDetails();
    const files = Object.values(fileDetails);
    const searchTerm = query.toLowerCase();

    // Search with relevance scoring
    const searchResults = files
      .map((file) => {
        let score = 0;

        // Title match (highest priority)
        if (file.title.toLowerCase().includes(searchTerm)) {
          score += 10;
          if (file.title.toLowerCase().startsWith(searchTerm)) {
            score += 5; // Bonus for title starting with search term
          }
        }

        // Author name match
        if (file.author.name.toLowerCase().includes(searchTerm)) {
          score += 8;
        }

        // Category match
        if (file.category.toLowerCase().includes(searchTerm)) {
          score += 6;
        }

        // Tags match
        const tagMatch = file.tags.some((tag) => tag.toLowerCase().includes(searchTerm));
        if (tagMatch) {
          score += 5;
        }

        // Description match (lower priority)
        if (file.description.toLowerCase().includes(searchTerm)) {
          score += 3;
        }

        // Username match
        if (file.author.username.toLowerCase().includes(searchTerm)) {
          score += 4;
        }

        return { file, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ file }) => file);

    return searchResults;
  }

  async getFileByProjectCollectionAndId(
    projectName: string,
    collectionName: string,
    fileId: string,
  ): Promise<FileDetail | null> {
    // First, check static collections data
    const collections = await this.getCollections();
    const projectCollections = collections[projectName] || [];

    let targetFile: CollectionFile | null = null;
    let targetCollection: Collection | null = null;

    // Find the specific collection and file in static data
    for (const collection of projectCollections) {
      if (collection.title === collectionName) {
        const file = collection.files.find((f) => f.id.toString() === fileId);
        if (file) {
          targetFile = file;
          targetCollection = collection;
          break;
        }
      }
    }

    // Note: No longer checking localStorage for projects as they're now stored in database

    if (!targetFile || !targetCollection) {
      return null;
    }

    // Create a unique file detail that matches the clicked file
    const fileDetail: FileDetail = {
      id: fileId,
      title: `${targetCollection.title} - File ${fileId}`,
      description: `This is file ${fileId} from the ${targetCollection.title} collection in ${projectName}/${collectionName}. This file showcases the creative work and design elements that are part of this collection's vision.`,
      image: targetFile.image,
      author: {
        name: 'Creative Team',
        avatar: `https://picsum.photos/seed/author${fileId}/100/100`,
        username: '@creativeteam',
      },
      stats: {
        likes: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        views: Math.floor(Math.random() * 1000) + 100,
      },
      tags: [
        projectName.toLowerCase().replace(/\s+/g, '-'),
        targetCollection.title.toLowerCase().replace(/\s+/g, '-'),
        'design',
        'creative',
      ],
      type: targetFile.type === 'video' ? 'video' : targetFile.type === 'animation' ? 'animation' : 'image',
      category: `${projectName}/${collectionName}`,
      createdAt: '2 days ago',
      collection: collectionName,
      project: projectName,
    };

    return fileDetail;
  }
}

export const dataService = new DataService();
