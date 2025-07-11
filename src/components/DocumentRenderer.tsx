import React, { useEffect, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import { filereder } from 'filereder';
import { Document, Page } from 'react-pdf';
interface Props {
  data: string; // file path
  style?: React.CSSProperties;
  className?: string;
  type?: string;
}

const DocumentRenderer: React.FC<Props> = ({
  data,
  style,
  className,
  type ,
}) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolvePath = async () => {
      try {
        const result = await filereder.renderFile({ path: data });
        console.log('Render result (doc):', result);
        if (result.success && result.pathto) {
          setUri(result.pathto);
        }
      } catch (e) {
        console.error('Render error (doc):', e);
      } finally {
        setLoading(false);
      }
    };

    resolvePath();
  }, [data]);

  if (loading) return <IonSpinner name="dots" />;

  if (!uri) return <div>Failed to load document</div>;

  const fileType = type ;

if (fileType === 'pdf') {
    return (
      <div className={className} style={{ width: '100%', height: '600px', overflow: 'auto', ...style }}>
        <Document file={uri} loading={<IonSpinner name="dots" />}>
          <Page pageNumber={1} width={600 /* or adjust width here */} />
        </Document>
      </div>
    );
  }

  if (fileType === 'txt') {
    return (
      <iframe
        src={uri}
        className={className}
        style={{ width: '100%', height: '400px', ...style }}
        title="Text Preview"
      />
    );
  }

  return (
    <div className={className} style={style}>
      <p>
        Preview not supported.{' '}
        <a href={uri} download target="_blank" rel="noopener noreferrer">
          Click here to download
        </a>
        .
      </p>
    </div>
  );
};

export default DocumentRenderer;
