import React, { useEffect, useState, useContext,useRef } from 'react';
import { LoginContext } from '../Contexts/UserContext';
import { useHistory } from 'react-router-dom';
//import io from 'socket.io-client';
//import { PropagateLoader } from 'react-spinners';

const Group = () => {
  const [ws, setWs] = useState(null);
  const context = useContext(LoginContext);
  const { host, getuser } = context;
  const [pageNumber, setPageNumber] = useState(1);
  const [groups, setGroups] = useState([]);
  const [selectContact,setselectContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedgroupdInfo, setselectedgroupinfo] = useState({profilePhoto:'',name:'',id:''})
  const messageContainerRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const [moreMessages, setMoreMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialload, setinitialload] = useState(true);


  const fetchGroups = async () => {
    try {
      const response = await fetch(`${host}/groups/user-groups`, {
        method: 'GET',
        headers: {
          Auth: token,
        },
      });
      const fetchedGroups = await response.json();
      setGroups(fetchedGroups);
      setinitialload(false)
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };
  
  return (
    
       <div>
      <h2>Groups chats</h2>
      <p>Groups options will go here.</p>
    </div>
    
  );
};

export default Group;
