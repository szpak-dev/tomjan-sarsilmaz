import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
});

export function getCloudinaryUrl(publicId: string, options?: Record<string, any>): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
}
