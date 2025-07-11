import React, { useEffect, useState } from 'react';
import Plyr from "plyr-react";
import { IonSpinner } from '@ionic/react';
import { filereder } from 'filereder';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ffmpeg_thumnail } from 'ionic-thumbnail';
import imga from '../../public/favicon.png';
interface Props {
  src: string;       // Local file path (e.g. storage path)
  onClose: () => void;
  controls?: boolean;
  Name: string;
  Size: number;
  style?: React.CSSProperties;
}

const VideoPlayerPlyrWithResolve: React.FC<Props> = ({ src, onClose, controls = true, style ,Name, Size}) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
const [poster, setPoster] = useState<string | null>(imga); // Default poster image
  useEffect(() => {
    const resolvePath = async () => {
      try {
        const result = await filereder.renderFile({ path: src });
        //console.log('Resolved video URL:', result);
        if (result.success && result.pathto) {
          setUri(result.pathto);
          // Capture thumbnail using the custom plugin
          const thumbnail = await captureThumbnail2(src, Name, Size);
          if (thumbnail) {
            setPoster(thumbnail);
            //console.log('Thumbnail captured:', thumbnail);
          } else {
            setPoster(imga); // Fallback to default image if thumbnail capture fails
            
            console.error('Failed to capture thumbnail');
          }
        } else {
          console.error('Failed to resolve video path:', result);
          setPoster(imga);
          setUri(null);
        }
      } catch (e) {
        console.error('Error resolving video path:', e);
        setPoster(imga);
        setUri(null);
      } finally {
        setLoading(false);
      }
    };

    resolvePath();
  }, [src]);


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

  if (!uri) {
    return <div style={{ color: 'white', textAlign: 'center' }}>Failed to load video</div>;
  }

  return (
   
      <Plyr
        source={{
          type: 'video',
          sources: [{ src: uri }],
          poster: poster || imga, // Use the captured thumbnail or default image
        }}
        poster={poster || imga} // Use the captured thumbnail or default image
        options={{
          controls: controls ? ['play', 'progress', 'current-time', 'fullscreen'] : [],
        }}
      />
  );
};

export default VideoPlayerPlyrWithResolve;
