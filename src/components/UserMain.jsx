import React, { useEffect, useState,useRef } from 'react';
import UserRow from './UserRow'; // path to the file where you created the memoized component
import './UserRow.css'
import StarLoader from '../pages/StarLoader' 
const UserMain = ({ usersMain, onUserClick, currentUserId, selectedUsers, setSelectedUsers, selectionMode, setSelectionMode, setmutedList, mutedUsers, mode, setMode }) => {
  const [activeSwipeId, setActiveSwipeId] = useState(null);
  const [action, setAction] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // For search functionality
  const [swipeFeedback, setSwipeFeedback] = useState(''); // To store the swipe feedback text
  const lastScrollTopRef = useRef(0);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const scrollTimeoutRef = useRef(null);
  const [isLoad, setIsLoad] = useState(false);
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
  
  useEffect(() => {
    setmutedList(JSON.parse(localStorage.getItem('mutedUsers')));
  }, []);






  const filteredAndSortedUsers = [...usersMain]
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) && // Filter by search term
      !user.isArchive &&
      user.id !== currentUserId // Only include users who are not archived
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent timestamp

  const handleSwipe = (direction, user) => {
    setActiveSwipeId(user.id);
    setAction(direction); // Set action to direction (left or right)

    // Update swipe feedback based on the direction of the swipe
    if (direction === 'Left') {
      setSwipeFeedback('Archive Chat'); // Feedback for swipe from right to left
    } else if (direction === 'Right') {
      setSwipeFeedback('Open Chat'); // Feedback for swipe from left to right
    }

    setTimeout(() => {
      setActiveSwipeId(null);
      setAction('');
      setSwipeFeedback('');

      if (mode === 'swipe') {
        if (direction === 'Left') {
          // Archive chat on swipe from right to left
      
          // Call the function to archive the chat (e.g., onArchiveChat)
        } else if (direction === 'Right') {
          // Open chat window on swipe from left to right
         
          onUserClick(user);  // This can be your custom function to open the chat window
        }
      }
    }, 200); // Reset swipe state after 2 seconds
  };

  const handleClick = (user) => {
    if (mode === 'normal') {
      // In normal mode, open chat window on click
      onUserClick(user);
    }
  };

  const handleCallAction = (direction, user) => {
    if (mode === 'normal') {
      // In normal mode, swiping left or right triggers call actions (calls and video calls)
      if (direction === 'Left') {
        setSwipeFeedback('Video Call');
        // Initiate video call or other actions

      } else if (direction === 'Right') {
        setSwipeFeedback('Voice Call');
        // Initiate voice call or other actions
      
      }
    }
    setTimeout(() => {
      setActiveSwipeId(null);
      setAction('');
      setSwipeFeedback('');
    }, 200); // Reset swipe state after a short delay
  };

  // Add dummy users to the list
  // for (let i = 1; i <= 15; i++) {
  //   filteredAndSortedUsers.push({
  //     id: `dummy-${i}`,
  //     name: `Dummy User ${i}`,
  //     timestamp: new Date().toISOString(),
  //     isArchive: false
  //   });
  // }

  // Optional: Re-sort the list after adding dummy users
  filteredAndSortedUsers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <>
    <div className="user-main-container">
       
      {/* Search Bar */}
      {showSearchBar && (
  <div className="modern-search-bar">
    <input
      type="text"
      className="modern-search-input"
      placeholder="Search users..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
)}


      {/* User List - Scrolling */}
      <div className="user-list-container"  id="user-list-container">
        <div className="list-group">
          {/* Render filtered and sorted users */}
          {filteredAndSortedUsers &&  filteredAndSortedUsers.map(user => (
            <UserRow
              key={user.id}
              user={user}
              isActiveSwipe={user.id === activeSwipeId}
              action={action}
              onSwipe={(direction) => {
                handleSwipe(direction, user); // Handle swipe direction (left or right)
                handleCallAction(direction, user); // Handle call actions based on swipe direction
              }}
              onClick={() => handleClick(user)} // Open chat window on click in normal mode
              mutedUsers={mutedUsers}
              setmutedList={setmutedList}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              selectionMode={selectionMode}
              setSelectionMode={setSelectionMode}
              swipeFeedback={swipeFeedback} // Passing feedback for the swipe
            />
          ))}
          {filteredAndSortedUsers && filteredAndSortedUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
    No users found.
  </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default UserMain;
