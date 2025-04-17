// Function to apply dithering effect to a canvas context containing an image
function ditherImageOnCanvas(ctx, width, height) {
    // Get the pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    // Reference to the pixel data array (RGBA values)
    const data = imageData.data;
  
    // Loop through each row of pixels
    for (let y = 0; y < height; y++) {
      // Loop through each column of pixels
      for (let x = 0; x < width; x++) {
        // Calculate the index in the data array for the current pixel
        const idx = (y * width + x) * 4;
        // Convert the current pixel to grayscale using luminance formula
        const oldPixel = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        // Determine the new pixel value: 0 (black) or 255 (white) based on threshold
        const newPixel = oldPixel < 128 ? 0 : 255;
        // Calculate the quantization error
        const error = oldPixel - newPixel;
        // Set the current pixel to the new dithered value (grayscale)
        data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
  
        // Function to distribute the error to neighboring pixels
        function distribute(dx, dy, factor) {
          // Calculate neighbor's x and y coordinates
          const nx = x + dx, ny = y + dy;
          // Check if neighbor is within image bounds
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            // Calculate the index for the neighbor pixel
            const nidx = (ny * width + nx) * 4;
            // Add a portion of the error to the neighbor's grayscale value
            let n = data[nidx] * 0.299 + data[nidx + 1] * 0.587 + data[nidx + 2] * 0.114 + error * factor;
            // Clamp the value between 0 and 255
            n = Math.max(0, Math.min(255, n));
            // Set the neighbor pixel to the new value (grayscale)
            data[nidx] = data[nidx + 1] = data[nidx + 2] = n;
          }
        }
        // Distribute error to the right neighbor
        distribute(1, 0, 7 / 16);
        // Distribute error to the bottom-left neighbor
        distribute(-1, 1, 3 / 16);
        // Distribute error to the bottom neighbor
        distribute(0, 1, 5 / 16);
        // Distribute error to the bottom-right neighbor
        distribute(1, 1, 1 / 16);
      }
    }
  
    // Write the modified pixel data back to the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  
  // Legacy: Dither an <img> in-place (for static images)
  function ditherImage(img) {
    // Create a canvas element dynamically
    const canvas = document.createElement('canvas');
    // Get the 2D drawing context from the canvas
    const ctx = canvas.getContext('2d');
    // Set canvas width to the image's natural width
    canvas.width = img.naturalWidth;
    // Set canvas height to the image's natural height
    canvas.height = img.naturalHeight;
    // Draw the image onto the canvas at position (0, 0)
    ctx.drawImage(img, 0, 0);
    // Dither the canvas
    ditherImageOnCanvas(ctx, canvas.width, canvas.height);
    // Replace the original image's source with the dithered version from the canvas
    img.src = canvas.toDataURL();
  }
  
  // Expose ditherImageOnCanvas globally for webcam use
  window.ditherImageOnCanvas = ditherImageOnCanvas;
  window.ditherImage = ditherImage;
  
  // Wait for the DOM content and images to load
  window.addEventListener('DOMContentLoaded', () => {
    // Select all images with the class 'dither-me'
    document.querySelectorAll('img.dither-me').forEach(img => {
      // If the image is already loaded, dither it immediately
      if (img.complete) {
        ditherImage(img);
      } else {
        // Otherwise, wait for the image to load before dithering
        img.addEventListener('load', () => ditherImage(img));
      }
    });
  });
  
