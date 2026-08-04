export function compressImage(
  input: File | string,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    let src: string;
    if (typeof input === 'string') {
      src = input;
    } else {
      src = URL.createObjectURL(input);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        if (typeof input !== 'string') {
          URL.revokeObjectURL(src);
        }
        resolve(compressedDataUrl);
      } else {
        resolve(typeof input === 'string' ? input : src);
      }
    };

    img.onerror = () => {
      resolve(typeof input === 'string' ? input : src);
    };

    img.src = src;
  });
}
