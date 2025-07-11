import React, { useState, createContext, useEffect, useCallback } from "react";
import { Plugins } from "@capacitor/core";

const { Storage } = Plugins;

const MessageContext = createContext();

const MessageProvider = (props) => {
  const [currentUserId, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser1] = useState(null);
  const [usersMain, setUsersMain] = useState([]);
  const [activeFooter, setActiveFooter] = useState('Chats');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoad, setIsLoad] = useState(true);

  // Fetch users from storage or API
  const fetchUsers = useCallback(async (host) => {
    try {
      const response = await fetch(`${host}/user/alluser`, {
        method: "GET",
        headers: {
          Auth: localStorage.getItem("token"),
        },
      });
      if (response.ok) {
        const { userDetails } = await response.json();
        const updatedUsers = userDetails.map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.profilePic || "default-avatar-url",
          lastMessage: usersMain.find((u) => u.id === user.id)?.lastMessage || "No messages yet",
          timestamp: usersMain.find((u) => u.id === user.id)?.timestamp || "",
          unreadCount: usersMain.find((u) => u.id === user.id)?.unreadCount || 0,
        }));
        setUsersMain(updatedUsers);
        await Storage.set({ key: "usersMain", value: JSON.stringify(updatedUsers) });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Fetch messages from storage
  const getMessages = async () => {
    try {
      const { value } = await Storage.get({ key: "messages" });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error("Error retrieving messages:", error);
      return [];
    }
  };

  // Save a single message
  const saveMessage = async (message) => {
    try {
      const storedMessages = await getMessages();
      const updatedMessages = [...storedMessages, message];
      await Storage.set({ key: "messages", value: JSON.stringify(updatedMessages) });
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Update unread count for a user
  const updateUnreadCount = async (senderId) => {
    try {
      const updatedUnreadCount = {
        ...unreadcount,
        [senderId]: (unreadcount[senderId] || 0) + 1,
      };
      await Storage.set({ key: "unreadCount", value: JSON.stringify(updatedUnreadCount) });
      setUnreadcount(updatedUnreadCount);
    } catch (error) {
      console.error("Error updating unread count:", error);
    }
  };

  // Mark messages as read for a user
  const markMessagesAsRead = async (senderId) => {
    try {
      const updatedUnreadCount = {
        ...unreadcount,
        [senderId]: 0,
      };
      await Storage.set({ key: "unreadCount", value: JSON.stringify(updatedUnreadCount) });
      setUnreadcount(updatedUnreadCount);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Fetch users from local storage
  const loadUsersFromLocalStorage = async () => {
    const { value } = await Storage.get({ key: "usersMain" });
    if (value) {
      setUsersMain(JSON.parse(value));
    }
  };

  // Initialization

  return (
    <MessageContext.Provider
      value={{
       currentUserId,
       setCurrentUser,
       selectedUser,
       setSelectedUser1,
       usersMain,
       setUsersMain,
       activeFooter,
       setActiveFooter,
       menuVisible,
       setMenuVisible,
       showAlert,
       setShowAlert,
       alertMessage,
       setAlertMessage,
       isLoad,
       setIsLoad,
       fetchUsers,
       getMessages,
       saveMessage,
       updateUnreadCount,
       markMessagesAsRead
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
