
export interface ProcessOptions {
  removeBackground: boolean;
  targetSize: number;
}

export const processImageToSprite = async (
  sourceUrl: string,
  options: ProcessOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = options.targetSize;
      canvas.height = options.targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Disable smoothing for sharp pixel downscaling (Nearest Neighbor)
      ctx.imageSmoothingEnabled = false;
      
      // Step 1: Draw high-res to low-res
      ctx.drawImage(img, 0, 0, options.targetSize, options.targetSize);

      // Step 2: Optional background removal
      if (options.removeBackground) {
        const imageData = ctx.getImageData(0, 0, options.targetSize, options.targetSize);
        const data = imageData.data;

        // Sample top-left pixel as the background color
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];
        const bgA = data[3];

        // Simple chroma keying with a small tolerance
        const tolerance = 40; 

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          const diff = Math.sqrt(
            Math.pow(r - bgR, 2) + 
            Math.pow(g - bgG, 2) + 
            Math.pow(b - bgB, 2)
          );

          if (diff < tolerance) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load source image"));
    img.src = sourceUrl;
  });
};

export const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
