/**
 * Image processing utilities for mobile & desktop upload:
 * - Pre-compression validation (< 10 MB, image MIME type)
 * - Canvas resize to max 1000px (main) and 400px (thumb)
 * - WebP 0.8 with JPEG fallback
 */

export interface ProcessedImages {
  mainBlob: Blob;
  thumbBlob: Blob;
}

export async function processProductImage(file: File): Promise<ProcessedImages> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
  }

  // Validate size before compression: max 10 MB
  const maxInitialBytes = 10 * 1024 * 1024;
  if (file.size > maxInitialBytes) {
    throw new Error("L'image est trop volumineuse (maximum 10 Mo avant compression).");
  }

  const bitmap = await createImageBitmap(file);

  const mainBlob = await resizeImageToBlob(bitmap, 1000, 0.8);
  const thumbBlob = await resizeImageToBlob(bitmap, 400, 0.8);

  return { mainBlob, thumbBlob };
}

async function resizeImageToBlob(
  source: ImageBitmap,
  maxDimension: number,
  quality: number
): Promise<Blob> {
  let { width, height } = source;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible de préparer le canvas de compression.');
  }

  // Smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  // Attempt WebP first, fallback to JPEG
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to JPEG if WebP is unsupported
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Erreur lors de la compression de l’image.'));
            },
            'image/jpeg',
            quality
          );
        }
      },
      'image/webp',
      quality
    );
  });
}
