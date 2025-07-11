// pages/Status.jsx
import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import StatusCard from '../components/StatusCard';
import { ffmpeg_thumnail } from 'ionic-thumbnail'; // adjust path as needed
import './Status.css';

const Status = () => {
  useEffect(() => {
    // You can integrate AdMob logic here

    console.log("AdMob initialized");
  }, []);

  const normalStatuses = [
  ];

  const adStatuses = [
    { id: 101, avatar: 'https://via.placeholder.com/50/ffcc00', name: 'Sponsored Ad', timestamp: 'Just now' },
  ];

  return (
    <IonPage>
      <IonContent>
        <h2 className="status-title">Status</h2>
        <div className="status-list">
          {normalStatuses.map(status => (
            <StatusCard key={status.id} {...status} type="normal" />
          ))}

          {adStatuses.map(ad => (
            <StatusCard key={ad.id} {...ad} type="ad" />
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Status;
