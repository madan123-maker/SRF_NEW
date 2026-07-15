export interface StorageProvider {
  upload(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    bucket: string,
    pathPrefix?: string
  ): Promise<{ storageKey: string; etag?: string }>;

  download(storageKey: string, bucket: string): Promise<Buffer>;

  delete(storageKey: string, bucket: string): Promise<void>;

  generateSignedUrl(storageKey: string, bucket: string, expiresInSeconds?: number): Promise<string>;
}
