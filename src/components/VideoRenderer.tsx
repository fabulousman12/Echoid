import React, { useEffect, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import { filereder } from 'filereder';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ffmpeg_thumnail } from 'ionic-thumbnail';
import imga from '../../public/favicon.png'
interface Props {s
  src: string;
  style?: React.CSSProperties;
  Name: string;
  Size: number;
  onClick?: () => void;
}

const VideoRenderer: React.FC<Props> = ({
  src,
  style,
  Name,
  Size,
  onClick,
}) => {
  const [uri, setUri] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolvePath = async () => {
      try {
      
        setLoading(true);
        const result = await filereder.renderFile({ path: src });
        //console.log('Render result (video):', result);
        if (result.success && result.pathto) {
          setUri(result.pathto);
       //    const thumbnail =   await  captureThumbnail(result.pathto);
         //  //console.log('Thumbnail captured:', thumbnail);
      const nativenail = await captureThumbnail2(src, Name, Size);
          if (nativenail) {
            setPoster(nativenail);
            //console.log('Thumbnail captured:', nativenail);
            setLoading(false);
          } else {
            console.error('Failed to capture thumbnail');
            setPoster(imga);
            setLoading(false);
          }
          setLoading(false);
        } else {
          setPoster(imga);
          console.error('Render failed (video):', result);
          setLoading(false);
        }
      } catch (e) {
        console.error('Render error (video):', e);
setPoster(imga);

        setLoading(false);
      }
    };

    resolvePath();
  }, [src]);



 const captureThumbnail = async (Src: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = Src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setPoster(imageUrl);
        setLoading(false);
        resolve(imageUrl);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    video.onerror = () => {
      console.error('Failed to load video for thumbnail', video.error);
      reject(video.error || new Error('Unknown video error'));
    };
  });
};

 const captureThumbnail2 = async (
  nativePath: string,
  fileName: string,
  fileSize: number
): Promise<string | null> => {
  try {
    const folder = 'thumbnails';
    const thumbnailFileName = `${fileName}_${fileSize}_thumb.jpg`;
    const fullPath = `${folder}/${thumbnailFileName}`;

    // Step 1: Try reading existing thumbnail
    try {


      const existing = await Filesystem.readFile({
        path: fullPath,
        directory: Directory.Cache,
      });

      //console.log('Existing thumbnail found:', existing);
      return `data:image/jpeg;base64,${existing.data}`;
    } catch {
      //console.log('Thumbnail not found, generating new one...');
    }

    // Step 2: Generate thumbnail using custom plugin
    const result = await ffmpeg_thumnail.generateThumbnail({ path: nativePath });
    const base64Thumbnail = result.data;

    if (!base64Thumbnail) {
      throw new Error('No thumbnail data returned by plugin.');
    }

    // Step 3: Save the thumbnail to cache
    await Filesystem.writeFile({
      path: fullPath,
      data: base64Thumbnail,
      directory: Directory.Cache,
      recursive: true,
    });

    // Step 4: Return the base64 data URL
    return `data:image/jpeg;base64,${base64Thumbnail}`;
  } catch (error) {
    console.error('Failed to capture thumbnail:', error);
    return null;
  }
};





  if (loading) {
    return <IonSpinner name="dots" />;
  }

  if (!poster) {
    return <div>Failed to load video thumbnail</div>;
  }

  return (
    <img
      src={poster}
      alt="Video thumbnail"
      onClick={onClick}
      style={{
        ...style,
      }}
    />
  );
};

export default VideoRenderer;
