import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaTrash, FaArchive } from 'react-icons/fa';
import UserRow from '../components/UserRow'; // Reuse your UserRow
import { IonContent } from '@ionic/react';
import { MessageContext } from '../Contexts/MessagesContext';
import { useContext } from 'react';
import { IonIcon } from '@ionic/react';
import {closeCircleOutline} from 'ionicons/icons';
import { useHistory } from 'react-router-dom'; 
 import { useMemo } from 'react';
import StarLoader from '../pages/StarLoader';
import { Preferences } from '@capacitor/preferences';
const ArchivedPage = ({ users ,selectedUser1,usersMain,setUsersMain}) => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'group'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const history = useHistory();
  const [mutedUsers, setmutedList] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
//const [usersMain, setUsersMain] = useState([]);
 const [showModal, setShowModal] = useState(false); 
  const [showSearchBar, setShowSearchBar] = useState(true);
 const [archiveUsers, setArchiveUsers] = useState([]);
const [isLoad, setIsLoad] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
const {
    currentUserId,
    setCurrentUser,
    selectedUser,
    setSelectedUser1,
  
    activeFooter,
    setActiveFooter,
    menuVisible,
    setMenuVisible,
    showAlert,
    setShowAlert,
    alertMessage,
    setAlertMessage,
   
    } = useContext(MessageContext);

  useEffect(() => {
    const container = document.getElementById('user-list-container');
  
    const handleScroll = (e) => {
      const deltaY = e.deltaY;
  
      clearTimeout(scrollTimeoutRef.current);
  
      if (deltaY > 0) {
        setShowSearchBar(false); // scroll down
      } else {
        setShowSearchBar(true); // scroll up
      }
  
      // Optional: prevent flickering
      scrollTimeoutRef.current = setTimeout(() => {
        setShowSearchBar(true); // show again after pause
      }, 300);
    };
  
    container?.addEventListener('wheel', handleScroll);
    return () => container?.removeEventListener('wheel', handleScroll);
  }, []);
  const filteredAndSortedUsers = [...usersMain]
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) && // Filter by search term
      user.isArchive &&
      !user.isPartialDelete &&
      user.id !== currentUserId
       // Only include users who are not archived
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent timestamp

 // Make sure this logs the filtered users

  const handleUserClick = async(user) => {
   
    setSelectedUser1(user);
    selectedUser1.current = user.id

    history.push('/chatwindow', { userdetails: user, callback: 'goBackToUserList',currentUserId });
  };

  const handleSwipe = (direction, user) => {
    
  };

  const handleUnarchive = () => {
  

    let usersMain = JSON.parse(localStorage.getItem("usersMain")) || [];
  
    // Archive and mute logic update
    const updatedUsers = usersMain.map(user => {
      if (selectedUsers.includes(user.id)) {
        const currentArchiveStatus = user.isArchive || false;
        const newArchiveStatus = !currentArchiveStatus;
  
        return {
          ...user,
          isArchive: newArchiveStatus,
          isMuted: newArchiveStatus // Mute if archived, unmute if not
        };
      }
      return user;
    });
  
    // Determine new muted list based on isMuted flags
    const updatedMutedUsers = updatedUsers.reduce((acc, user) => {
      if (user.isMuted && selectedUsers.includes(user.id)) {
        if (!acc.includes(user.id)) acc.push(user.id);
      } else {
        acc = acc.filter(id => id !== user.id);
      }
      return acc;
    }, JSON.parse(localStorage.getItem("mutedUsers")) || []);
  
    // Save to localStorage
    localStorage.setItem("usersMain", JSON.stringify(updatedUsers));
    localStorage.setItem("mutedUsers", JSON.stringify(updatedMutedUsers));
    Preferences.set({
      key: 'usersMain',
      value: JSON.stringify(updatedUsers),
    });
    Preferences.set({
      key: 'mutedUsers',  
      value: JSON.stringify(updatedMutedUsers), 
    });
  
    // Update states
    setUsersMain(updatedUsers);
    setmutedList(updatedMutedUsers);
    setMenuVisible(prev => !prev);

  };
  
  

    const handleWipeChat = () => {

      const selectedUserIds = selectedUsers.map(user => user.id); // Get all selected user IDs
    
      // Web (Browser)
      if (!isPlatform('hybrid')) {
       
    
        // Remove matching users from 'userMain'
        const userMain = JSON.parse(localStorage.getItem("userMain"));
        if (userMain && selectedUserIds.includes(userMain.id)) {
          localStorage.removeItem("userMain");
        
        }
    
        // Remove messages related to selected users
        let messages = JSON.parse(localStorage.getItem("messages")) || [];
        messages = messages.filter(
          msg => !selectedUserIds.includes(msg.sender) && !selectedUserIds.includes(msg.recipient)
        );
        localStorage.setItem("messages", JSON.stringify(messages));

      }
    
      // Android (Hybrid)
      if (isPlatform('hybrid')) {
        const userMain = JSON.parse(localStorage.getItem("userMain"));
        if (userMain && selectedUserIds.includes(userMain.id)) {
          localStorage.removeItem("userMain");
        
        }
    
        // Run SQL delete for each selected user
        db.transaction(tx => {
          selectedUserIds.forEach(userId => {
            const query = `
              DELETE FROM messages
              WHERE sender = ? OR recipient = ?;
            `;
            tx.executeSql(
              query,
              [userId, userId],
              (_, result) => {
              
              },
              (_, error) => {
                console.error(`❌ Error deleting messages for user ${userId}:`, error);
                return false;
              }
            );
          });
        });
      }
    
      setShowModal(false); // Close the modal
    };

    const handleCancel = () => {
        setShowModal(false); // Close the modal without any action
      };
  const toggleMute = () => {
    setmutedList(prevMutedUsers => {
      // selectedUsers already contains IDs
      const selectedUserIds = selectedUsers;

      // Toggle mute status for each selected user
      const updatedMutedUsers = selectedUserIds.reduce((acc, userId) => {
        if (acc.includes(userId)) {
          // If already muted, remove the ID
          return acc.filter(id => id !== userId);
        } else {
          // If not muted, add the ID
          return [...acc, userId];
        }
      }, [...prevMutedUsers]); // Start with previous muted users

      // Update localStorage with the updated muted users
      localStorage.setItem('mutedUsers', JSON.stringify(updatedMutedUsers));
  Preferences.set({ 
    key: 'mutedUsers',
    value: JSON.stringify(updatedMutedUsers),
  });
      return updatedMutedUsers; // Return the updated state
    });
  };
  

  const handleDelete = () => {

    // Trigger delete logic here
  };

  const handleDeselectAll = () => {
    setSelectedUsers([]);
    setSelectionMode(false);
  };
  const handlePartialDelete = () => {
    let usersMain = JSON.parse(localStorage.getItem("usersMain")) || [];
  
    const selectedUserIds = selectedUsers.map(user => user.id);
  
    const updatedUsers = usersMain.map(user => {
      if (selectedUserIds.includes(user.id)) {
        return { ...user, isPartialDelete: true };
      }
      return user;
    });
  
    localStorage.setItem("usersMain", JSON.stringify(updatedUsers));
    Preferences.set({
      key: 'usersMain',
      value: JSON.stringify(updatedUsers),
    });
    setUsersMain(updatedUsers);

    setShowModal(false); // Close the modal
  };
  
  const handleDeleteChat = () => {
    setShowModal(true);
    //console.log("Delete Chat button clicked");
  };


  if(isLoad){
      return(
   <div style={{ textAlign: 'center',display: 'flex', justifyContent: 'center', alignItems: 'center',position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',background: 'linear-gradient(135deg, #141E30, #243B55)',height: '100vh',width:'100%',overflowY: 'auto' }}>
      <StarLoader />
   
    </div>
  
  )
  }

  return (
    <IonContent style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center" style={{ position: 'fixed', width: '100%', top: 0, zIndex: 1000 }}>
        <div className="d-flex align-items-center">
        {selectionMode ? (
      <FaArrowLeft className="icon" onClick={handleDeselectAll} style={{ fontSize: '24px', cursor: 'pointer' }} />
    ) : (
      <button
        className="btn btn-link text-white m-0 p-0"
        onClick={() => history.push('/home')}
        style={{ fontSize: '18px', textDecoration: 'none' }}
      >
        Home
      </button>
    )}


        </div>

        {selectionMode && (
          <div className="d-flex gap-3">
            <button className="btn btn-warning" onClick={handleUnarchive}>Unarchive</button>
            <button className="btn btn-danger" onClick={handleDeleteChat}>Delete</button>
         
          </div>
        )}
      </div>
       {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                      <div className="bg-white rounded-lg p-6 w-96 relative">
                        {/* Close Button */}
                        <button
                          onClick={handleCancel}
                          className=" top-2 right-2 text-red hover:text-red-700"
                          title="Close"
                        >
                          <IonIcon icon={closeCircleOutline} size="large" />
                        </button>
            
                        {/* Modal Content */}
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Are you sure you want to delete this chat?</h2>
                        <p className="text-gray-700 mb-4">
                          If you want, you can delete the chat but keep the messages.
                        </p>
                        <div className="flex space-x-4 text-gray-700">
                          <button
                            onClick={handleWipeChat}
                            className="w-1/2 py-2 px-4 bg-red-500 text-black rounded-lg hover:bg-red-600"
                          >
                            Wipe it
                          </button>
                          <button
                            onClick={handlePartialDelete}
                            className="w-1/2 py-2 px-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                          >
                            Partial Delete
                          </button>
                        </div>
                        <button
                          onClick={handleCancel}
                          className="mt-4 w-full py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

      {/* Tabs */}
      <div className="d-flex justify-content-around mt-5 pt-3 bg-light border-bottom">
        <button className={`btn ${activeTab === 'chats' ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab('chats')}>Chats</button>
        <button className={`btn ${activeTab === 'group' ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab('group')}>Group Chats</button>
      </div>
        <div className="modern-search-bar" style={{position:'fixed',top:'110px',zIndex:'10',width:'70dvw',right:'15%',transition:'transform 0.3s ease-in-out'}}>
    <input
      type="text"
      className="modern-search-input"
      placeholder={activeTab === 'chats' ? 'Search Chats' : 'Search Groups'}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

      <div className="p-3" style={{ marginTop: '50px' }}>
   {activeTab === 'chats' && filteredAndSortedUsers && filteredAndSortedUsers.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isActiveSwipe={false}
            action=""
            onSwipe={handleSwipe}
            onClick={handleUserClick}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            mutedUsers={mutedUsers}
            setMutedList={setmutedList}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
          />
        ))}

        {activeTab === 'group' && (
          <p className="text-muted">Group archive logic goes here...</p>
        )}
      </div>
    </IonContent>
  );
};

export default ArchivedPage;
