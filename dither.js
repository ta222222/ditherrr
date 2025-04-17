function ditherImageOnCanvas(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const oldPixel = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        const newPixel = oldPixel < 128 ? 0 : 255;
        const error = oldPixel - newPixel;
        data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
  
        function distribute(dx, dy, factor) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = (ny * width + nx) * 4;
            let n = data[nidx] * 0.299 + data[nidx + 1] * 0.587 + data[nidx + 2] * 0.114 + error * factor;
            n = Math.max(0, Math.min(255, n));
            data[nidx] = data[nidx + 1] = data[nidx + 2] = n;
          }
        }
        distribute(1, 0, 7 / 16);
        distribute(-1, 1, 3 / 16);
        distribute(0, 1, 5 / 16);
        distribute(1, 1, 1 / 16);
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
  }
  
  function ditherImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    ditherImageOnCanvas(ctx, canvas.width, canvas.height);
    img.src = canvas.toDataURL();
  }
  
  window.ditherImageOnCanvas = ditherImageOnCanvas;
  window.ditherImage = ditherImage;
  
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img.dither-me').forEach(img => {
      if (img.complete) {
        ditherImage(img);
      } else {
        img.addEventListener('load', () => ditherImage(img));
      }
    });
  });



  
