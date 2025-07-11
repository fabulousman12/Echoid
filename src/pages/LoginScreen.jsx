import React, { useState, useEffect, useContext } from 'react';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonText,
  IonAlert,
} from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { useHistory, useLocation } from 'react-router-dom';
import { LoginContext } from '../Contexts/UserContext';
import { MessageContext } from '../Contexts/MessagesContext';
import google from './google.png'
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import StarLoader from '../pages/StarLoader';
import Maindata from '../data';
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
    padding: '0px',
  },
  header: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
top: 10,
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
    fontSize: 20,
    fontWeight: 600,
    marginLeft: 30,
  },
  form: {
    width: '90%',
    maxWidth: 360,
    marginTop: '50%',
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
    marginTop: 20,
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
  socialRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  alert: {
    color: '#fff',
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
};

const LoginForm = ({sendPublicKeyToBackend,connect}) => {
  const history = useHistory();
  const location = useLocation();
  const { host, getuser } = useContext(LoginContext);
  const { isLoad, setIsLoad } = useContext(MessageContext);
const [loginlaod,setloginlaod] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const { message } = location.state || {};

  useEffect(() => {
    if (message) {
      setAlertMessage(message);
      setShowAlert(true);
    }
  }, [message]);

  useEffect(() => {
    const checkToken = async () => {
      setloginlaod(true);
      const token = localStorage.getItem('token');
      if (token) {
      history.push('/home');
      setloginlaod(false);  
        return;
      }
      console.log('Checking token:', token);
      setloginlaod(false);
    };
    checkToken();
  }, [ ]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAlertMessage('Please enter both username and password.');
      setShowAlert(true);
      return;
    }
    setloginlaod(true);

    try {
      const response = await fetch(`${host}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      const json = await response.json();

      if (json.success) {
        localStorage.setItem('token', json.authtoken);
    
           await Preferences.set({
                      key: 'token',
                      value: json.authtoken,
                    });

                    const user = localStorage.getItem('currentuser');

        if (!user) {
             await getuser();
        }
  const wsUrl = `wss://${Maindata.SERVER_URL}?token=${json.authtoken}`;
        await connect(wsUrl);
                 await sendPublicKeyToBackend(json.authtoken);
        history.push('/home');
      } else {
        setAlertMessage('Invalid credentials');
        setShowAlert(true);
      }
      setloginlaod(false);
    } catch (error) {
      console.error(error);
      setAlertMessage('An error occurred. Please try again.');
      setShowAlert(true);
      setloginlaod(false);
    }
  };

  if(loginlaod){
    return (
      <div style={{ textAlign: 'center',display: 'flex', justifyContent: 'center', alignItems: 'center',position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',background: 'linear-gradient(135deg, #141E30, #243B55)',height: '100vh',width:'100%',overflowY: 'auto' }}>
      <StarLoader />
   
    </div>
    )
  }

  return (
    <>
     

      <IonContent className="" style={{ minHeight: '100dvh' }}>
        <div style={styles.container}>
        <div style={styles.header}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png"
          alt="App Logo"
          style={styles.logo}
        />
        <span style={styles.titleText}>login  to ChatVerse</span>
      </div>

          <div style={styles.form}>
            <label htmlFor="username" style={styles.label}>
              Email or Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />

            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <button onClick={handleLogin} style={styles.button}>
              Login
            </button>
            <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine} />
        </div>

        <div style={styles.socialRow}>
  <button style={{ ...styles.socialButton, ...styles.googleButton }}>
    <FcGoogle style={{ marginRight: '4px' }} />  Google
  </button>
  <button style={{ ...styles.socialButton, ...styles.facebookButton }}>
    <FaFacebookF style={{ marginRight: '4px', color: 'white' }} />  Facebook
  </button>
</div>

            <p className="text-center text-secondary mt-3">
              Don't have an account?{' '}
              <button onClick={() => history.push('/signup')} style={{ color: '#00A9E0', background: 'none', border: 'none', cursor: 'pointer' }}>
                Signup
              </button>
            </p>
          </div>

          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Login Error"
            message={alertMessage}
            buttons={['OK']}
          />
        </div>
      </IonContent>
    </>
  );
};

export default LoginForm;
