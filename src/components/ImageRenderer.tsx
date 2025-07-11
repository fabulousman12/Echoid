import React, { useEffect, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import imga from '../../public/favicon.png';

interface Props {
  src: string;
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

const ImageRenderer: React.FC<Props> = ({
  src,
  style,
  className,
  alt = 'Preview',
  onClick,
}) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let retries = 0;
    let stopped = false;

    const resolvePath = async () => {
      setLoading(true);
      console.log('Resolving native path to webview-safe URI:', src);

      while (!stopped && retries < MAX_RETRIES) {
        try {
          const nativePath = src.startsWith('file://') ? src : `file://${src}`;

          const webviewUrl = Capacitor.convertFileSrc(nativePath);

          // Try fetching to ensure it's available
          const response = await fetch(webviewUrl, { method: 'GET' });

          if (response.ok) {
            setUri(webviewUrl);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error(`Attempt ${retries + 1} failed:`, error);
        }

        retries++;
        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      }

      // Fallback image after retries
      setUri(imga);
      setLoading(false);
    };

    resolvePath();

    return () => {
      stopped = true;
    };
  }, [src]);

  if (loading) return <IonSpinner name="dots" />;

  if (!uri) return <div>Failed to load image</div>;

  return (
    <img
      src={uri}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
    />
  );
};

export default ImageRenderer;
