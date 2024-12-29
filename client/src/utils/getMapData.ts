export const getMapData = (imagePath: string): Promise<number[][]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imagePath;

    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // if (!ctx) {
      //   reject(new Error('Failed to get canvas context'));
      //   return;
      // }

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Convert pixel data to 2D array
      const mapData: number[][] = [];

      for (let y = 0; y < canvas.height; y++) {
        const row: number[] = [];
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          // You can customize this part based on how you want to map colors to components
          // This example uses the red channel value
          const value = pixels[index];
          row.push(value);
        }
        mapData.push(row);
      }

      resolve(mapData);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};
