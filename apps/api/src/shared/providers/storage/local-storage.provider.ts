import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { StorageProvider } from './storage.provider';

export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'uploads');
    // Ensure base directory exists on initialization
    fs.mkdir(this.basePath, { recursive: true }).catch(console.error);
  }

  async upload(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    bucket: string,
    pathPrefix?: string
  ): Promise<{ storageKey: string; etag?: string }> {
    const bucketPath = path.join(this.basePath, bucket);
    await fs.mkdir(bucketPath, { recursive: true });

    const prefix = pathPrefix ? pathPrefix.replace(/^\/+|\/+$/g, '') : '';
    const uniqueId = crypto.randomUUID();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const relativeKey = prefix 
      ? path.join(prefix, `${uniqueId}-${safeName}`)
      : `${uniqueId}-${safeName}`;
      
    const absoluteFilePath = path.join(bucketPath, relativeKey);

    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await fs.writeFile(absoluteFilePath, fileBuffer);

    // Create a simple etag (md5 of buffer)
    const etag = crypto.createHash('md5').update(fileBuffer).digest('hex');

    return { storageKey: relativeKey, etag };
  }

  async download(storageKey: string, bucket: string): Promise<Buffer> {
    const absoluteFilePath = path.join(this.basePath, bucket, storageKey);
    return fs.readFile(absoluteFilePath);
  }

  async delete(storageKey: string, bucket: string): Promise<void> {
    const absoluteFilePath = path.join(this.basePath, bucket, storageKey);
    try {
      await fs.unlink(absoluteFilePath);
    } catch (error: unknown) {
      if (error instanceof Error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async generateSignedUrl(storageKey: string, bucket: string): Promise<string> {
    // For local dev, return a direct path that an API endpoint can resolve.
    // In AWS, this would be an S3 pre-signed URL.
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    return `${apiUrl}/api/v1/files/${bucket}/${encodeURIComponent(storageKey)}`;
  }
}
