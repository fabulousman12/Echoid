import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useHistory } from 'react-router';
import google from '../pages/google.png';
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #141E30, #243B55)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
  },
  header: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
top: 0,
    left: 0,    
    
    gap: 12,
    zIndex:200,
    marginBottom: 20,
    color: '#fff',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: '50%',
  },
  titleText: {
    fontSize: 15,
    fontWeight: 600,
  },
  form: {
    width: '90%',
    maxWidth: 360,
    marginTop: 100,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 17,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#eee',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: 13,
    borderRadius: 8,
    border: 'none',
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '14px 20px',
    fontSize: 16,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  previewContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profilePreview: {
    width: 150,
    height: 150,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #fff',
  },
  cropperOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropperWrapper: {
    width: '90vw',
    height: '70vh',
  },
  cropperControls: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
  },
  cropButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    padding: '12px 20px',
    fontWeight: 600,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    zIndex: 999,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '12px 20px',
    fontWeight: 600,
    borderRadius: 8,
    border: 'none',
    zIndex: 999,
    cursor: 'pointer',
  },
  socialRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 15px',
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  googleButton: {
    backgroundColor: '#fff',
    color: '#444',
    border: '1px solid #ddd',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    color: '#fff',
    border: 'none',
  },
  socialIcon: {
    marginRight: 10,
    height: 20,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '10px 0',
    color: '#ccc',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    opacity: 0.3,
  },
  dividerText: {
    padding: '0 10px',
    fontSize: 14,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#ccc',
  },
  loginLink: {
    color: '#4CAF50',
    marginLeft: 5,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

const UserInformationStep = ({ onNext }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
const history = useHistory();
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropDone = async () => {
    const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
    setProfileImage(croppedImg);
    setShowCropper(false);
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
        reader.onloadend = () => resolve(reader.result);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profileImage) return alert('Please crop and select a profile image.');
    const userInfo = { name, email, phone, password, profileImage };
    onNext(userInfo);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png"
          alt="App Logo"
          style={styles.logo}
        />
        <span style={styles.titleText}>Sign up to ChatVerse</span>
      </div>

    

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Social Logins */}  {profileImage && (
        <div style={styles.previewContainer}>
        <img src={profileImage} alt="Profile" style={styles.profilePreview} />
      </div>
    )}
        <div style={styles.socialRow}>
          <button type="button" style={{ ...styles.socialButton, ...styles.googleButton }}>
          <img
  src={google}
  alt="Google"
  style={styles.socialIcon}
/>

            Google
          </button>
          <button type="button" style={{ ...styles.socialButton, ...styles.facebookButton }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Facebook"
              style={styles.socialIcon}
            />
            Facebook
          </button>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Inputs */}
        <div>
          <label style={styles.label}>Name</label>
          <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label style={styles.label}>Phone</label>
          <input style={styles.input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label style={styles.label}>Profile Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <button type="submit" style={styles.button}>Next</button>

        <div style={styles.loginText}>
          Already have an account?
          <span style={styles.loginLink} onClick={() => history.push('/login')}>Log in</span>
        </div>
      </form>

      {showCropper && (
        <div style={styles.cropperOverlay}>
          <div style={styles.cropperWrapper}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div style={styles.cropperControls}>
            <button onClick={handleCropDone} style={styles.cropButton}>Crop</button>
            <button onClick={() => setShowCropper(false)} style={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInformationStep;
