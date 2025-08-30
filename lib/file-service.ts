// Supported file types and their MIME types
const SUPPORTED_FILE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/svg+xml": "svg",
} as const;

type SupportedMimeType = keyof typeof SUPPORTED_FILE_TYPES;

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

export interface UploadedFile {
  id: number;
  image: string;
  type: string;
  orientation: string;
}

export interface FileUploadResult {
  success: boolean;
  files: UploadedFile[];
  errors: { fileName: string; error: string }[];
}

export async function uploadFiles(files: File[]): Promise<FileUploadResult> {
  const result: FileUploadResult = {
    success: false,
    files: [],
    errors: [],
  };

  const uploadPromises = files.map(async (file) => {
    try {
      // Validate file type
      if (!isFileTypeSupported(file.type)) {
        throw new FileValidationError(
          `Unsupported file type: ${file.type}. Supported types are: PNG, JPG, GIF, SVG`
        );
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new FileValidationError(
          `File size exceeds 10MB limit: ${(file.size / (1024 * 1024)).toFixed(
            1
          )}MB`
        );
      }

      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);

      // TODO: Replace this with actual file upload logic
      // For now, we'll simulate an upload with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const uploadedFile: UploadedFile = {
        id: Math.floor(Math.random() * 1000000),
        image: previewUrl,
        type: SUPPORTED_FILE_TYPES[file.type as SupportedMimeType],
        orientation: "landscape", // You might want to detect this from the actual image
      };

      result.files.push(uploadedFile);
    } catch (error) {
      result.errors.push({
        fileName: file.name,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });

  await Promise.all(uploadPromises);
  result.success = result.files.length > 0;

  return result;
}

function isFileTypeSupported(mimeType: string): mimeType is SupportedMimeType {
  return mimeType in SUPPORTED_FILE_TYPES;
}

export function revokeObjectURLs(files: UploadedFile[]) {
  files.forEach((file) => {
    if (file.image.startsWith("blob:")) {
      URL.revokeObjectURL(file.image);
    }
  });
}

export async function convertBlobUrlToDataUrl(
  blobUrl: string
): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting blob URL to data URL:", error);
    return blobUrl; // Fallback to original URL if conversion fails
  }
}
