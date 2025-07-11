// CropperComponent.js
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImageUtil'; // Helper to crop image blob

const CropperComponent = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onCropComplete(croppedImage);
  }, [image, onCropComplete]);

  return (
    <div className="crop-container">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1} // 4:4 = 1:1 aspect ratio
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
      />
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default CropperComponent;
