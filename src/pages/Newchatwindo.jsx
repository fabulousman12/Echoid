import React, { useState, useEffect, useRef,useContext } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { LoginContext } from '../Contexts/UserContext';

import { nanoid } from 'nanoid';
import { IonContent } from '@ionic/react';
import StarLoader from './StarLoader' 
import img from '/img.jpg';
import { Preferences } from '@capacitor/preferences';
const NewChatwin = ({socket,messages,setMessages,saveMessage,selectedUser, messagestest,setMessagestest,setUsersMain}) => {
  const location = useLocation();
  const history = useHistory();

  const context = useContext(LoginContext);
 // const { socket,messages,setMessages,saveMessage,setSelectedUser } = useWebSocket(); // Use WebSocket context methods

  const {  name, phoneNumber } = location.state || {};
  const { host,getuser } = context;
  const [ws, setWs] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userid, setuserid] = useState([]);
  const [messages1, setMessages1] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersExist, setUserExist] = useState(false); // State to store sent messages
  const messagesEndRef = useRef(null);
  const [isloading, setIsloading] = useState(false);
  const messageContainerRef = useRef(null);
  const isdev = false;
  const currentuser = localStorage.getItem('currentuser');

  useEffect(() => {
    // Fetch the list of chats from your backend or API
    const fetchChats = async () => {
setIsloading(true)
      const userarray = JSON.parse(localStorage.getItem('usersMain'))

     
      
      const token = localStorage.getItem('token');
      console.log("right here but not there")
      console.log(JSON.stringify(userarray))
      var matchedUser = null
      await getuser(token)
      if(userarray.length !== 0){
         matchedUser = userarray.find(user => user.phoneNumber === phoneNumber);
        console.log(JSON.stringify(matchedUser))
      }
      if (matchedUser) {
        const matchedUser1 = userarray.find(user => user.phoneNumber === phoneNumber);
        console.log("sending the chat")
        
    setUserExist(true)
    setuserid(matchedUser); 
    selectedUser.current = matchedUser.id

    history.push('/chatwindow', { userdetails: matchedUser, callback: 'goBackToUserList',currentuser });
    setIsloading(false)
    return;

        // Handle user exists logic
      }else{
      try {
        const fetchedChats = await fetch(`${host}/user/existsuser`, {
          method: 'POST',
          headers: {
            'Auth': token,
            'Content-Type': 'application/json',

          },
          body: JSON.stringify({ phoneNumber }) // Ensure phoneNumber is sent properly if needed
        });
        const res = await fetchedChats.json();


  
        if (!res.status) {
            setUserExist(false)
            console.log('res not exist',res)
            const user = res.userDetails;
            const filteredMessages = messages.filter(
              (msg) => msg.sender === user.id || msg.recipient === user.id
            );
            setMessages1(filteredMessages);
            selectedUser.current = null
            
        setIsloading(false)
      
        }
        else{
            setUserExist(true)
            console.log('res exist',res)
      
          setuserid(res.userDetails);
          const userMain = JSON.parse(localStorage.getItem('usersMain')) || [];

          // Check if user exists in usersMain
          if (!userMain.find(user => user.id === res.userDetails.id)) {
            // User doesn't exist in usersMain, add the new user
            const newUser = {
              id: res.userDetails.id,
              name: res.userDetails.name,
              avatar: res.userDetails.profilePhoto || img,  // Assuming profilePhoto contains the image URL or base64 string
              lastMessage: 'No messages yet', // Placeholder if no message is present yet
              timestamp: new Date().toISOString(),
              phoneNumber: res.userDetails.phoneNumber,
              unreadCount: 0, // This message is unread for the new user
              updatedAt: res.userDetails.updatedAt,
              gender:res.userDetails.gender,
              dob:res.userDetails.DOB,
              Location:res.userDetails.Location,
              About:res.userDetails.About,
              publicKey:res.userDetails.publicKey
            };
            selectedUser.current = newUser.id
            // Add the new user to `usersMain` and localStorage
            setUsersMain(prevUsers => {
              // Ensure no duplicates by filtering out users with the same id
              const updatedUsers = [...prevUsers, newUser].filter((user, index, self) =>
                index === self.findIndex((u) => u.id === user.id)
              );
            
              console.log("updatedUsers",JSON.stringify(updatedUsers))
              
              localStorage.setItem('usersMain', JSON.stringify(updatedUsers));
                Preferences.set({
                  key: 'usersMain',
                  value: JSON.stringify(updatedUsers),
                });
              console.log("after update", JSON.stringify(localStorage.getItem('usersMain')))

              history.push('/chatwindow', { userdetails: newUser, callback: 'goBackToUserList',currentuser });
              setIsloading(false)
              return updatedUsers;
            });
            console.table("new user",newUser)
          }


         
    
          return () => {
         
          };  
          
          
           

        }
  
        // Assuming res is the expected JSON response
      } catch (error) {
        console.error('Error fetching chats:', error);
        // Handle error state or retry logic here
      }
    }
    };
  
    fetchChats();
  }, []);

