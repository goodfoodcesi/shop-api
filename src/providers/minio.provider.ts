import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

// Buckets
export const MINIO_BUCKETS = {
  SHOPS: 'shops',
  SHOP_DOCUMENTS: 'shop-documents',
  AVATARS: 'avatars',
  USER_DOCUMENTS: 'user-documents',
} as const;

// Initialiser les buckets au démarrage
export async function initMinIO() {
  const buckets = Object.values(MINIO_BUCKETS);
  
  for (const bucket of buckets) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`✅ Bucket "${bucket}" créé`);
    }
  }
  
  console.log('✅ MinIO initialisé');
}

// Helper pour uploader un fichier
export async function uploadFile(
  bucket: string,
  key: string,
  file: Buffer,
  options?: {
    size?: number;
    metadata?: Record<string, string>;
  }
): Promise<string> {
  await minioClient.putObject(
    bucket,
    key,
    file,
    options?.size,
    options?.metadata
  );

  return `${process.env.MINIO_PUBLIC_URL || "http://localhost:9000"}/${bucket}/${key}`;
}

// Helper pour supprimer un fichier
export async function deleteFile(bucket: string, key: string): Promise<void> {
  await minioClient.removeObject(bucket, key);
}

// Helper pour obtenir une URL signée (temporaire)
export async function getSignedUrl(
  bucket: string,
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(bucket, key, expirySeconds);
}