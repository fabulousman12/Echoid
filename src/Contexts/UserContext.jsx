import React, { useState, createContext } from "react";
import { IonToast } from "@ionic/react";
import { Plugins } from '@capacitor/core'; // Import from @capacitor/core

// Access Storage from Plugins
const { Storage } = Plugins;
import Maindata from "../data";
// Create the context
const LoginContext = createContext();

const LoginProvider = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [users, setUsers] = useState([]);
  const [toastMessage, setToastMessage] = useState(""); // For displaying success/error messages

  // Define server hosts and environment
  const serverHost = "https://chatapp-server-lqd9.onrender.com";
  const serverHost2 = "https://chatapp-socket-jxj0.onrender.com";
  const localhost = `https://${Maindata.SERVER_URL}`;
  const localhost2 = "http://192.168.0.197:8001";
  const host = localhost;
  const host2 = localhost2;
  const isDev = Maindata.IsDev;

  // Display toast messages for user feedback
  const showToast = (message) => {
    setToastMessage(message);
  };

  // Signup function
  const signup = async ({ name, email, password, phoneNumber, profilePhoto,otpCode }) => {
    const formData = new FormData();
    if (name) formData.append('username', name);
    if (email) formData.append('email', email);
    if (password) formData.append('password', password);
    if (phoneNumber) formData.append('phoneNumber', phoneNumber);
    if (otpCode) formData.append('otpCode', otpCode);
    if (profilePhoto) {
      formData.append('image', profilePhoto);
      setProfilePic(profilePhoto);
    }

    try {
      const response = await fetch(`${host}/user/createuser`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (json.authtoken) {
       // await Storage.set({ key: 'token', value: json.authtoken });
        localStorage.setItem('token',json.authtoken)
        setIsAuthenticated(true);
       // Fetch current user
        showToast("Signup successful!");
        return { success: true,data: json.authtoken };
      } else {
        showToast(json.error);
        return { success: false, error: json.error };
      }
    } catch (error) {
      console.error("Error during signup:", error);
      showToast("Error during signup");
      return { success: false, error };
    }
  };

  // Get current user
  const getuser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${host}/user/getuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token,
        },
      });
      const json = await response.json();
      try {

        if(json.success){
       // await Storage.set({ key: 'currentuser', value: JSON.stringify(json) });
       localStorage.setItem('currentuser',JSON.stringify(json.userResponse))
       console.log("this works here ",json.userResponse)

        setCurrentUser(json.userResponse);

        return json.userResponse;
        }else{
          return false
        }

        
      } catch (error) {
        console.error("error in saving current user in storage",error)
      }

      
    } catch (error) {
      console.error("Error fetching user:", error);
      showToast("Error fetching user");
      return false;
    }
  };

  // Edit user function
  const editUser = async (formData) => {
    const tokenResult = await Storage.get({ key: 'token' });
    const token = tokenResult.value;
    try {
      const response = await fetch(`${host}/user/edituser`, {
        method: 'PUT',
        headers: {
          'Auth': token,
        },
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        await getuser(token); // Update user after edit
        showToast("User updated successfully!");
        return { success: true };
      } else {
        showToast(json.error);
        return { success: false, error: json.error };
      }
    } catch (error) {
      console.error("Error editing user:", error);
      showToast("Error editing user");
      return { success: false, error };
    }
  };

  // Fetch all users
  const alluser = async (token) => {
    try {
      const response = await fetch(`${host}/user/alluser`, {
        method: 'GET',
        headers: {
          'Auth': token,
        },
      });
      const json = await response.json();
      setUsers(json);
    } catch (error) {
      console.error("Error fetching all users:", error);
      showToast("Error fetching all users");
    }
  };

  return (
    <LoginContext.Provider value={{ 
      isAuthenticated, setIsAuthenticated, host, signup, editUser, 
      getuser, currentUser, alluser, users, setCurrentUser, 
      host2, localhost, localhost2, isDev 
    }}>
      {props.children}

      {/* Toast component for showing success/error messages */}
      <IonToast
        isOpen={toastMessage !== ""}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setToastMessage("")}
      />
    </LoginContext.Provider>
  );
};

export { LoginContext, LoginProvider };
