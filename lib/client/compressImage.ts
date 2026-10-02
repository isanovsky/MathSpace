'use client';

// Resizes + re-encodes an image client-side until it fits under maxBytes.
// Only touches the file if it's actually over the limit — an already-small
// photo is left untouched to avoid needless quality loss.
export async function compressImageToLimit(file: File, maxBytes: number): Promise<File> {
  if (file.size <= maxBytes) return file;

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;

  const MAX_DIMENSION = 1600;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  let quality = 0.8;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak didukung di browser ini.');
    ctx.drawImage(bitmap, 0, 0, width, height);

    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (blob && blob.size <= maxBytes) break;

    if (quality > 0.4) {
      quality -= 0.15;
    } else {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }
  }

  if (!blob) throw new Error('Gagal mengompres gambar.');
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}