//   useEffect(() => {
//     // Fetch messages for selected chat
//     if (selectedChat) {
//       const fetchMessages = async () => {
//         try {
//           const fetchedMessages = await fetch(`/api/messages/${selectedChat}`);
//           const messageList = await fetchedMessages.json();
//           setMessages(messageList);
//         } catch (error) {
//           console.error('Error fetching messages:', error);
//         }
//       };

//       fetchMessages();
//     }
//   }, [selectedChat]);

  useEffect(() => {
    // Scroll to bottom when messages are updated
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages1]);

  const handleBack = () => {
    history.push('/newchat');
  };
  const handleMessage = (event) =>{
    console.log(event)
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    // Implement search submit functionality here
  };

  const selectChat = (chatId) => {
    setSelectedChat(chatId);
    // Handle logic when a chat is selected
  };

  const sendMessage = async (e) => {

    e.preventDefault();
    if (newMessage.trim() === '') {
      return; // Prevent sending empty messages
    }

    // Check if user with provided phone number or name exists
 
    try {
        const currentuser = JSON.parse(localStorage.getItem('currentuser'))
   

      if (usersExist) {
        try{
            console.log("sendig the message")
        // User exists, send message via WebSocket (simulated here)
        
          const tempId = nanoid(12) + currentuser._id;
          const messageData = {
            type: 'messages',
            messageId: tempId,
            sender: currentuser._id,
            recipient: userid.id,
            content: newMessage,
            status: 'pending',
            timestamp: new Date().toISOString(),
            __v: 0
          };

          setMessages1(prevMessages => [...prevMessages, messageData]);
          
          setNewMessage('');
      saveMessage(messageData);
    
          
          
        }catch(error){
            console.log("error in sending message",error,JSON.parse(error))
            
        }  
      } else {
        // User doesn't exist, save message locally
        
        const tempId = nanoid(12) ;
            const sentMessage = {
              _id: tempId, // Generate a temporary ID
              sender: phoneNumber,
              recipient: selectedChat,
              content: newMessage.trim(),
              timestamp: new Date().toISOString(),
            };
        
         
            setMessages1(prevMessages => [...prevMessages, sentMessage]);
        
        
    
      }

      setNewMessage(''); // Clear the message input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }

  };


  const handleScroll = () => {
    // Implement scroll handler to fetch more messages
  };

  

  return (
    <IonContent         // Use Ionic padding class
    style={{ minHeight: '100dvh', backgroundColor: '#007bff' }}>
        { isloading && (
      
         <div style={{ textAlign: 'center',display: 'flex', justifyContent: 'center', alignItems: 'center',position: 'fixed', top: '50%', left: '50%', zIndex: 999999,transform: 'translate(-50%, -50%)',    background:' rgba(0, 0, 0, 0.5',height: '100vh',width:'100%',overflowY: 'auto' }}>
            <StarLoader />
         
          </div>
        
               ) }
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top section with user info */}
      <div className="flex  text-white py-4 px-6 sticky top-0 z-10" style={{backgroundColor : 'rgb(21 210 237)'}}>
        <button className="text-xl text-white hover:text-gray-600 focus:outline-none mr-4" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H3.707l5.147 5.146a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 1 1 .708.708L3.707 7.5H14.5A.5.5 0 0 1 15 8z"/>
          </svg>
        </button>
        <div className="w-30 " style={{display : 'flex',justifyContent:'space-evenly',alignItems:'center' , width: '35%'}}>
        <div className="w-12 h-12  bg-gray-300 rounded-full overflow-hidden  " >
          <img
            src= {img}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
        <h5 className="text-lg font-bold w-8 mb-2">{name || phoneNumber}</h5>
        </div>

        </div>
        <div className="ml-auto flex items-center">
          <button className="text-xl text-white hover:text-gray-600 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 h-full border-b border-gray-200 overflow-y-auto messages-contain"  ref={messageContainerRef} onScroll={handleScroll}>
        

            <div id="new-messages">
              {messages1
              
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map(msg => (
                  <div
                    key={msg.id}
                    className={'flex mb-2 my-3 max-w-1/2 justify-end'}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg shadow ${
                        msg.sender === currentuser
                          ? 'bg-white text-black'
                          : 'bg-blue-250 text-red-1000'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <small className="block mb-2 my-2 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
              {/* Display sent messages */}
           
              <div ref={messagesEndRef} />
            </div>
          
        
      </div>
      
      {/* Message input form */}
      <form onSubmit={sendMessage} className="p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 border border-gray-300 rounded-md py-2 px-4 mr-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Send
          </button>
        </div>
      </form>
      
    </div>
    </IonContent>
  );
};

export default NewChatwin;
