/**
 * Convert a string to a URL-friendly slug
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Convert a slug back to a readable string
 */
export function fromSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ') // Replace - with space
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Get the original collection name from available collections using slug
 */
export function getCollectionNameFromSlug(slug: string, availableCollections: string[]): string {
  console.log('slug', slug);
  const normalizedSlug = toSlug(slug);

  // Find the collection that matches the slug
  const matchingCollection = availableCollections.find((collection) => toSlug(collection) === normalizedSlug);

  return matchingCollection || fromSlug(slug);
}

/**
 * Generate username-based URLs for navigation
 */
export function createUserProjectUrl(username: string, projectName: string): string {
  return `/${toSlug(username)}/${toSlug(projectName)}`;
}

export function createUserCollectionUrl(username: string, projectName: string, collectionName: string): string {
  return `/${toSlug(username)}/${toSlug(projectName)}/${toSlug(collectionName)}`;
}

export function createUserFileUrl(
  username: string,
  projectName: string,
  collectionName: string,
  fileId: string,
): string {
  return `/${toSlug(username)}/${toSlug(projectName)}/${toSlug(collectionName)}/${fileId}`;
}
