/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Produces a high-quality, lightweight Base64 JPEG data URL (~80-160KB).
 * This ensures uploaded images are permanently stored in database documents
 * without relying on ephemeral server disks.
 */
export async function compressImageToBase64(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  if (!file) throw new Error('No file provided');
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WEBP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(readerEvent.target.result);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}
