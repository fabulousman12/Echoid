// getCroppedImg.js (helper function)
export default function getCroppedImg(imageSrc, croppedAreaPixels) {
    const image = new Image();
    image.src = imageSrc;
  
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const { x, y, width, height } = croppedAreaPixels;
  
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob); // resolve with the Blob data
        }, 'image/jpeg');
      };
  
      image.onerror = (err) => {
        reject(err);
      };
    });
  }
  