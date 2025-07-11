import React, { createContext, useState, useEffect, useRef } from 'react';
import { isPlatform } from '@ionic/react';
import {  CapacitorSQLite,SQLiteDBConnection } from '@capacitor-community/sqlite';
import Maindata from '../data';
const WebSocketContext = createContext();

 const WebSocketProvider = ({ children }) => {
  
  

  // Store message in SQLite
  const storeMessageInSQLite = async (db, message) => {
    console.log("onto savibg",db,message)
    

    return new Promise((resolve, reject) => {
      try {
        // Check for valid DB instance
      if (!db || typeof db.transaction !== 'function') {
    const err = new Error('Database is undefined or invalid');
    console.error('❌ Invalid DB instance passed to storeMessageInSQLite:', db);
    reject(err);  // reject instead of throw
    return;
  }

  
        // Log message details before inserting
 // Beautified JSON output
  
        // Generating unique message ID
        db.transaction(tx => {
          tx.executeSql(`
            INSERT OR REPLACE INTO messages (
              id, sender, recipient, content, timestamp, status, read, isDeleted, isDownload,
              type, file_name, file_type, file_size, thumbnail, file_path, isSent, isError, encryptedMessage,encryptedAESKey,eniv
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
          `, [
            message.id,
            message.sender,
            message.recipient,
            message.content || null,
            new Date(message.timestamp).toISOString(),
            message.status || 'pending',
            message.read ? 1 : 0,
            message.isDeleted ? 1 : 0,
            message.isDownload ? 1 : 0,
            message.type || 'messages',
            message.file_name || null,
            message.file_type || null,
            message.file_size || null,
            message.thumbnail || null,
            message.file_path || null,
            message.isSent ? 1 : 0,
            message.isError ? 1 : 0,
            message.encryptedMessage || null,
            message.encryptedAESKey || null,
            message.eniv || null
          ], 
          () => {
      
            // After inserting the message, fetch and log all messages
           fetchAllMessages(db)
            resolve(message.id); // Resolve with the message ID
            return true
          }, 
          (tx, error) => {
            console.error('Error storing message in SQLite:', error);
            reject(error); // Reject if there’s an error
          });
        });
        
      } catch (error) {
        console.error('Error in storeMessageInSQLite:', JSON.stringify(error));
        reject(error);
      }
    });
    
  };
  
  // Function to fetch and log all messages from SQLite
  const fetchAllMessages = async (db) => {

    return new Promise((resolve, reject) => {
 try {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM messages',
      [],
      (_, result) => {
   // Log the number of messages
          const messages = [];
          for (let i = 0; i < result.rows.length; i++) {
            messages.push(result.rows.item(i));
          }

    
        resolve(messages);
      },
      (_, error) => {
        console.error('❌ SQL Error:', error);
        reject(error);
      }
    );
  });
} catch (err) {
  console.error('❌ Transaction threw:', err);
  reject(err);
}

    });
  };
  
  
  
  
  // Update unread count in SQLite
   const updateUnreadCountInSQLite = async (db, sender) => {
    // try {
    //   await db.run(`
    //     INSERT OR REPLACE INTO unreadCount (sender, count)
    //     VALUES (?, (SELECT count + 1 FROM unreadCount WHERE sender = ?))
    //   `, [sender, sender]);
  
    //   console.log('Unread count updated in SQLite');
    // } catch (err) {
    //   console.error('Error updating unread count in SQLite:', err);
    // }
    return new Promise((resolve, reject) => {
      const id = new Date().toISOString();
      db.transaction(tx => {
          tx.executeSql(`
          INSERT OR REPLACE INTO unreadCount (sender, count)
          VALUES (?, (SELECT count + 1 FROM unreadCount WHERE sender = ?))
        `, [sender, sender], 
              () => resolve(id), 
              (tx, error) => reject(error));
      });
  });
  
  };
  
  // Reset unread count in SQLite
   const resetUnreadCountInSQLite = async (db, sender) => {
    // try {
    //   await db.run(`UPDATE unreadCount SET count = 0 WHERE sender = ?`, [sender]);
    //   console.log('Unread count reset in SQLite');
    // } catch (err) {
    //   console.error('Error resetting unread count in SQLite:', err);
    // }
    return new Promise((resolve, reject) => {
      const id = new Date().toISOString();
      db.transaction(tx => {
          tx.executeSql(`UPDATE unreadCount SET count = 0 WHERE sender = ?`, [sender], 
              () => resolve(id), 
              (tx, error) => reject(error));
      });
  });
    
  };
  const getMessagesFromSQLite = async (db, currentUser, limitPerUser) => {

    if (!db) {
      console.error("SQLite database is not initialized.");
      return [];
    }
  
    return new Promise((resolve, reject) => {
      // Step 1: Get the list of other users
    // Log start of fetching
      db.transaction(tx => {
        tx.executeSql(
          `SELECT DISTINCT CASE
                               WHEN sender = ? THEN recipient
                               ELSE sender
                             END AS other_userid
           FROM messages
           WHERE sender = ? OR recipient = ?`,
          [currentUser, currentUser, currentUser],
          (tx, results) => {
            const otherUserIds = [];
            for (let i = 0; i < results.rows.length; i++) {
              otherUserIds.push(results.rows.item(i).other_userid);
            }
  
        //    console.log("Other userIds fetched:", JSON.stringify(otherUserIds)); // Log the userIds fetched
  
            // Step 2: Fetch the latest 45 messages between the currentUser and each other user
            const messagesPromises = otherUserIds.map(userId =>
              new Promise((resolveMessages, rejectMessages) => {
                tx.executeSql(
                  `SELECT id, sender, recipient, content, timestamp, status, read,
       isDeleted, isDownload, type, file_name, file_type, file_size,
       thumbnail, file_path, isSent, isError,encryptedMessage,encryptedAESKey,eniv
                   FROM messages
                   WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
                   ORDER BY timestamp DESC
                   LIMIT ?`,
                  [currentUser, userId, userId, currentUser, limitPerUser],
                  (tx, results) => {
                    const messages = [];
                    for (let i = 0; i < results.rows.length; i++) {
                      const row = results.rows.item(i);
                      messages.push({
                        id: row.id,
                        sender: row.sender,
                        recipient: row.recipient,
                        content: row.content,
                        timestamp: new Date(row.timestamp).toISOString(),
                        status: row.status,
                        read: row.read ,
                        isDeleted: row.isDeleted ,
                        isDownload: row.isDownload ,
                        type: row.type,
                        file_name: row.file_name === 'null' ? null : row.file_name,
                        file_type: row.file_type === 'null' ? null : row.file_type,
                        file_size: row.file_size,
                        thumbnail: row.thumbnail === 'null' ? null : row.thumbnail,
                        file_path: row.file_path === 'null' ? null : row.file_path,
                        isSent: row.isSent ,
                        isError: row.isError ,
                        encryptedMessage: row.encryptedMessage === 'null' ? null : row.encryptedMessage,
                        encryptedAESKey: row.encryptedAESKey === 'null' ? null : row.encryptedAESKey,
                        eniv : row.eniv === 'null' ? null : row.eniv
                      });
                    }
                  //  console.log(`Messages for user ${userId}:`, messages); // Log the messages for each user
                    resolveMessages(messages);
                  },
                  (tx, error) => {
                    console.error("Error fetching messages for user", userId, error); // Log errors specific to each user fetch
                    rejectMessages(error);
                  }
                );
              })
            );
  
            // Wait for all the messages to be fetched for each user
            Promise.all(messagesPromises)
              .then(allMessages => {
                // Flatten the messages array from all users
                const flatMessages = allMessages.flat();
          //      console.log("All messages fetched (before sorting):", flatMessages); // Log all messages before sorting
  
                // Sort messages by timestamp ASC
                flatMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
             //   console.log("All messages fetched and sorted:",flatMessages); // Log the final sorted messages
                resolve(flatMessages); // Resolve with the array of messages
              })
              .catch(error => {
                console.error("Error fetching all messages:", JSON.stringify(error)); // Log if there's an issue in fetching all messages
                reject(error);
              });
          },
          (tx, error) => {
            console.error("Error fetching other users:", JSON.stringify(error)); // Log error in fetching other users
            reject(error);
          }
        );
      });
    });
  };
  
   const getALLMessagesFromSQLite = async (db) => {
   
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
        `  SELECT id, sender, recipient, content, timestamp, status, read 
          FROM messages 
          ORDER BY timestamp ASC`
        , [], 
              (tx, results) => {
                const messages = results.map(row => ({
                  id: row.id,
                  sender: row.sender,
                  recipient: row.recipient,
                  content: row.content,
                  timestamp: new Date(row.timestamp).toISOString(), // Convert back to ISO string if needed
                  status: row.status,
                  read: row.read === 1,  // Convert read flag back to boolean
                }));
            
                  resolve(messages);
              }, 
              (tx, error) => reject(error));
      });
  });
  }; 
  
  
  
  const getunreadcount = async (db) => {
  
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(`
          SELECT id, sender, recipient, content, timestamp, status, read 
          FROM messages 
          ORDER BY timestamp ASC
        `, [], 
              (tx, results) => {
                const messages = results.map(row => ({
                  id: row.id,
                  sender: row.sender,
                  recipient: row.recipient,
                  content: row.content,
                  timestamp: new Date(row.timestamp).toISOString(), // Convert back to ISO string if needed
                  status: row.status,
                  read: row.read === 1,  // Convert read flag back to boolean
                }));
            
                  resolve(messages);
              }, 
              (tx, error) => reject(error));
      });
  });
  };
  

  return (
    <WebSocketContext.Provider
      value={{
        storeMessageInSQLite,
        updateUnreadCountInSQLite,
        getALLMessagesFromSQLite,
        getunreadcount,
        getMessagesFromSQLite,
        fetchAllMessages,
 
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext, WebSocketProvider };

