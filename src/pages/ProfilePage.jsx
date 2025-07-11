import React, { useState, useEffect,useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonLabel,
  IonImg,
  IonSpinner,
  IonIcon,
  IonRow,
  IonCol,
  IonText,
  IonLoading,

} from '@ionic/react';
import { IonButton,IonButtons,IonItem } from '@ionic/react';
import StarLoader from './StarLoader';
import './ProfilePage.css';
import { cameraOutline, closeCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import Cropper from 'react-easy-crop';
const ProfilePage = ({ host }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Store original values to revert changes on cancel
  const [originalName, setOriginalName] = useState('');
  const [originalAbout, setOriginalAbout] = useState('');
  const [originalPhoto, setOriginalPhoto] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const history = useHistory();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  
  useEffect(() => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem('currentuser'));
    if (user) {
      setCurrentUser(user);
      setName(user.name || '');
      setAbout(user.About || '');
      setProfilePhoto(user.profilePhoto || '');

      setOriginalName(user.name || '');
      setOriginalAbout(user.About || '');
      setOriginalPhoto(user.profilePhoto || '');
      setGender(user.gender || '');
      setDob(user.dob || '');
      setLocation(user.location || '');
    }
  
      setLoading(false);
  
   
  }, []);

  const toggleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setName(originalName);
    setAbout(originalAbout);
    setProfilePhoto(originalPhoto);
    setIsEditing(false);
  };

  const handleNameChange = (e) => setName(e.target.value);
  const handleAboutChange = (e) => setAbout(e.target.value);
  const handleGenderChange = (e) => setGender(e.target.value);
  const handleDobChange = (e) => setDob(e.target.value);
  const handleLocationChange = (e) => setLocation(e.target.value);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
       // setProfilePhoto(reader.result); // Set the base64 string of the image
        // Set the src to show it in ReactCrop
        setImageSrc(reader.result); // 
      };
      reader.readAsDataURL(file);
    }

  };



  // Handle image load to start cropping
  const saveChanges = async () => {
    setLoading(true);
    const updatedUser = {
      ...currentUser,
      name,
      About: about,
      profilePhoto,
      gender,
      dob,
      location
    };


const updatedFields = { email: currentUser.email }; // Always send email for identification

if (name !== originalName) updatedFields.name = name;
if (about !== originalAbout) updatedFields.About = about;
if (gender !== currentUser.gender) updatedFields.gender = gender;
if (dob !== currentUser.dob) updatedFields.dob = dob;
if (location !== currentUser.location) updatedFields.location = location;

const stripBase64 = (data) => data?.replace(/^data:image\/\w+;base64,/, '');
if (
  stripBase64(profilePhoto) !== stripBase64(originalPhoto) &&
  profilePhoto.startsWith('data:image')
) {
  updatedFields.profilePhoto = profilePhoto; // base64 string
}


  // For identification
    try {
      const response = await fetch(`${host}/user/edituser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Auth': localStorage.getItem('token'),
        },
        body: JSON.stringify(updatedFields),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Update failed');
      }

      // If backend confirms, save to local storage and state
      localStorage.setItem('currentuser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditing(false);
      setLoading(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
      setErrorModalVisible(true);
      setLoading(false);
    }
  };


  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cancelCrop = () => {
    setImageSrc(null); // Discard cropper
  };
  
  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
  
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result); // base64 string
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    });
  };
  
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  
  const cropAndSave = async () => {
    const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
    setProfilePhoto(croppedImg);
    setImageSrc(null); // Close cropper
  };

  const handleLogout = () => {
    localStorage.removeItem('currentuser');
    localStorage.removeItem('token');
    setCurrentUser(null);
   
    history.push('/login');
  };
  

  if (loading) {
    return (
      <div style={{ textAlign: 'center',display: 'flex', justifyContent: 'center', alignItems: 'center',position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',background: 'linear-gradient(135deg, #141E30, #243B55)',height: '100vh',width:'100%',overflowY: 'auto' }}>
      <StarLoader />
   
    </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #141E30, #243B55)', height: '100vh', display: 'flex',
      flexDirection: 'column',overflowY: 'auto' }}>
      {!isFullScreen && !imageSrc && (
      <header className="profile-header">
      <div className="toolbar">
        <div className="left">
          {isEditing ? (
            <button onClick={handleCancelEdit}>Cancel</button>
          ) : (
            <button onClick={() => history.goBack()}>&lt; Back</button>
          )}
        </div>
    
        <h1 className="profile-title">My Profile</h1>
    
        <div className="right">
          {isEditing ? (
            <button className="success" onClick={saveChanges}>Save</button>
          ) : (
            <button className="primary" onClick={toggleEdit}>Edit</button>
          )}
        </div>
      </div>
    </header>
    
      )}

      <main className="profile-content" style={{ padding: '1rem' }}>
        {isFullScreen && (
          <div className="fullscreen-overlay" onClick={() => setIsFullScreen(false)}>
            <button
              className="fullscreen-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreen(false);
              }}
            >
              &times;
            </button>
            <img
              src={profilePhoto}
              className="fullscreen-image"
              alt="Full View"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <div className="avatar-container">
          <img
            src={profilePhoto || 'https://via.placeholder.com/150'}
            className="profile-avatar"
            onClick={() => setIsFullScreen(true)}
            style={{ cursor: 'pointer', aspectRatio: '4 / 3' }}
          />
          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                id="photo-upload"
                hidden
                onChange={handleProfilePhotoChange}
              />
              <button className="change-photo-btn" onClick={() => document.getElementById('photo-upload').click()}>
                📷 Change Photo
              </button>
            </>
          )}
        </div>

        <div className="info-section">
          <div className="info-item">
            <label>Name</label>
            {isEditing ? (
              <input value={name} onChange={handleNameChange} className="input-styled" />
            ) : (
              <p>{name}</p>
            )}
          </div>

          <div className="info-item">
            <label>About</label>
            {isEditing ? (
              <textarea value={about} onChange={handleAboutChange} className="input-styled" />
            ) : (
              <p>{about || 'No about info'}</p>
            )}
          </div>
          <div className="info-row">
  <div className="info-item half">
    <label>Email</label>
    <p>{currentUser?.email}</p>
  </div>
  <div className="info-item half">
    <label>Phone Number</label>
    <p>{currentUser?.phoneNumber}</p>
  </div>
</div>

        </div>
      </main>
      <div className="secondary-info">
  <div className="info-item third">
    <label>Gender</label>
    {isEditing ? (
      <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-styled">
        <option value="">Select</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
       
      </select>
    ) : (
      <p>{gender || 'Not specified'}</p>
    )}
  </div>

  <div className="info-item third">
    <label>Date of Birth</label>
    {isEditing ? (
      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input-styled" />
    ) : (
      <p>{dob || 'Not specified'}</p>
    )}
  </div>

  <div className="info-item third">
    <label>Location</label>
    {isEditing ? (
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-styled" />
    ) : (
      <p>{location || 'Not specified'}</p>
    )}
  </div>
</div>


    {errorModalVisible && (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(4px)',
    }}
  >
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <div style={{ fontSize: '3rem', color: '#f44336' }}>❌</div>
      <h2 style={{ marginTop: '10px', color: '#333' }}>Oops!</h2>
      <p style={{ color: '#666', margin: '15px 0' }}>{errorMessage}</p>
      <button
        onClick={() => setErrorModalVisible(false)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#d32f2f')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#f44336')}
      >
        Close
      </button>
    </div>
  </div>
)}


      {imageSrc && (
        <div className="cropper-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="cropper-controls">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
            />
            <div className="cropper-buttons">
              <button onClick={cropAndSave}>Crop & Save</button>
              <button onClick={cancelCrop}>Cancel</button>
            </div>
          </div>
        </div>
      )}
       <div className="logout-wrapper">
    <button className="logout-btn" onClick={handleLogout}>
      🚪 Logout
    </button>
  </div>
    </div>
  );
};

export default ProfilePage;