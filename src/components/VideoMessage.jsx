import React, { useEffect } from 'react';
import { IonIcon, IonSpinner, IonButton } from '@ionic/react';
import { playCircleOutline, downloadOutline } from 'ionicons/icons';
import VideoRenderer from './VideoRenderer';

const VideoMessage = ({
  msg,
  user,
  userdetails,
  isDownloading,
  loadingMessages,
  handleResend,
  handleVideoClick,
  handleFileDownload
}) => {
  const isSender = msg.sender === user._id;
  const isReceiver = msg.sender === userdetails.id;
useEffect(() => {
   console.log('VideoMessage component mounted or updated',msg, user, userdetails, isDownloading, loadingMessages);
}, []);
  return (
    <div
      className="video-container"
      style={{
        width: '200px',
        height: '200px',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: isSender
          ? 'linear-gradient(135deg, #13e247, #3bb9ff)'
          : 'linear-gradient(135deg, #ff8c00, #1722B9)',
        padding: '5px',
        boxShadow: '0 1px 3px rgba(59, 185, 243, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isSender ? (
        <>
          {msg.isError === 1 ? (
            isDownloading[msg.id] ? (
              <IonSpinner name="crescent" color="primary" />
            ) : (
              <button
                onClick={() => handleResend(msg)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            )
          ) : (
            <>
              <VideoRenderer
                src={msg.file_path}
                muted
                Name={msg.file_name}
                Size={msg.file_size}
                playsInline
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: 8,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  padding: '10px',
                }}
              >
                {loadingMessages[msg.id] ? (
                  <IonSpinner style={{ color: 'white', fontSize: 40 }} />
                ) : (
                  <IonIcon
                    icon={playCircleOutline}
                    style={{ color: 'white', fontSize: 40 }}
                    onClick={() => handleVideoClick(msg)}
                  />
                )}
              </div>
            </>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {msg.isSent === 0 && msg.isError === 1 ? (
              isDownloading[msg.id] ? (
                <IonSpinner name="dots" style={{ fontSize: '1.5rem', color: 'gray' }} />
              ) : (
                <>
                  <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.2rem', color: 'red' }}></i>
                  <button
                    onClick={() => handleResend(msg)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Retry
                  </button>
                </>
              )
            ) : msg.isSent === 0 && msg.isError === 0 ? (
              <i className="bi bi-wifi-off" style={{ fontSize: '1.2rem', color: 'gray' }}></i>
            ) : msg.isSent === 1 ? (
              <>
                {msg.status === 'pending' && <i className="bi bi-watch" style={{ fontSize: '1.2rem' }}></i>}
                {msg.status === 'sent' && msg.read === 0 && <i className="bi bi-check" style={{ fontSize: '1.2rem' }}></i>}
                {msg.status === 'sent' && msg.read === 1 && <i className="bi bi-eye" style={{ fontSize: '1.2rem' }}></i>}
              </>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {isReceiver && msg.isDownload === 0 ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={msg.thumbnail || 'https://via.placeholder.com/200'}
                alt="Video Thumbnail"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  padding: '10px',
                }}
              >
                {msg.isError === 1 ? (
                  isDownloading[msg.id] ? (
                    <IonSpinner name="crescent" color="primary" />
                  ) : (
                    <button
                      onClick={() => handleFileDownload(msg)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                  )
                ) : (
                  <IonButton
                    fill="clear"
                    onClick={() => handleFileDownload(msg)}
                    disabled={isDownloading[msg.id]}
                  >
                    {isDownloading[msg.id] ? <IonSpinner /> : <IonIcon icon={downloadOutline} />}
                  </IonButton>
                )}
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <VideoRenderer
                src={msg.file_path}
                Name={msg.file_name}
                Size={msg.file_size}
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: 8,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  padding: '10px',
                }}
              >
                {loadingMessages[msg.id] ? (
                  <IonSpinner style={{ color: 'white', fontSize: 40 }} />
                ) : (
                  <IonIcon
                    icon={playCircleOutline}
                    style={{ color: 'white', fontSize: 40 }}
                    onClick={() => handleVideoClick(msg)}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoMessage;


/*  <VideoMessage
    msg={msg}
    user={user}
    userdetails={userdetails}
    isDownloading={isDownloading}
    loadingMessages={loadingMessages}
    handleResend={handleResend}
    handleVideoClick={handleVideoClick}
    handleFileDownload={handleFileDownload}
  /> */