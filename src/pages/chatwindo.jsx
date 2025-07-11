import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router';
import img from '/img.jpg';
import { nanoid } from 'nanoid';
import { isPlatform } from '@ionic/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './chatcss.css'
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import Maindata from '../data';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { FaPaperclip, FaImage, FaFileAlt } from "react-icons/fa"; // Font Awesome icons
import { App as CapacitorApp } from '@capacitor/app';
import Plyr from "plyr-react";
import forge from 'node-forge';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';

import {Media } from '@capacitor-community/media'
import StarLoader from './StarLoader';
import { IonModal } from "@ionic/react";
import "plyr/dist/plyr.css";  
import Picker from '@emoji-mart/react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaPlay, FaPause, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { filereder } from 'filereder';
import { ffmpeg_thumnail } from 'ionic-thumbnail';
import video from './BlueStacks App Player 2024-08-21 15-46-04.mp4'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BellIcon, BellOffIcon, Files, SettingsIcon } from 'lucide-react';
import { IonSpinner } from '@ionic/react';
import VoiceRecordingUI from "../components/VoiceRecordingUI"; // adjust path accordingly

import ReactPlayer from 'react-player';
import { IonIcon } from '@ionic/react';
import { IonLoading } from '@ionic/react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonImg } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import "./HomeScreen.css";
// Mock function to save file locally
import ImageRenderer from '../components/ImageRenderer';
import VideoRenderer from '../components/VideoRenderer';
import VideoMessage from '../components/VideoMessage';
import DocumentRenderer from '../components/DocumentRenderer';
import { playCircleOutline,documentOutline,callOutline,videocamOutline,downloadOutline,arrowBackOutline, ellipsisVerticalOutline,closeCircleOutline,closeOutline, copyOutline, trashOutline, arrowRedoOutline, }from 'ionicons/icons';
import waveForm from '../components/WaveformPlayer'
import { IoArchiveOutline, IoBanOutline, IoTrashOutline } from "react-icons/io5"; // Ionicons (Outline)
import { FaArrowDown } from 'react-icons/fa'; // Import the down arrow icon
import { OneSignal } from 'onesignal-cordova-plugin';
import { Preferences } from '@capacitor/preferences';
import { Plugins } from '@capacitor/core';
import VideoPlayerPlyrWithResolve from '../components/VideoPlayerPlyr';
// Function to save the video file locally
const saveFileLocally1 = async (blob, fileName) => {
  // First, check if the Pictures directory exists
  try{
  const picturesDirectory = await Filesystem.readDirectory({
   path: '',
   directory: Directory.Pictures,
 });

 let targetDirectory = Directory.Pictures;

 if (!picturesDirectory.files.includes(fileName)) {
   // If Pictures directory doesn't exist, fall back to DCIM directory
   targetDirectory = Directory.DCIM;
 }

 // Save the file in the target directory
 const filePath = await Filesystem.writeFile({
   path: `${targetDirectory}/Swipe/${fileName}`,
   data: blob,
   directory: Directory.Data,
   recursive: true, // Ensures that the directory is created if it doesn't exist
 });

 //console.log('File saved successfully at:', filePath.uri);
 return filePath.uri; // Return the local file URI

} catch (error) {
 console.error('Error saving file locally:', error);
 throw error;
}
};



// export const saveFileLocally2 = async (blob, filename, filetype) => {
//   if (!isPlatform('android')) {
//     throw new Error('This function supports Android only.');
//   }
//   const mediaPlugin = new Media();

//   const granted = await PermissionsAndroid.request(
//     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
//   );
//   if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//     throw new Error('Storage permission denied');
//   }

//   const base64Data = await new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const result = reader.result;
//       resolve(result.split(',')[1]);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });

//   let saveOptions = {
//     base64: base64Data,
//     album: 'SwipeMedia',
//     filename,
//   };

//   let result;

//   switch (filetype) {
//     case 'image':
//       saveOptions.album = 'SwipeMedia';
//       result = await mediaPlugin.savePhoto(saveOptions);
//       break;
//     case 'video':
//       saveOptions.album = 'SwipeMedia';
//       result = await mediaPlugin.saveVideo(saveOptions);
//       break;
//     case 'audio':
//       saveOptions.album = 'SwipeAudio';
//       result = await mediaPlugin.saveAudio(saveOptions);
//       break;
//     case 'document':
//     default:
//       saveOptions.album = 'SwipeDocuments';
//       result = await mediaPlugin.saveDocument(saveOptions);
//       break;
//   }

//   // The returned result usually has a 'path' property (native file URI)
//   return result.path || null;
// };
export const saveFileToExternalStorage = async (blob, filename, filetype) => {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting saveFileToExternalStorage");

    if (!window.cordova || !window.resolveLocalFileSystemURL) {
      console.error("❌ Cordova or resolveLocalFileSystemURL not available");
      return reject("Cordova or filesystem not available");
    }

    const permissions = window.cordova.plugins.permissions;
    const basePath = window.cordova.file.externalRootDirectory;

    console.log("📁 Base path:", basePath);

    try {
      permissions.requestPermission(
        permissions.WRITE_EXTERNAL_STORAGE,
        status => {
          console.log("🔐 Permission request status:", status);
          if (!status.hasPermission) {
            console.error("❌ Storage permission denied");
            return reject("Storage permission denied");
          }

          // Determine folder path by file type
          let folderPath = '';
          switch (filetype) {
            case 'image':
              folderPath = 'DCIM/swipe/images';
              break;
            case 'video':
              folderPath = 'DCIM/swipe/videos';
              break;
            case 'audio':
              folderPath = 'Music/swipe';
              break;
            case 'document':
              folderPath = 'Documents/swipe';
              break;
            default:
              folderPath = 'Documents/swipe';
              break;
          }

          console.log("📂 Target folder path:", folderPath);

          // Resolve base path
          window.resolveLocalFileSystemURL(basePath, rootDir => {
            console.log("✅ Base directory resolved");

            const folders = folderPath.split('/');

            // Create all folders step-by-step
            createNestedDirectory(rootDir, folders, finalDir => {
              console.log("📁 Target directory ready:", folderPath);
              writeBlobToFile(finalDir);
            }, err => {
              console.error("❌ Failed to create directory path", err);
              reject(err);
            });

          }, err => {
            console.error("❌ Failed to resolve base path", err);
            reject(err);
          });

          // Recursive directory creation
          function createNestedDirectory(root, folders, onComplete, onError) {
            const next = folders.shift();
            if (!next) return onComplete(root);

            root.getDirectory(next, { create: true }, dir => {
              createNestedDirectory(dir, folders, onComplete, onError);
            }, onError);
          }

          // Write blob to file
          function writeBlobToFile(dirEntry) {
            try {
              console.log("📝 Writing file:", filename);
              dirEntry.getFile(filename, { create: true, exclusive: false }, fileEntry => {
                fileEntry.createWriter(fileWriter => {
                  fileWriter.onwriteend = () => {
                    console.log("✅ File written:", fileEntry.nativeURL);
                    resolve(fileEntry.nativeURL);
                  };
                  fileWriter.onerror = err => {
                    console.error("❌ Error writing file", err);
                    reject(err);
                  };
                  fileWriter.write(blob);
                }, err => {
                  console.error("❌ Error creating writer", err);
                  reject(err);
                });
              }, err => {
                console.error("❌ Error getting file", err);
                reject(err);
              });
            } catch (err) {
              console.error("❌ Exception during file write", err);
              reject(err);
            }
          }

        },
        err => {
          console.error("❌ Permission request failed", err);
          reject(err);
        }
      );
    } catch (err) {
      console.error("❌ Unexpected error in main block", err);
      reject(err);
    }
  });
};



export const saveFileLocally = async (blob, filename, filetype) => {
  if (!isPlatform('android')) {
    throw new Error('This function supports Android only. and this is original');
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  );
  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Storage permission denied');
  }

  // Convert blob to base64
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Determine target folder based on filetype
  let folderPath = '';
  switch (filetype) {
    case 'image':
    case 'video':
      folderPath = 'DCIM/SwipeMedia'; // shows in Gallery
      break;
    case 'audio':
      folderPath = 'Music/SwipeAudio'; // shows in Music apps
      break;
    case 'document':
    default:
      folderPath = 'Documents/SwipeDocuments'; // accessible in file managers
      break;
  }

  const fullPath = `${folderPath}/${filename}`;

  // Ensure folder exists
  try {
    await Filesystem.stat({ path: folderPath, directory: Directory.ExternalStorage });
  } catch {
    await Filesystem.mkdir({
      path: folderPath,
      directory: Directory.ExternalStorage,
      recursive: true,
    });
  }

  // Write the file
  const savedFile = await Filesystem.writeFile({
    path: fullPath,
    directory: Directory.ExternalStorage,
    data: base64Data,
    encoding: Encoding.Base64,
  });

  // Trigger MediaScanner for gallery/music visibility


  return savedFile.uri;
};


const Chatwindo = ({ db,socket,setMessages,saveMessage,selectedUser, messagesRef,mutedlist,setismute,setMessagestest,message,storeMessageInSQLite,setmutedList,setUsersMain,host,customSounds, setCustomSounds }) => {
    const location = useLocation();
    const history = useHistory();
const localchat_messages=useRef()
    //const { socket,messages,setMessages,saveMessage,setSelectedUser } = useWebSocket(); // Use WebSocket context methods
    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);
    const [loading, setLoading] = useState(false);
    // State to hold media files
    const [showFileOptions, setShowFileOptions] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [showMediaPreview, setShowMediaPreview] = useState(false);
    const imageVideoInputRef = useRef(null);
    let { userdetails,currentUserId } = location.state || {};
    const [messages1, setMessages1] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null); // Add this line
    const [uploadProgress, setUploadProgress] = useState(0);
const[isDownloading,setisDownloading] = useState(false)
    const [user,setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);
    const videoRef = useRef(null);
    const [fullscreenImage, setFullscreenImage] = useState(null); // State for fullscreen image
   // Tracks downloading status
    const [previewVideo, setPreviewVideo] = useState(null); // Tracks video preview state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [mediaFiles, setMediaFiles] = useState([]); // Store selected image/video files
    const [showPreview, setShowPreview] = useState(false); // Toggle to show/hide preview
    const previewref = useRef(false);
    const [downloading, setDownloading] = useState({});
    const [uploadingFiles, setUploadingFiles] = useState({});
const [downloadingFiles, setDownloadingFiles] = useState({});
    // Fetch and filter messages based on user ID
    const [loadingMessages, setLoadingMessages] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedTab, setSelectedTab] = useState('images'); // Default to 'images' tab
    const [showAll, setShowAll] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isInView, setIsInView] = useState(true);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
const [isArchive,setIsarcivehs]=useState(false);
    const buttonRef = useRef(null);
    const [showOptions, setShowOptions] = useState(false);
    const [fileUploadError, setFileUploadError] = useState(false);
    const [fileDownloadError, setFileDownloadError] = useState(false);
const [prodilepicBIg,setprodilepicBIg]=useState(false);
const [isloading,setIsloading] = useState(false);
    const [selectedChats, setSelectedChats] = useState([]);
        const [selectionMode, setSelectionMode] = useState(false);

const [selectionModeFile, setSelectionModeFile] = useState(false);

    // Filter and limit the number of files shown (max 10 images)
    const MuteIcon = BellOffIcon;
    const UnmuteIcon = BellIcon;
    const CustomBellIcon = SettingsIcon;
const topMessageRef = useRef(null);


 


const [isRecording, setIsRecording] = useState(false);

let pressTimer = useRef(null);
const [isPaused, setIsPaused] = useState(false);
 
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // seconds
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioRef = useRef(null);
useEffect(() => {
  const backHandler = CapacitorApp.addListener('backButton', () => {
    selectedUser.current = null; // Clear selected user
    history.push('/home'); // or history.push('/home') if you want to allow back to Chatwindo later
  });

  return () => {
    backHandler.remove();
  };
}, [history]);



const handlePressStart2 = () => {
  // Start a timer to detect long press (e.g., 500ms)
  pressTimer.current = setTimeout(() => {
    setIsRecording(true); // start recording
  }, 1500)//lng press duration threshold
};

const handlePressEnd2 = () => {
  // Clear timer, stop recording if it was started
  if (pressTimer.current) {
    clearTimeout(pressTimer.current);
  }

  if (isRecording) {
    setIsRecording(false); // stop recording on release
  }
};


const fetchupdateuser = async(user) =>{

}
const handlePressCancel = () => {
  // Clear timer if pointer leaves button area before long press
  if (pressTimer.current) {
    clearTimeout(pressTimer.current);
  }
};

const handleCancelRecording = () => {
    //console.log("Recording cancelled");
  // if (mediaRecorder && mediaRecorder.state !== 'inactive') {
  //   mediaRecorder.stop();  // stop MediaRecorder if recording
  // }

  setIsRecording(false);    // exit recording mode
//  setRecordedBlob(null);    // clear recorded audio
  //setAudioChunks([]);       // clear chunks
  //setIsPaused(false);       // reset pause state if any
 // setIsPlaying(false);      // reset play state if any
  //setSeekValue(0);          // reset seek bar if you use it
 // setRecordingTime(0);      // reset timer
};


    const toggleOptions = () => {
      setShowOptions(prev => !prev);
    };
  
    const handleShare = () => {
      //console.log("Share clicked");
      setShowOptions(false);
    };
  
    const handleEditContact = () => {
      //console.log("Edit Contact clicked");
      setShowOptions(false);
    };

     const timeoutRef = useRef(null);
    

      const handlePressStart = (message) => {
        timeoutRef.current = setTimeout(() => {
          //console.log('Long press detected',message);
          setSelectionMode(true);
          toggleSelect(message);
        }, 600); // Long press after 600ms
      };
    

     

 
const handlePickMedia = async () => {
  if (window.Capacitor && Capacitor.getPlatform() === 'android') {
    try {
       const detail = await new Promise((resolve) => {
        const handler = (e) => {
          window.removeEventListener("MediaSelected", handler);
          resolve(e.detail); // this is what your native layer sends
        };
        window.addEventListener("MediaSelected", handler);
        window.NativeAds.pickMediaFile(); // trigger native media picker
      });

      console.log("picked uri", detail);

      const nativePath = await new Promise((resolve, reject) => {
        window.FilePath.resolveNativePath(detail.uri, resolve, reject);
      });

      console.log("nativePath", nativePath);

  const fileInfo = await new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(nativePath, (fileEntry) => {
          fileEntry.file((file) => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type || guessMimeType(file.name),
              path:nativePath,
              fileObject: file,
            });
          }, reject);
        }, reject);
      });
//console.log("fileInfo",fileInfo)
      const mockEvent = {
        target: {
          files: [fileInfo], // send as array like in handlePickDocument
        },
      };
      //console.log("mockEvent",mockEvent)

      handleMediaSelect(mockEvent);
    } catch (error) {
      console.error('Cordova Media Picker Error:', error);
    }
  } else {
    // Fallback input click
    if (mediaInputRef?.current) mediaInputRef.current.click();
  }
};

 async function getBlobURLFromPath(filePath) {
  if (!filePath) throw new Error("File path is required");

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching blob from path:", error);
    throw error;
  }
}

const handlePickDocument = async () => {
  if (window.Capacitor && Capacitor.getPlatform() === 'android') {
    try {
      // Step 1: Let user pick a file using cordova-plugin-chooser
      const result = await new Promise((resolve, reject) => {
      window.chooser.getFile(resolve, reject);
    });

    const uri = result.uri;
  

    // Step 2: Get file info from your plugin
    const fileInfoFromPlugin = await ffmpeg_thumnail.getFileInfo({ uri });

    // Step 3: Build the file info object (spread plugin result)
    // Guess MIME type if not provided (simple example)
    const guessMimeType = (name) => {
      if (!name) return 'application/octet-stream';
      const ext = name.split('.').pop().toLowerCase();
      switch (ext) {
        case 'pdf': return 'application/pdf';
        case 'txt': return 'text/plain';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        default: return 'application/octet-stream';
      }
    };

    const fileInfo = {
      name: fileInfoFromPlugin.name || 'unknown',
      size: fileInfoFromPlugin.size || 0,
      type: fileInfoFromPlugin.type || guessMimeType(fileInfoFromPlugin.name),
      path: fileInfoFromPlugin.localPath || fileInfoFromPlugin.uri,
      fileObject: fileInfoFromPlugin.fileObject || null,
    };

    // Step 4: Prepare the mock event with one file
    const mockEvent = {
      target: {
        files: [fileInfo],
      },
    };

    console.log("📤 Dispatching to handleFileSelection:", mockEvent);
     handleFileSelection(mockEvent); // Call your handler here


    } catch (err) {
      console.error("❌ Error picking document:", err);
    }
  } else {
    // Fallback for web
    if (fileInputRef?.current) {
      fileInputRef.current.click();
    }
  }
};



// Helper: Guess filename from URI (if nothing else works)
// Helper: Basic MIME type guess based on extension
function guessMimeType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  return map[ext] || 'application/octet-stream';
}



      const handleScroll = () => {
        const el = scrollRef.current;
  
        if (!el) return;
   
        // Because of flex-col-reverse, bottom = top visually
        const tops = el.scrollTop + el.scrollHeight - 15;
     
        if (tops <= el.clientHeight) {
          console.log("🚀 Load more messages...");
         loadMoreMessages();
        }
      };


        const loadMoreMessages = async () => {
          
          const el = scrollRef.current;
const prevScrollTop = el.scrollTop;

          // Fetch older messages (e.g., +45)
        //  await fetchMoreFromBackend(); // You implement this
        if (isPlatform('hybrid')) {
          // Load the next 45 messages (use the correct offset for pagination)
          const newMessages = await getMessagesFromSQLite(db, userdetails, 45, messages1.length);
  
       //   setMessages1(prevMessages => [...newMessages, ...prevMessages]); // Prepend the messages (since you're loading older messages)
          if (newMessages.length > 0) {
            setMessages1(prevMessages => {
              const updatedMessages = [...newMessages, ...prevMessages];
      
              // ✅ Sync the ref if total is still < 91
              if (updatedMessages.length < 91) {
                messagesRef.current = [...newMessages, ...messagesRef.current];
                setMessagestest(prev => [...newMessages, ...prev]);
                    // Save local message early for optimistic UI
                 setMessages(prev => [...newMessages, ...prev]);
              }
      
              return updatedMessages;
            });

            localchat_messages.current = [...newMessages, ...localchat_messages.current];
      setTimeout(() => {
        el.scrollTop = prevScrollTop;
      }, 50); // Adjust delay if needed
   
          }

          // setTimeout(() => {
          //   const newScrollHeight = el.scrollHeight;
          //   el.scrollTop = newScrollHeight - previousScrollHeight;
          // }, 50); // 50-100ms usually safe
        }
   

          // Delay to ensure DOM updates
        
        };
        const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]; // remove `data:audio/...;base64,`
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

const SendAudio_base = async (audioBlob) => {
  return new Promise((resolve, reject) => {
    const folderPath = window.cordova?.file?.externalRootDirectory + "Music/Swipe/";
    const fileName = `audio_${Date.now()}.mp3`;

    // Ensure Swipe subfolder exists
    window.resolveLocalFileSystemURL(folderPath, (dirEntry) => {
      saveToFile(dirEntry);
    }, (err) => {
      // Create the folder if it doesn't exist
      window.resolveLocalFileSystemURL(
        window.cordova?.file?.externalRootDirectory + "Music/",
        (musicDir) => {
          musicDir.getDirectory("Swipe", { create: true }, (dirEntry) => {
            saveToFile(dirEntry);
          }, reject);
        },
        reject
      );
    });

    function saveToFile(dirEntry) {
      dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
          fileWriter.onwriteend = () => {
            // Optional: trigger media scan
            if (window.MediaScannerConnection) {
              window.MediaScannerConnection.scanFile(fileEntry.nativeURL);
            }

            resolve({
              name: fileName,
              size: audioBlob.size,
              path: fileEntry.toURL(),
              type: 'audio/mp3',
            });
          };

          fileWriter.onerror = (err) => {
            console.error('Write failed:', err);
            reject(err);
          };

          fileWriter.write(audioBlob);
        }, reject);
      }, reject);
    }
  });
};



        const SendAudio = async (audioBlob) => {
const token = localStorage.getItem('token');
            const messageId = generateMessageId(user._id);
  const timestamp = new Date().toISOString();
  let isError = 0;

      const path = await SendAudio_base(audioBlob);
  //console.log("file when sending",path)

  // Base message shared by both ws and local
  const baseMessage = {
    id: messageId,
    sender: user._id,
    recipient: userdetails.id,
    content: null,
    timestamp,
    status: "pending",
    read: 0,
    isDeleted: 0,
    type: "file",
    file_name: path.name,
    file_type: 'audio/mp3', // Assuming audio file type

    file_size: path.size,
    isError: 0,
    isSent: 0,
  };

  const localPath = path.path || path.uri || path.name;
  const localMessage = {
    ...baseMessage,
    isDownload: 1,
    file_path: localPath,
    thumbnail: null,
  };

  const wsMessage = {
    ...baseMessage,
    isDownload: 0,
    file_path: null,
    thumbnail: null,
  };

  try {
    // Show UI loading states
    setUploadingFiles(prev => ({ ...prev, [path.name]: true }));
    setLoadingMessages(prev => ({ ...prev, [messageId]: true }));
    setisDownloading(prev => ({ ...prev, [messageId]: true }));

    // Save local message early for optimistic UI
    setMessages(prev => [...prev, localMessage]);
    setMessagestest(prev => [...prev, localMessage]);
    messagesRef.current = [...messagesRef.current, localMessage];
    setMessages1(prev => [...prev, localMessage]);

    // Upload file and get signed URL
    const signedUrl = await uploadFile(path,token);

    // Validate the response strictly
    if (!signedUrl || typeof signedUrl.uploadUrl !== 'string' || !signedUrl.uploadUrl.trim()) {
      throw new Error("❌ Invalid signed URL received from uploadFile");
    }
    

    wsMessage.file_path = signedUrl.uploadUrl;

    if(localMessage.isError == 0  && signedUrl.uploadUrl != null){
  const result = await saveMessage(wsMessage);
  //console.log("result",result)
  if (result?.status === 'sent') {
    localMessage.isSent = 1;
    localMessage.isError = result.message.isError;
  } else {
    localMessage.isSent = 0;
    localMessage.isError = result.message.isError;
  }
  
}else{
  localMessage.isSent = 0;
  localMessage.isError = 1;
}


        }catch (err) {
            console.error(`❌ Error processing file: ${path.name}`, err);
   
    localMessage.isError = 1;
    localMessage.isSent =  0;
    //console.log("localMessage",localMessage)
    setFileUploadError(true);

        }finally{
          
  setMessages(prev => [...prev.filter(m => m.id !== messageId), localMessage]);
    setMessagestest(prev => [...prev.filter(m => m.id !== messageId), localMessage]);
    messagesRef.current = messagesRef.current.map(m =>
      m.id === messageId ? localMessage : m
    );
    setMessages1(prev => [...prev.filter(m => m.id !== messageId), localMessage]);
    //console.log("local message",messages1)
    // Save to local storage
    if (isPlatform('hybrid')) {
      //console.log("Saving to SQLite:", db);

      try{
      await storeMessageInSQLite(db, localMessage);

          setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[path.name];
      return updated;
      
    });
    setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
    setisDownloading(prev => ({ ...prev, [messageId]: false }));
  }catch(error){
    //console.log("error in saving to sqlite",error)
  setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[path.name];
      return updated;
      
    });
    setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
    setisDownloading(prev => ({ ...prev, [messageId]: false }));
  }
    } else {
      //console.log("before saving",localMessage)
      const messages = JSON.parse(localStorage.getItem("messages")) || [];
      messages.push(localMessage);
      localStorage.setItem("messages", JSON.stringify(messages));
          setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[path.name];
      return updated;
    });
    setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
    setisDownloading(prev => ({ ...prev, [messageId]: false }));

    }

    // Reset loading states

    //console.log(`✅ Finished processing file: ${path.name}`);
        }}
        

      
    
      const handlePressEnd = () => {
        clearTimeout(timeoutRef.current);
      };
      const toggleSelect = (message) => {
        //console.log('Toggling selection for message:', message.id, selectedChats);
      
        const updatedSelectedChats = selectedChats.some(selectedMessage => selectedMessage.id === message.id)
          ? selectedChats.filter(selectedMessage => selectedMessage.id !== message.id) // Unselect if already selected
          : [...selectedChats, message]; // Select the message if not selected
      
        setSelectedChats(updatedSelectedChats);
      
        // Exit selection mode if no message is selected
        if (updatedSelectedChats.length === 0) {
          setSelectionMode(false);
        }
      };
      
  const handleCopy = async () => {
  if (!selectedChats || selectedChats.length === 0) {
    //console.log('No message selected for copying.');
    return;
  }

  if (selectedChats.length > 1) {
    alert('You can only copy one message at a time.');
    return;
  }

  const message = selectedChats[0];
  if (message.type !== 'messages') {
    alert('Only text messages can be copied.');
    return;
  }

   navigator.clipboard.writeText(message.content)
    .then(() => {
   
      //console.log('Message copied to clipboard:', message.content);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
           await Toast.show({
      text: 'Copied to clipboard',
      duration: 'short',
    });
};

      const handleDelete = async () => {
  try {
    if (!selectedChats || selectedChats.length === 0) {
      //console.log('No chat messages selected for deletion.');
      return;
    }
   

    const messageIds = selectedChats.map(chat => chat.id);

    // Platform detection


    if (isPlatform('hybrid')) {
        const recipientOnlyIds = [];

      // Hybrid: Delete from Cordova SQLite
      messageIds.forEach(id => {
        db.transaction(tx => {
          tx.executeSql(
            'DELETE FROM messages WHERE id = ?',
            [id],
            () => //console.log(`Deleted message ${id} from SQLite`),
            (tx, error) => console.error(`SQLite delete error: ${error.message}`)
          );
        });
      });
    } else {
      // Web: Delete from localStorage
      const stored = localStorage.getItem('messages');
      if (stored) {
        const messages = JSON.parse(stored);
        const updated = messages.filter(msg => !messageIds.includes(msg.id));
        localStorage.setItem('messages', JSON.stringify(updated));
        //console.log('Messages removed from localStorage');
      }
    }

    // Remove from refs
    if (localchat_messages.current) {
      localchat_messages.current = localchat_messages.current.filter(
        msg => !messageIds.includes(msg.id)
      );
    }

  
  if (messagesRef.current) {
    messagesRef.current = messagesRef.current.filter(msg => {
      if (messageIds.includes(msg.id)) {
        if (msg.recipient === userdetails.id) {
          recipientOnlyIds.push(msg.id);
        }
        return false;
      }
      return true;
    });
  }
        const updatePayload = {
                    type: 'update',
                    updateType: 'delete',
                    messageIds:recipientOnlyIds,
                    sender,
                    recipient
                  };
    socket.send(JSON.stringify(updatePayload));
    setSelectedChats([]);
          await Toast.show({
      text: 'Messages deleted successfully',
      duration: 'short',
    });

    //console.log("Selected messages deleted successfully.");
  } catch (error) {
    console.error("Error deleting selected messages:", error);
  }
};


      
      const handleForward = () => {
        // Logic to forward selected messages or users
        //console.log('Forward action triggered.',selectedChats);
       history.push('/forwardScreen', { forwardedMessages: selectedChats });
        // Example: open a forward modal or navigate to a forward page
      };
    
      const handleClick = (message) => {
        if (selectionMode) {
          //console.log('Selection mode active', selectionMode);
          toggleSelect(message); // If already in selection mode, click means select/unselect
        } else {
          //console.log('Selection mode active not', selectionMode);
        
        }
      };
    
      const isSelected = (message) => selectedChats.some(selectedMessage => selectedMessage.id === message.id)
    // Handle the click event to expand/collapse the header


    const toggleHeader = () => {
      //console.log("toggleHeader");
      setIsExpanded(!isExpanded);
    }
    const toglebigscreen = () => {
      //console.log("toglebigscreen");
      setprodilepicBIg(!prodilepicBIg)
      //console.log("prodilepicBIg",prodilepicBIg);
    }
    const getMessagesFromSQLite = async (db, userdetail, limitPerUser, offset = 0) => {
      return new Promise((resolve, reject) => {
        // Step 1: Get the list of other users
        //console.log("Fetching messages for user:", JSON.stringify(userdetail)); // Log start of fetching messages
    
        db.transaction(tx => {
          tx.executeSql(
            `SELECT DISTINCT CASE
                                 WHEN sender = ? THEN recipient
                                 ELSE sender
                               END AS other_userid
             FROM messages
             WHERE sender = ? OR recipient = ?`,
            [userdetail.id, userdetail.id, userdetail.id],
            (tx, results) => {
              const otherUserIds = [];
              for (let i = 0; i < results.rows.length; i++) {
                otherUserIds.push(results.rows.item(i).other_userid);
              }
    
              //console.log("Other userIds fetched:", JSON.stringify(otherUserIds)); // Log the userIds fetched
    
              // Step 2: Fetch the latest messages between the currentUser and each other user
              const messagesPromises = otherUserIds.map(userId =>
                new Promise((resolveMessages, rejectMessages) => {
                  tx.executeSql(
                    `SELECT id, sender, recipient, content, timestamp, status, read
                     FROM messages
                     WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
                     ORDER BY timestamp DESC
                     LIMIT ? OFFSET ?`,
                    [userdetail.id, userId, userId, userdetail.id, limitPerUser, offset],
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
                          read: row.read === 1, // Convert read flag back to boolean
                          isDownload: row.isDownload,
                          isDeleted: row.isDeleted,
                          type: row.type,
                          file_type: row.file_type,
                          file_name: row.file_name,
                          file_path: row.file_path,
                          file_size: row.file_size,
                          isSent: row.isSent,
                          isError: row.isError,
                          thumbnail: row.thumbnail,
                          encryptedMessage: row.encryptedMessage,
                          encryptedAESKey: row.encryptedAESKey

                        });
                      }
                      //console.log(`Messages for user ${userId}:`, JSON.stringify(messages)); // Log the messages for each user
                      resolveMessages(messages);
                    },
                    (tx, error) => {
                      console.error("Error fetching messages for user", userId, JSON.stringify(error)); // Log errors specific to each user fetch
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
                  // Sort messages by timestamp ASC
                  flatMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
                  //console.log("All messages fetched and sorted:", JSON.stringify(flatMessages)); // Log the final sorted messages
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
    
 

    useEffect(() => {
      
    console.error = () => {};
        const fetchFilteredMessages = async () => {
        setIsloading(true)
          try{
           const mainuser = JSON.parse(localStorage.getItem('currentuser'));
       //console.log("this should not run when recived");
            setCurrentUser(mainuser);
            const userId = mainuser?._id;
         //console.log(userdetails)
            setIsarcivehs(userdetails.isArchive);

         

       const seenIds = new Set();
const filteredMessages = messagesRef.current
  .filter(msg => msg.sender === userdetails.id || msg.recipient === userdetails.id)
  .filter(msg => {
    if (seenIds.has(msg.id)) return false;
    seenIds.add(msg.id);
    return true;
  });

         
         console.log("filteredMessages",filteredMessages)
  
            setMessages1(filteredMessages);
            localchat_messages.current = filteredMessages
            for (const msg of filteredMessages) {
              if ( msg.isSent === 0 && msg.isError === 0 && msg.sender !== userdetails.id) {
                try {
                  if (socket && socket.readyState === WebSocket.OPEN) {
                    const sentmsg = { ...msg, messageId: msg.id, isSent: 1 };
console.log("sending message",JSON.stringify(sentmsg))
                    await socket.send(JSON.stringify(sentmsg));
                
                    // Mark as sent
                    msg.isSent = 1;
                    msg.isError = 0;
                    updateMessageForSent(msg);     
            
                    // Update in reference array
                    localchat_messages.current = localchat_messages.current.map((message) =>
                      message.id === msg.id ? { ...message, isSent: 1,isError: 0 } : message
                    );
                    messagesRef.current = messagesRef.current.map((message) =>
                      message.id === msg.id ? { ...message, isSent: 1, isError: 0 } : message
                    );
                  } else {
                    // Socket not ready, do nothing (no isError update)
                    //console.log("Socket not open for message:", msg.id);
                  }
            
                } catch (error) {
                  console.error("Error sending message:", error);
                  // Still no isError update as per your logic
                }
              }
            }
            
            if (filteredMessages.length > 0) {
           
              const unreadMessages = filteredMessages.filter((msg) => msg.read === 0 && msg.sender === userdetails.id);
          

             
              if (unreadMessages.length > 0) {
                
                const pairs = new Map();
                unreadMessages.forEach((msg) => {
                  const pairKey = `${msg.sender}-${msg.recipient}`;
                  if (!pairs.has(pairKey)) {
                    pairs.set(pairKey, { sender: msg.sender, recipient: msg.recipient, messageIds: [] });
                  }
                  pairs.get(pairKey).messageIds.push(msg.id);
                });
  
                pairs.forEach(({ sender, recipient, messageIds }) => {
                  const updatePayload = {
                    type: 'update',
                    updateType: 'unread',
                    messageIds,
                    sender,
                    recipient
                  };
              
//console.log("unread message from chatwindf")
              
                  // Send update type message through WebSocket
                  socket.send(
                    JSON.stringify({
                      updatePayload,
                    })
                  );
                });
          
                // Check the platform (Android, iOS, or Hybrid) and update accordingly
    
                  // If on Android, iOS, or Hybrid (web-based in this case), update the SQLite database
                  if (isPlatform('hybrid')) {
                    const messageIds = unreadMessages.map(msg => msg.id);

                    //console.log("Android: updating read status for messages", messageIds);

                    const query = `
                      UPDATE messages
                      SET read = 1
                      WHERE id IN (${messageIds.map(() => '?').join(',')})
                    `;
                  
                    db.transaction(tx => {
                      tx.executeSql(
                        query,
                        messageIds,
                        (_, result) => {
                          //console.log(`✅ Updated read status for ${result.rowsAffected} message(s)`);
                        },
                        (_, error) => {
                          console.error("❌ Error updating message read status:", error);
                          return false;
                        }
                      );
                    });
                  } else {
                 //console.log("Web: updating read status for messages", unreadMessages);
                    // For Web (hybrid), update in localStorage
                    unreadMessages.forEach((messageObj) => {
                      const { id } = messageObj;
                  //console.log("id",id)
                      const message = filteredMessages.find((msg) => msg.id === id);
                     
                  
                      if (message) {
                          // Retrieve stored messages from localStorage
                          const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
                  
                          // Update the read status
                          const updatedMessages = storedMessages.map((msg) =>
                              msg.id === id ? { ...msg, read: 1 } : msg
                          );
                  
                          // Save updated messages back to localStorage
                          //saveMessagesToLocalStorage(updatedMessages,"from chatwindo");
                          //console.log("Messages updated in localStorage:", updatedMessages);
                         localStorage.setItem('messages', JSON.stringify(updatedMessages));
                        
                      } else {
                          console.warn(`Message with ID: ${id} not found in filteredMessages.`);
                      }
                  });
                  }
                
          
                // Set unread count for respective sender to 0
                const senderId = unreadMessages[0].sender;
               
                setMessages1((prevMessages) =>
                  prevMessages.map((msg) =>
                    Array.isArray(unreadMessages.id) && unreadMessages.id.includes(msg.id)
                      ? { ...msg, read: true }
                      : msg
                  )
                );
                
            
                localchat_messages.current = localchat_messages.current.map((msg) =>
                  msg.sender === senderId ? { ...msg, read: 1 } : msg
                );
             
              }
            }
          
          }
          catch(error){
            

            //console.log("error in chatwindo while fetchfiltering",JSON.stringify(error))
          }
           
        };

            const updateuser = async () => {
  const savedUsers = JSON.parse(localStorage.getItem('usersMain')) || [];

  // 1. Find the user matching userdetails.id
  const targetUser = savedUsers.find(u => u.id === userdetails.id);
  if (!targetUser) {
    console.warn("User not found in localStorage");
    return;
  }

  // 2. Build timestamps payload
  const timestamps = [{
    id: targetUser.id,
    updatedAt: targetUser.updatedAt || new Date(0).toISOString()
  }];

  try {
    // 3. Make the request to backend
    const response = await fetch(`${host}/user/alluser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Auth': localStorage.getItem('token'),
      },
      body: JSON.stringify({ timestamps })
    });

    // 4. Handle response
    if (response.ok) {
      const data = await response.json();
      const { userDetails, currentUserId } = data;

      if (userDetails.length === 0) {
        // No updates found
        return;
      }

      // 5. Update local usersMain
      const updatedUserMap = new Map(userDetails.map(u => [u.id, u]));
      const mergedUsers = savedUsers.map(user => {
        const updated = updatedUserMap.get(user.id);
        if (!updated) return user;

        return {
          ...user,
          name: updated.name ?? user.name,
          email: updated.email ?? user.email,
          gender: updated.gender ?? user.gender,
          unreadCount: 0,
          dob: updated.dob ?? user.dob,
          location: updated.location ?? user.location,
          updatedAt: updated.updatedAt ?? user.updatedAt,
          avatar: updated.profilePic || user.avatar || 'default.jpg',
          About: updated.About || user.About,
          publicKey: updated.publicKey || user.publicKey,
        };
      });

      // 6. Save updated users
      localStorage.setItem('usersMain', JSON.stringify(mergedUsers));

      // 7. Update state
      setUsersMain(mergedUsers);

      userdetails = mergedUsers.find(u => u.id === userdetails.id);
    } else {
      console.error("Failed to fetch updated user data");
    }
  } catch (err) {
    console.error("Error updating user:", err);
  }
};

 const getkey = async () => {
  let key = userdetails.publicKey;

  if (!key) {
    try {
      const response = await fetch(`https://${Maindata.SERVER_URL}/user/getPublicKey/${userdetails.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Auth': localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (data.success && data.publicKey) {
        key = data.publicKey;

        // Update localStorage usersMain
        let usersMain = JSON.parse(localStorage.getItem("usersMain")) || [];

        // If it's a single user object, convert to array
        if (!Array.isArray(usersMain)) {
          usersMain = [usersMain];
        }

        const updatedUsers = usersMain.map(user => {
          if (user.id === userdetails.id) {
            return { ...user, publicKey: key };
          }
          return user;
        });

        localStorage.setItem("usersMain", JSON.stringify(updatedUsers));
        // Optionally: update userdetails in your state/UI too
        setUsersMain(updatedUsers);
        userdetails.publicKey = key;
      }
    } catch (error) {
      console.error("Failed to fetch public key:", error);
    }
  }

  return key;
};

 getkey();
  updateuser()
        fetchFilteredMessages();


    
        
       

    setIsloading(false)



        const storedUsers = JSON.parse(localStorage.getItem('usersMain') || '[]');

// Update only the matched user's unread count
const updatedUsers = storedUsers.map(user => 
  user.id === userdetails.id 
    ? { ...user, unreadCount: 0 } 
    : user
);

// Update local state


// Save back to localStorage
localStorage.setItem('usersMain', JSON.stringify(updatedUsers));

        setUsersMain((prevUsersMain) =>
          prevUsersMain.map((user) =>
            user.id === userdetails.id
              ? { ...user, unreadCount: 0 }  // Change unread count to 0 for the specific user
              : user // Keep other users the same
          )
        );
        
        // Save the updated users back to localStorage

       // localStorage.setItem('usersMain', JSON.stringify(updatedUsers));
          Preferences.set({
                          key: 'usersMain',
                          value: JSON.stringify(updatedUsers),
                        });
      
        

     
    }, [ messagesRef.current]); // Add socket as a dependency
    // useEffect(() => {
    //   if (videoRef.current) {
    //     // Initialize Plyr for both web and Android using WebView
    //     new Plyr(videoRef.current);
    //   }
  
    //   return () => {
    //     // Clean up Plyr instance on unmount
    //     if (videoRef.current && videoRef.current.plyr) {
    //       videoRef.current.plyr.destroy();
    //     }
    //   };
    // }, []);
    // Scroll to the bottom initially and whenever messages change

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // }, [messages1,localchat_messages.current]);


    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, []);
    useEffect(() => {
      if (videoRef.current) {
        // Initialize Plyr for both web and Android using WebView
        new Plyr(videoRef.current);
      }
  
      return () => {
        // Clean up Plyr instance on unmount
        if (videoRef.current && videoRef.current.plyr) {
          videoRef.current.plyr.destroy();
        }
      };
    }, []);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
      const mutedUsers = JSON.parse(localStorage.getItem('mutedUsers')) || [];
      if (mutedUsers.includes(userdetails.id)) {
        setIsMuted(true);
      }
    }, [userdetails]);


useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 1.0 });

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }

    return () => {
      if (messagesEndRef.current) {
        observer.unobserve(messagesEndRef.current);
      }
    };
  }, []);

  // Scroll to the messagesEndRef when the button is clicked
  const scrollToMessages = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const updateMessageForSent = async (message) => {
    if (isPlatform('hybrid')) {
      // Hybrid platform (e.g., mobile app with Capacitor or Cordova)
      console.info('Updating message for sent:', message);
      try {
        const defaultValues = {
          isSent: 1,
          isError: 0,
          isDeleted: 0,
          isDownload: 0,
          content: '',
          file_name: '',
          file_type: null,
          file_size: 0,
          thumbnail: null,
          file_path: '',
          timestamp: new Date().toISOString(),
          status: 'pending',
          read: 0,
          encryptedMessage: '',
          encryptedAESKey: '',
          type: 'text',
          eniv: ''
        };

        const updatedMessage = {
          id: message.id,
          sender: message.sender,
          recipient: message.recipient,
          content: message.content || defaultValues.content,
          timestamp: message.timestamp || defaultValues.timestamp,
          status: message.status || defaultValues.status,
          read: message.read !== undefined ? message.read : defaultValues.read,
          isDeleted: message.isDeleted !== undefined ? message.isDeleted : defaultValues.isDeleted,
          isDownload: message.isDownload !== undefined ? message.isDownload : defaultValues.isDownload,
          file_name: message.file_name || defaultValues.file_name,
          file_type: message.file_type || defaultValues.file_type,
          file_size: message.file_size !== undefined ? message.file_size : defaultValues.file_size,
          thumbnail: message.thumbnail || defaultValues.thumbnail,
          file_path: message.file_path || defaultValues.file_path,
          isError: message.isError !== undefined ? message.isError : defaultValues.isError,
          isSent: message.isSent !== undefined ? message.isSent : defaultValues.isSent,
          encryptedMessage: message.encryptedMessage || defaultValues.encryptedMessage,
          encryptedAESKey: message.encryptedAESKey || defaultValues.encryptedAESKey,
          type: message.type || defaultValues.type,
          eniv: message.eniv

        };
        // Update message in SQLite (Cordova/Capacitor app)
     // Assume you have a function that opens the SQLite database
        const updateQuery = `
          UPDATE messages SET
            content = ?, 
            timestamp = ?, 
            status = ?, 
            read = ?, 
            isDeleted = ?, 
            isDownload = ?, 
            file_name = ?, 
            file_type = ?, 
            file_size = ?, 
            thumbnail = ?, 
            file_path = ?, 
            isError = ?, 
            isSent = ?,
            type = ?,
            encryptedMessage = ?,
            encryptedAESKey = ?,
            eniv = ?
          WHERE id = ?
        `;
  
        const values = [
          updatedMessage.content, 
          updatedMessage.timestamp, 
          updatedMessage.status, 
          updatedMessage.read, 
          updatedMessage.isDeleted, 
          updatedMessage.isDownload, 
          updatedMessage.file_name, 
          updatedMessage.file_type, 
          updatedMessage.file_size, 
          updatedMessage.thumbnail, 
          updatedMessage.file_path, 
          updatedMessage.isError, 
          updatedMessage.isSent, 
          updatedMessage.type,
          updatedMessage.encryptedMessage,
          updatedMessage.encryptedAESKey,
          updateMessage.eniv,
          updatedMessage.id

        ];
  
        await db.executeSql(updateQuery, values);
        //console.log("Updated message in SQLite:", message);
      } catch (err) {
        console.error("Error updating message in SQLite:", err);
      }
    } else if (isPlatform('web')) {
      // Web platform (e.g., desktop or browser)
      try {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        
        // Update the message in the localStorage array of messages
        const updatedMessages = messages.map(msg => {
          if (msg.id === message.id) {
            return {
              ...msg,
              content: message.content || msg.content,
              timestamp: message.timestamp || msg.timestamp,
              status: message.status || msg.status,
              read: message.read !== undefined ? message.read : msg.read,
              isSent: message.isSent !== undefined ? message.isSent : msg.isSent,
              isError: message.isError !== undefined ? message.isError : msg.isError,
              isDeleted: message.isDeleted !== undefined ? message.isDeleted : msg.isDeleted,
              isDownload: message.isDownload !== undefined ? message.isDownload : msg.isDownload,
              file_name: message.file_name || msg.file_name,
              file_type: message.file_type || msg.file_type,
              file_size: message.file_size !== undefined ? message.file_size : msg.file_size,
              thumbnail: message.thumbnail || msg.thumbnail,
              file_path: message.file_path || msg.file_path,
              encryptedMessage: message.encryptedMessage || msg.encryptedMessage,
              encryptedAESKey: message.encryptedAESKey || msg.encryptedAESKey
            };
          }
          return msg;
        });
  
        // Save updated messages back to localStorage
        localStorage.setItem('messages', JSON.stringify(updatedMessages));

  
        //console.log("Updated message in localStorage:", message);
      } catch (err) {
        console.error("Error updating message in localStorage:", err);
      }
    } else {
      console.error("Unsupported platform");
    }
  };
  
const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
};

const toggleMute = () => {
  const mutedUsers = JSON.parse(localStorage.getItem('mutedUsers')) || [];



  if (mutedUsers && mutedUsers.includes(userdetails.id)) {
    // Unmute

    
    const updated = mutedUsers.filter(id => id !== userdetails.id);
    localStorage.setItem('mutedUsers', JSON.stringify(updated));
     Preferences.set({
      key: 'mutedUsers',
      value: JSON.stringify(updated), 
    });
    setmutedList(prev => prev.filter(id => id !== userdetails.id));
    setIsMuted(false);
  } else {
    // Mute
    mutedUsers.push(userdetails.id);
    localStorage.setItem('mutedUsers', JSON.stringify(mutedUsers));
         Preferences.set({
      key: 'mutedUsers',
      value: JSON.stringify(updated), 
    });
    setmutedList(prev => prev.filter(id => id !== userdetails.id));
    setIsMuted(true);
  }
};
const sound = customSounds.find(item => item.senderId === userdetails.id);



// const displayedImages = localchat_messages.current && localchat_messages.current.filter((msg) => msg.file_type === "image")
// .current.filter((msg) => msg.file_type === "image")
// .slice(0, 10);

const handleViewAll = () => {
setShowAll(true); // Navigate to Media Section
};

// Helper to pick a file (sound file) using HTML input
function pickAudioFile() {
  return new Promise((resolve, reject) => {
    // Open native file chooser to pick audio files only
    window.FileChooser.open(
      { mime: 'audio/*' }, 
      uri => {
        // Resolve content:// or file:// URI to native file path
        window.FilePath.resolveNativePath(
          uri,
          nativePath => {
            //console.log('Native file path:', nativePath);
            // Extract filename from native path
            const fileName = nativePath.split('/').pop();

            // Return an object with nativePath and fileName
            resolve({ nativePath, fileName });
          },
          err => {
            console.error('Error resolving native path:', err);
            reject(err);
          }
        );
      },
      err => {
        console.error('Error picking file:', err);
        reject(err);
      }
    );
  });
}

const handleCustomNotification = async () => {
  try {
    const file = await pickAudioFile();

    if (!file) return;

    // file is { nativePath, fileName }
    const { nativePath, fileName } = file;

    // Ask for the sender ID (or 'default')
    const senderId = userdetails.id;

    if (!senderId) {
      alert("Sender ID is required");
      return;
    }

    // Save/update the mapping in localStorage and state directly with native path
    setCustomSounds(prevSounds => {
      let updatedSounds = [...prevSounds];

      const existingIndex = updatedSounds.findIndex(item => item.senderId === senderId);

      if (existingIndex !== -1) {
        // If the senderId exists, replace the sound path
        updatedSounds[existingIndex] = { senderId, soundPath: nativePath, fileName };
      } else {
        // If not, add a new entry
        updatedSounds.push({ senderId, soundPath: nativePath, fileName });
      }

      // Save updated sounds to localStorage and Preferences
      localStorage.setItem('customSounds', JSON.stringify(updatedSounds));
      Preferences.set({
        key: 'customSounds',
        value: JSON.stringify(updatedSounds),
      });

      return updatedSounds;
    });

    alert('Custom notification sound set successfully!');
  } catch (error) {
    console.error('Error handling custom notification:', error);
    alert('Failed to set custom notification sound.');
  }
};


const addEmoji = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.native); // Add the selected emoji to the message input
};
const handleFileDownload = async (message) => {
  if (message.isDownload === 0) {

    //console.log("Downloading file:", message);
    try {
      setDownloading((prevState) => ({
        ...prevState,
        [message.id]: true,
      }));
      setLoadingMessages((prev) => ({ ...prev, [message.id]: true }));
      setisDownloading((prev) => ({ ...prev, [message.id]: true }));

      const response = await fetch(message.file_path);
      if (!response.ok) {
        throw new Error('File download failed');
      }
      const blob = await response.blob();


//console.log("filePath",filePath)
const fileActualPAth = await saveFileToExternalStorage(blob, message.file_name,message.file_type);


      const updatedMessage = {
        ...message,
        isDownload: 1,
        isError: 0, // No error
        file_path: fileActualPAth,
        thumbnail: null,
      };

      setMessages1((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === message.id ? updatedMessage : msg
        )
      );


      localchat_messages.current = localchat_messages.current.map((msg) =>
        msg.id === message.id ? updatedMessage : msg
      );
      
    
      messagesRef.current = messagesRef.current.map((msg) =>
        msg.id === message.id ? updatedMessage : msg
      );

      await updateMessageForSent(updatedMessage);

      setDownloading((prevState) => ({
        ...prevState,
        [message.id]: false,
      }));
      setTimeout(() => {
        setLoadingMessages((prev) => ({ ...prev, [message.id]: false }));
        setisDownloading((prev) => ({ ...prev, [message.id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error downloading file:', error);

      const failedMessage = {
        ...message,
        isDownload: 0,
        isError: 1, // Mark error
      };

      setMessages1((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === message.id ? failedMessage : msg
        )
      );
      localchat_messages.current = localchat_messages.current.map((msg) =>
        msg.id === message.id ? failedMessage : msg
      );

      await updateMessageForSent(failedMessage);

      setDownloading((prevState) => ({
        ...prevState,
        [message.id]: false,
      }));
      setFileDownloadError(true);
      setTimeout(() => {
        setLoadingMessages((prev) => ({ ...prev, [message.id]: false }));
        setisDownloading((prev) => ({ ...prev, [message.id]: false }));
      }, 2000);
    }
  }
};


      const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

     
      
      const updateMessage = (id, updates) => {
        return new Promise((resolve, reject) => {
          if (!id || !updates || Object.keys(updates).length === 0) {
            reject(new Error('Invalid parameters: `id` and `updates` are required.'));
            return;
          }
      
          if (Platform.OS === 'web') {
            try {
              const stored = localStorage.getItem('messages');
              let messages = stored ? JSON.parse(stored) : [];
      
              const index = messages.findIndex((msg) => msg.id === id);
              if (index === -1) {
                reject(new Error('Message not found in localStorage.'));
                return;
              }
      
              messages[index] = { ...messages[index], ...updates };
              localStorage.setItem('messages', JSON.stringify(messages));
              resolve(messages[index]);
            } catch (err) {
              reject(err);
            }
          } else {
            // Native platforms (e.g. Android/iOS) using SQLite
            const fields = Object.keys(updates)
              .map((key) => `${key} = ?`)
              .join(', ');
            const values = Object.values(updates);
      
            const query = `UPDATE messages SET ${fields} WHERE id = ?`;
      
            db.transaction(
              (tx) => {
                tx.executeSql(
                  query,
                  [...values, id],
                  (_, result) => resolve(result),
                  (_, error) => reject(error)
                );
              },
              (error) => reject(error)
            );
          }
        });
      };
      

function encryptWithAES(message, aesKey) {
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message, 'utf8'));
  cipher.finish();
  return {
    iv,
    ciphertext: cipher.output.getBytes()
  };
}

function encryptAESKeyWithRSA(aesKey, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(aesKey, 'RSA-OAEP');
  return forge.util.encode64(encrypted);
}

    const generateMessageId = (userId) => {
//console.log(userId)
      const shortUuid = nanoid(4);

      // Get the current date in YYMMDDHHMM format
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().replace(/[-:T]/g, '').slice(0, 12);


      // Combine nanoid, date, and userId
      return `${shortUuid}${formattedDate}-${userId.slice(-6)}`;
    };

    const sendMessage = async (e) => {
      e.preventDefault();  
      if (newMessage.trim() === '') return;
    
      const idd = generateMessageId(user._id);
      const timestamp = new Date().toISOString();
    
      // 1. Local message object with isError defaulting to 0
      const messageDatalocal = {
        type: 'messages',
        id: idd,
        sender: user._id,
        recipient: userdetails.id,
        content: newMessage,
        timestamp,
        status: 'pending',
        read: 0,
        isDeleted: 0,
        isDownload: 0,
        file_name: null,
        file_type: null,
        file_size: null,
        thumbnail: null,
        file_path: null,
        isError: 0,
        encryptedMessage: '',
        encryptedAESKey: '',
        eniv:''
        
        

      };

      console.log("new message",newMessage)
      console.log("userdetails",userdetails)
const encrptedtext = await encryptMessageHybrid(newMessage, userdetails.publicKey);
 
      try {
        // 2. Prepare and send WS message (no isError here)
        const messageData = {
          ...messageDatalocal,
          messageId: idd, // for WebSocket
          Megtype: 'text',
          encryptedMessage: encrptedtext.ciphertext,
          encryptedAESKey: encrptedtext.encryptedAesKey,
          eniv:encrptedtext.iv
          
        };
        delete messageData.id; // not used in ws
        delete messageData.isError;
    
       const resuke = await  saveMessage(messageData); // <-- Send via WebSocket


       if (resuke?.status === 'sent') {
        // 3. Mark local message as sent
        messageDatalocal.isSent = 1;
        messageDatalocal.isError = 0

      }
      else{
        messageDatalocal.isSent = 0 
        messageDatalocal.isError = resuke.message.isError
      }
        //console.log("✅ Message sent to WebSocket");
    
      } catch (err) {
        console.error("❌ Failed to send message:", err);
    
        // 3. Mark local message as failed
        messageDatalocal.isError = 1;
      }
    
      // 4. Save local regardless (state + ref)
      setMessages1(prev => [...prev, messageDatalocal]);
      
   
      // 5. Clear input
      setNewMessage('');
      scrollToMessages();
    };
    

    const handleBackButton = () => {
    selectedUser.current = null
        history.push('/');
    };



// Helper to convert PEM public key string to ArrayBuffer
function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');
  const binaryString = atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper: convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Main hybrid encryption function
async function encryptMessageHybrid(newMessage, recipientPublicKeyPem) {
  // 1. Import the RSA public key
  const publicKeyBuffer = pemToArrayBuffer(recipientPublicKeyPem);
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  // 2. Generate a random AES-GCM key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 3. Generate a random IV (12 bytes is recommended for AES-GCM)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 4. Encrypt the message using AES-GCM with the generated key and IV
  const encodedMessage = new TextEncoder().encode(newMessage);
  const encryptedMessageBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encodedMessage
  );

  // 5. Export the AES key as raw bytes (to encrypt with RSA)
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

  // 6. Encrypt the AES key with the recipient's RSA public key
  const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  // 7. Convert all parts to base64 strings for easy storage/transmission
  return {
    encryptedAesKey: arrayBufferToBase64(encryptedAesKeyBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encryptedMessageBuffer),
  };
}


// file handling   ///////////////////////////////////////////////////////////////////////////
const handleMediaSelect = (e) => {
  //console.log("media selected version 2",e.target.files)
  const files = Array.from(e.target.files);
  if (!files.length) return;
  // Map to clean file objects with only desired fields
  const cleanedFiles = files.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    path: file.path || '',  // optional, if you have this custom prop
    fileObject: file,       // keep reference to native File if needed for upload
  }));

  setMediaFiles(cleanedFiles);     // Cleaned array with minimal info
  setSelectedMedia(cleanedFiles[0]);  // Start with first cleaned file
  setShowPreview(true);
  setShowMediaPreview(true);
  setActiveMediaIndex(0);
  previewref.current = true;     // Show fullscreen preview
};

const toggleFileOptions = () => {
  setShowFileOptions(!showFileOptions);
};

const handleFileSelection = (e) => {
  const files = Array.from(e.target.files);
  
  const nonMediaFiles = files.filter(
      file => !file.type.startsWith("image/") && !file.type.startsWith("video/")
  );  if (!files.length) return;
  // Map to clean file objects with only desired fields
  const cleanedFiles = files.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    path: file.path || '',  // optional, if you have this custom prop
    fileObject: file,       // keep reference to native File if needed for upload
  }));
  
  if (cleanedFiles.length > 0) {
      processFilesSequentially(cleanedFiles);
  }
};

const processFilesSequentially = async (files) => {
  const token = localStorage.getItem('token');
  for (const file of files) {
      await handleFileProcess(file,token); // This can be sending/uploading
  }
};


const classifyFileType = (file) => {
  const mimeType = file.type; // e.g. 'image/jpeg', 'video/mp4', 'application/pdf'
  const [mainType, subType] = mimeType.split('/');

  if (mainType === 'image') {
    return 'image';
  }

  if (mainType === 'video') {
    return 'video';
  }

  if (mainType === 'audio') {
    return 'audio';
  }

  return mimeType; // e.g. 'application/pdf', 'text/plain'
};


const handleFileProcess = async (file, token) => {
  const messageId = generateMessageId(user._id);
  const timestamp = new Date().toISOString();
  let isError = 0;
  //console.log("file when sending",file)

  // Base message shared by both ws and local
  const baseMessage = {
    id: messageId,
    sender: user._id,
    recipient: userdetails.id,
    content: null,
    timestamp,
    status: "pending",
    read: 0,
    isDeleted: 0,
    type: "file",
    file_name: file.name,
    file_type: ['image', 'video', 'audio'].includes(file.type.split('/')[0])
    ? file.type.split('/')[0]
    : file.type,

    file_size: file.size,
    isError: 0,
    isSent: 0,
  };

  const localPath = file.path || file.uri || file.name;
  const localMessage = {
    ...baseMessage,
    isDownload: 1,
    file_path: localPath,
    thumbnail: null,
    encryptedMessage: '',
    encryptedAESKey: '',
  };

  const wsMessage = {
    ...baseMessage,
    isDownload: 0,
    file_path: null,
    thumbnail: null,
    encryptedMessage: '',
    encryptedAESKey: '',
  };

  try {
    // Show UI loading states
    setUploadingFiles(prev => ({ ...prev, [file.name]: true }));
    setLoadingMessages(prev => ({ ...prev, [messageId]: true }));
    setisDownloading(prev => ({ ...prev, [messageId]: true }));

    // Save local message early for optimistic UI
    setMessages(prev => [...prev, localMessage]);
    setMessagestest(prev => [...prev, localMessage]);
    messagesRef.current = [...messagesRef.current, localMessage];
    setMessages1(prev => [...prev, localMessage]);

    // Upload file and get signed URL
    const signedUrl = await uploadFile(file, token);

    // Validate the response strictly
    if (!signedUrl || typeof signedUrl.fileUrl !== 'string' || !signedUrl.fileUrl.trim()) {
      throw new Error("❌ Invalid signed URL received from uploadFile");
    }
    

    // Generate thumbnail if applicable
  
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
   
      const thumbBlob = await generateCompressedPreview(file);

      wsMessage.thumbnail = thumbBlob.preview;
      localMessage.thumbnail = thumbBlob.preview;
    }


    wsMessage.file_path = signedUrl.fileUrl;
    

    // All success → send to WebSocket

    wsMessage.encryptedMessage = localMessage.encryptedMessage;
    wsMessage.encryptedAESKey = localMessage.encryptedAESKey;
    wsMessage.eniv = localMessage.eniv;

    //console.log("ws message",wsMessage)

if(localMessage.isError == 0  && signedUrl.fileUrl != null){
  const result = await saveMessage(wsMessage);

  if (result?.status === 'sent') {
    localMessage.isSent = 1;
    localMessage.isError = 0;
  } else {
    localMessage.isSent = 0;
    localMessage.isError = result.message.isError;
  }

  

}else{
  localMessage.isSent = 0;
  localMessage.isError = 1;
}

   

  } catch (err) {
    console.error(`❌ Error processing file: ${file.name}`, err);
   
    localMessage.isError = 1;
    localMessage.isSent =  0;
    //console.log("localMessage",localMessage)
    setFileUploadError(true);
    // Update local UI with error version

  } finally {
    setMessages(prev => [...prev.filter(m => m.id !== messageId), localMessage]);
    setMessagestest(prev => [...prev.filter(m => m.id !== messageId), localMessage]);
    messagesRef.current = messagesRef.current.map(m =>
      m.id === messageId ? localMessage : m
    );
    setMessages1(prev => [...prev.filter(m => m.id !== messageId), localMessage]);
    //console.log("local message",messages1)
    // Save to local storage
    if (isPlatform('hybrid')) {
      //console.log("Saving to SQLite:", db);
console.log("localMessage",localMessage)
      try{
      await storeMessageInSQLite(db, localMessage);

          setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[file.name];
      return updated;
      
    });
    setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
    setisDownloading(prev => ({ ...prev, [messageId]: false }));
  }catch(error){
    //console.log("error in saving to sqlite",error)
  setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[file.name];
      return updated;
      
    });
    setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
    setisDownloading(prev => ({ ...prev, [messageId]: false }));
  }
    } else {
      //console.log("before saving",localMessage)
      const messages = JSON.parse(localStorage.getItem("messages")) || [];
      messages.push(localMessage);
      localStorage.setItem("messages", JSON.stringify(messages));
          setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[file.name];
      return updated;
    });
    setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
    setisDownloading(prev => ({ ...prev, [messageId]: false }));
scrollToMessages()
    }

    // Reset loading states

    //console.log(`✅ Finished processing file: ${file.name}`);
  }
};


function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // When the reader has finished reading the blob
    reader.onloadend = () => {
      // Resolve the promise with the Base64-encoded string
      resolve(reader.result);
    };

    // If there was an error reading the blob
    reader.onerror = (error) => {
      reject(error);
    };

    // Start reading the blob as a data URL (Base64)
    reader.readAsDataURL(blob);
  });
}

const uploadFile = async (file, token) => {
 

  try {

    //console.log('✅ Signed URL response:', data);
   const filedata = await getBlobFromPath(file.path);

const uint8View = new Uint8Array(filedata);



    
    // Step 2: Upload the file directly to B2 using the signed URL
  const response = await fetch(`https://${Maindata.SERVER_URL}/messages/upload-to-b2`, {
      method: 'POST',
      headers: {
        'Auth': token,
        'X-Filename': file.name,
    'X-Filesize': file.size.toString(),
     'Content-Type': 'application/octet-stream'
      },
      body: uint8View,
      
    })
 
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    

    const result = await response.json(); // from backend


    return {
      fileId: result.fileId,
      fileName: result.fileName,
      fileUrl: result.fileUrl,
    };

  
  } catch (error) {
    console.error('🚨 Error uploading file:', error?.response?.data || error.message);
  }
};

const getBlobFromPath = async (nativePath) => {

  // If the path starts with "file://", use resolveLocalFileSystemURL
  if (nativePath.startsWith('file://')) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(nativePath, (fileEntry) => {
        fileEntry.file((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result); // ArrayBuffer
          };
          reader.onerror = (err) => reject(err);
          reader.readAsArrayBuffer(file);
        }, reject);
      }, reject);
    });
  }

  // If path looks like absolute path (e.g., /data/user/0/...), use Capacitor Filesystem
  else if (nativePath.startsWith('/')) {
    try {
      // Remove leading '/' because Capacitor Filesystem reads relative paths in app sandbox
      // Use Directory.Data for /data/user/0/your.app.package/files/
      const relativePath = nativePath.replace(/^\/data\/user\/0\/[^\/]+\/files\//, '');

      // Read file as base64 string, then convert to ArrayBuffer
      const result = await Filesystem.readFile({
        path: relativePath,
        directory: Directory.Data,
        encoding: 'base64',
      });

      // Convert base64 to ArrayBuffer
      const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      };

      return base64ToArrayBuffer(result.data);
    } catch (e) {
      console.error('❌ Error reading file from Filesystem plugin:', e);
      throw e;
    }
  }

  else {
    throw new Error('Unsupported path format: ' + nativePath);
  }
};


const getBase64FromNativePath = (nativePath) => {
  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(nativePath, (fileEntry) => {
      fileEntry.file((file) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }, reject);
    }, reject);
  });
};


const generateCompressedPreview = async (file) => {



  try {
    if (file.type.startsWith('image/')) {
      // For images, get web path from native plugin and compress
      const webPath = await filereder.renderFile({ path: file.path || file.path || file.name });
    const base64 = await getBase64FromNativePath(file.path || file.path || file.name);
    const compressedBase64 = await compressBase64Image(base64, 0.7, 0.8);

  
      return { type: 'image', preview: compressedBase64 };



    } else if (file.type.startsWith('video/')) {
      // For videos, generate thumbnail from file blob
      const thumbnailBlob = await generateThumbnail(file);
      if (!thumbnailBlob) return null;

      // Compress thumbnailBlob here if needed (optional)
      // You can convert to base64 or upload blob directly depending on your use case
      const compressedBase64 = await compressBase64Image(thumbnailBlob, 0.7, 0.8);
      return { type: 'video', preview: compressedBase64 };
    } else {
      return null; // unsupported file type
    }
  } catch (err) {
    console.error('Error generating preview:', err);
    return null;
  }
};
    const compressBase64Image = async (base64Str, quality = 0.5, opacity = 0.6) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.globalAlpha = opacity;
          ctx.drawImage(img, 0, 0);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64Str;
      });
    };
const generateThumbnail = async (file) => {
  const folder = 'thumbnails';
    const thumbnailFileName = `${file.name}_${file.size}_thumb.jpg`;
    const fullPath = `${folder}/${thumbnailFileName}`;
      try {
    
    
          const existing = await Filesystem.readFile({
            path: fullPath,
            directory: Directory.Cache,
          });
    
          //console.log('Existing thumbnail found:', existing);
          return `data:image/jpeg;base64,${existing.data}`;
        } catch {
          //console.log('Thumbnail not found, generating new one...');
        }
           const result = await ffmpeg_thumnail.generateThumbnail({ path: file.path });
            const base64Thumbnail = result.data;
        
            if (!base64Thumbnail) {
              throw new Error('No thumbnail data returned by plugin.');
            }
        
            // Step 3: Save the thumbnail to cache
            await Filesystem.writeFile({
              path: fullPath,
              data: base64Thumbnail,
              directory: Directory.Cache,
              recursive: true,
            });
        
            // Step 4: Return the base64 data URL
            return `data:image/jpeg;base64,${base64Thumbnail}`;
};



const handleClosePreview = () => {
  setShowPreview(false);
  setShowMediaPreview(false);
  processFilesSequentially(mediaFiles);
  setMediaFiles([]);
  setSelectedMedia(null);
  
};

/*************  ✨ Windsurf Command 🌟  *************/
// Handle file upload logic (triggered when files are selected)

    const handleVideoClick = (message) => {
      //console.log("clicked")
      setPreviewVideo(message.file_path? message : "https://www.w3schools.com/html/mov_bbb.mp4"); // Set the video for fullscreen view
    };
  
    const closeVideoPreview = () => {
   
      setPreviewVideo(null); // Close fullscreen view
    };
  
 

    const handleImageClick = (imagePath) => {

      if(selectionMode){
        return
      }
      //console.log("clicked")
      setFullscreenImage(imagePath); // Open image in fullscreen
    };
  
    const closeImageFullscreen = () => {
      //console.log("closed")
     setFullscreenImage(null); // Close fullscreen modal
    };
    const handleFullScreenImage = (image) => {
      setFullscreenImage(image);
    };
    const readFiles = ((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            path: file.webkitRelativePath || file.name, // Path (for webkit browsers)
            binary: reader.result, // Base64 string
          });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file); // Reads file as Base64
      });
    });

    const getBase64FromPath = async (filePath) => {
  try {
    const cleanPath = filePath.replace('file://', '');
    const file = await Filesystem.readFile({ path: cleanPath });
    return file.data; // base64 string without data: prefix
  } catch (err) {
    console.error('Error reading file for base64:', err);
    return null;
  }
};

const handleImage = (imagePath) => {
  if(window.Capacitor.getPlatform() === "android"){
 
    // For video or docs just return path (or convert if needed)
    return imagePath.file_path;
  }else{
    return imagePath.fileData
  }// Open image in fullscreen
};
const HandleBigimage = (img)=>{
  if(window.Capacitor.getPlatform() === "android"){
    return img.file_path
  }else{
    return img.fileData
  }
}

const handleArchive = () => {
  //console.log("Archive button clicked");

  let usersMain = JSON.parse(localStorage.getItem("usersMain")) || [];

  // Update the archive status for the specific user
  const updatedUsers = usersMain.map(user => {
    if (user.id === userdetails.id) {
      const currentArchiveStatus = user.isArchive || false; // Default to false if undefined
      const updatedUser = { ...user, isArchive: !currentArchiveStatus }; // Toggle archive status
   userdetails.isArchive = !currentArchiveStatus;
      // If the user is being archived, mute them. If unarchiving, unmute them.
      if (!currentArchiveStatus) {
        // Archiving user, mute them
        updatedUser.isMuted = true;
        
      } else {
        // Unarchiving user, unmute them
        updatedUser.isMuted = false;
       
      }

      return updatedUser;
    }
    return user;
  });

  // Update muted list state
  setmutedList(prevMutedUsers => {
    let updatedMutedUsers = [...prevMutedUsers];

    if (updatedUsers.find(user => user.id === userdetails.id).isMuted) {
      // If the user is muted, add to muted users list
      if (!updatedMutedUsers.includes(userdetails.id)) {
        updatedMutedUsers.push(userdetails.id);
        setIsMuted(true);
      }
    } else {
      // If the user is unmuted, remove from muted users list
      updatedMutedUsers = updatedMutedUsers.filter(id => id !== userdetails.id);
      setIsMuted(false);

    }

    // Update localStorage with the updated muted users list
    localStorage.setItem('mutedUsers', JSON.stringify(updatedMutedUsers));
    Preferences.set({
      key: 'mutedUsers',
      value: JSON.stringify(updatedMutedUsers)
    });
    return updatedMutedUsers; // Return the updated muted users list
  });

  // Update localStorage with the updated usersMain list
  localStorage.setItem("usersMain", JSON.stringify(updatedUsers));

  // Update the state to trigger re-render with the new users list
  setUsersMain(updatedUsers);

  // Toggle the archive status in your UI
  setIsarcivehs(prev => !prev);

  //console.log(`Toggled archive and mute status for user ${userdetails.id}`);
};


const handleBlock = () => {
  //console.log("Block button clicked");
};

const handleDeleteChat = () => {
  setShowModal(true);
  //console.log("Delete Chat button clicked");
};


const handleWipeChat = () => {
  //console.log("Wipe the chat completely");

  // Get userdetails from localStorage
 

  // Web (Browser)
  if (!isPlatform('web')) {
    //console.log("Web platform detected");

    // Remove the userMain from localStorage if the id matches
      let userMain = JSON.parse(localStorage.getItem("usersMain"));
 
  if (Array.isArray(userMain)) {
    // Filter out the user with matching ID
    userMain = userMain.filter(user => user.id !== userdetails.id);

    // Update localStorage
    localStorage.setItem("usersMain", JSON.stringify(userMain));
    setUsersMain(userMain);
    // console.log("Removed matching user from usersMain array");
  } 



    // Get messages from localStorage and remove messages related to the current user
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    messages = messages.filter(msg => msg.sender !== userdetails.id && msg.recipient !== userdetails.id);
    localStorage.setItem("messages", JSON.stringify(messages)); // Save the updated messages back to localStorage
    //console.log("Deleted messages related to the user from localStorage");
  }

  // Android (Hybrid)
  if (isPlatform('hybrid')) {
    // Get unread messages from localStorage
    let userMain = JSON.parse(localStorage.getItem("usersMain"));
 
  if (Array.isArray(userMain)) {
    // Filter out the user with matching ID
    userMain = userMain.filter(user => user.id !== userdetails.id);

    // Update localStorage
    localStorage.setItem("usersMain", JSON.stringify(userMain));
     setUsersMain(userMain);
    // console.log("Removed matching user from usersMain array");
  } 

    // Get the IDs of unread messages to update them (assuming messageIds is an array of message IDs)
 const selectQuery = `
    SELECT id FROM messages
    WHERE sender = ? OR recipient = ?
  `;

  db.transaction(tx => {
    // Step 1: Fetch message IDs
    tx.executeSql(
      selectQuery,
      [userdetails.id, userdetails.id],
      (_, result) => {
        const idsToDelete = [];
        const rows = result.rows;

        for (let i = 0; i < rows.length; i++) {
          idsToDelete.push(rows.item(i).id);
        }

        if (idsToDelete.length === 0) {
          console.log("✅ No messages found for deletion.");
          return;
        }

        // Step 2: Send to backend

        // Step 3: Delete locally using those IDs
        deleteMessagesByIds(idsToDelete);
      },
      (_, error) => {
        console.error("❌ Error selecting messages:", error);
        return false;
      }
    );
  });

    localchat_messages.current = null;
    messagesRef.current = null;messagesRef.current = messagesRef.current?.filter(
  msg => msg.sender !== userdetails.id && msg.recipient !== userdetails.id
);
setMessages(previousMessages => previousMessages.filter(
  msg => msg.sender !== userdetails.id && msg.recipient !== userdetails.id
));
history.push('/');

    // Use the provided SQL logic for deleting from MySQL
   
  }
  
const deleteMessagesByIds = (ids) => {
  if (!ids.length) return;

  const placeholders = ids.map(() => '?').join(',');
  const deleteQuery = `
    DELETE FROM messages
    WHERE id IN (${placeholders})
  `;

  db.transaction(tx => {
    tx.executeSql(
      deleteQuery,
      ids,
      () => {
        console.log(`✅ Locally deleted ${ids.length} messages.`);
      },
      (_, error) => {
        console.error("❌ Error deleting messages by IDs:", error);
        return false;
      }
    );
  });
};

  // Close the modal after the action is completed
  setShowModal(false); // Close the modal
};

const handlePartialDelete = () => {
  // Get the current usersMain array from localStorage
  let usersMain = JSON.parse(localStorage.getItem("usersMain")) || [];

  // Update the matched user's isPartialDelete flag
  const updatedUsers = usersMain.map(user => {
    if (user.id === userdetails.id) {
      return { ...user, isPartialDelete: true };
    }
    return user;
  });

  // Save the updated array back into localStorage
  localStorage.setItem("usersMain", JSON.stringify(updatedUsers));

  // Optionally update the state if you're storing usersMain in state too
  setUsersMain(updatedUsers);

  //console.log(`Marked user ${userdetails.id} as partially deleted`);

  setShowModal(false); // Close the modal
};
const handleCancel = () => {
  setShowModal(false); // Close the modal without any action
};
const getFilesByType = (type) => {
  //console.log("type",type)
  //console.log("localchat_messages.current",localchat_messages.current.filter((msg) => msg.file_type === type &&msg.isDownload ===1 ))
  return localchat_messages.current.filter((msg) => msg.file_type === type &&msg.isDownload ===1 );
};
const handleBack = () => {
  setShowAll(false);
};




const getSortedMessages = () => {

  const sortedMessages = [...localchat_messages.current]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 

  return sortedMessages;
};
const handleDeselectAll = () => {
  // Call your function to deselect all users here
  setSelectionMode(false); // This will deactivate the selection mode
  setSelectedChats([]); // Clear the selected users
};
const handleMoreOptions = () => {
  setShowMoreOptions(prev => !prev);
};

const handleOptionClick = (option) => {
  //console.log(`${option} clicked.`);
  setShowMoreOptions(false); // Close menu after click
};
const getMimeTypeFromFileName = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'txt': return 'text/plain';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'jpg': return 'image/jpg';
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    default: return 'application/octet-stream';
  }
};




const handleFileOpen = async (msg) => {


  const filePath = msg.file_path;
  const fileName = msg.file_name;

  if (!filePath) {
    alert('File path not found.');
    return;
  }

  const mimeType = getMimeTypeFromFileName(fileName);

  if (isPlatform('hybrid')) {
    try {
      if (filePath.startsWith('file://') || filePath.startsWith('content://')) {
        // Directly open file or content URI
        await FileOpener.openFile({
          path: filePath,
          mimeType,
        });
      } else if (filePath.startsWith('/data/')) {
        // Internal app storage path, read file and then open
        // Step 1: Read file via Capacitor Filesystem plugin
        // Remove your package path prefix if needed
        const relativePath = filePath.replace(/^\/data\/user\/0\/[^\/]+\/files\//, '');

        const file = await Filesystem.readFile({
          path: relativePath,
          directory: Directory.Data,
          encoding: 'base64',
        });

        // Step 2: Save the file temporarily so it can be opened by FileOpener or use a native method that can open base64 or blobs

        // Assuming you have a native method or plugin that accepts base64 or you write it to a cache folder and open it
        // Here is a simplified pseudo-step:
        const tempPath = await saveBase64ToTempFile(file.data, fileName);
        await FileOpener.openFile({
          path: tempPath,
          mimeType,
        });
      } else {
        // Other paths fallback
        await FileOpener.openFile({
          path: filePath,
          mimeType,
        });
      }
    } catch (error) {
      console.error('Error opening file in hybrid environment:', error);
      alert('Error opening file: ' + error.message);
    }
  } else {
    // Web fallback: open in browser or with a download link
    openFileInBrowser(msg);
  }
};


const openFileInBrowser = (msg) => {
  const blob = new Blob([msg.content], { type: getMimeTypeFromFileName(msg.fileName) });
  const fileURL = URL.createObjectURL(blob);
  window.open(fileURL, '_blank');
};

const handleFileClick = (file) => {
  if (!selectionModeFile) {
            (file);

  }; // Only allow selection if in selection mode

  setSelectedFiles(prev => {
    const isAlreadySelected = prev.some(f => f.id === file.id);

    let updatedSelection;
    if (isAlreadySelected) {
      updatedSelection = prev.filter(f => f.id !== file.id);
    } else {
      updatedSelection = [...prev, file];
    }

    // If no files are selected anymore, exit selection mode
    if (updatedSelection.length === 0) {
      setSelectionModeFile(false);
    }

    return updatedSelection;
  });
};


const handleLongPress = (file) => {
  setSelectionModeFile(true);
  setSelectedFiles([file]);
};

const handleCancelSelection = () => {
  setSelectionModeFile(false);
  setSelectedFiles([]);
};


const handleForwardFiles = (selectedFiles) => () => {

  history.push('/forwardScreen', { forwardedMessages: selectedFiles });
}
const handleDeleteFiles = (selectedFiles) => async () => {
  try {
    // Extract message IDs
    const messageIds = selectedFiles.map(file => file.messageId);

    // 1. Delete from Web (Assuming API or IndexedDB)
    await Promise.all(messageIds.map(id => deleteMessageFromWeb(id)));

    // 2. Delete from Cordova SQLite
    messageIds.forEach(id => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM messages WHERE id = ?',
          [id],
          () => //console.log(`Deleted message ${id} from SQLite`),
          (tx, error) => console.error(`SQLite delete error: ${error.message}`)
        );
      });
    });

    // 3. Remove from localChat state
      if (localchat_messages.current) {
      localchat_messages.current = localchat_messages.current.filter(
        msg => !messageIds.includes(msg.id)
      );
    }
    // 4. Remove from messageRef.current
    if (messagesRef.current) {
      messagesRef.current = messagesRef.current.filter(msg => !messageIds.includes(msg.id));
    }

    //console.log("Messages deleted successfully.");
  } catch (error) {
    console.error("Error deleting messages:", error);
  }
};


const handleResend = async (message ) => {
  //console.log("message",message)
  if(message.type === "file"){
  const updatedMessage = { ...message };
  const messageId = message.id;
const token = localStorage.getItem('token');
  try {
    setUploadingFiles(prev => ({ ...prev, [message.file_name]: true }));
    setLoadingMessages(prev => ({ ...prev, [messageId]: true }));
    setisDownloading(prev => ({ ...prev, [messageId]: true }));


    const signedUrl = await uploadFile2(message, token);

    if (!signedUrl || typeof signedUrl.uploadUrl !== 'string' || !signedUrl.uploadUrl.trim()) {
      throw new Error("❌ Invalid signed URL received during reprocessFileMessage");
    }

    // Generate thumbnail again if needed
 

    // Send the message via WebSocket
updatedMessage.file_path = signedUrl.uploadUrl


if(signedUrl.uploadUrl){
  const result = await saveMessage(updatedMessage);

    message.isSent = result?.status === 'sent' ? 1 : 0;
    message.isError = result?.message?.isError || 0;
}else{
  message.isError = 1;
  message.isSent = 0;
}
    
   

  } catch (err) {
    console.error(`❌ Error reprocessing file message: ${message.file_name}`, err);

    setFileUploadError(true)

  } finally {
    // Update state
    setMessages(prev => prev.map(m => m.id === messageId ? message : m));
    setMessagestest(prev => prev.map(m => m.id === messageId ? message : m));
    setMessages1(prev => prev.map(m => m.id === messageId ? message : m));
    messagesRef.current = messagesRef.current.map(m => m.id === messageId ? message : m);

    // Update storage
 updateMessageForSent(message);

    // Cleanup loading states
    setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[message.file_name];
      return updated;
    });
    setTimeout(() => {
      setLoadingMessages(prev => ({ ...prev, [messageId]: false }));
      setisDownloading(prev => ({ ...prev, [messageId]: false }));
  
    },2000)
  
    //console.log(`✅ Reprocessed file message: ${message.file_name}`);
  }
}
};


async function fetchFileFromPath(path) {
  try {
    // Read file content from the specified path
    const file = await Filesystem.readFile({
      path: path, // Example: 'folder/content' (relative to app's internal storage)
      directory: Directory.Documents, // Choose appropriate directory (e.g., Documents, Data, External)
      encoding: Encoding.UTF8, // You can adjust encoding based on your use case
    });

    // Convert base64 file data to a Blob
    const byteCharacters = atob(file.data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset++) {
      byteArrays.push(byteCharacters.charCodeAt(offset));
    }
    const fileBlob = new Blob([new Uint8Array(byteArrays)]);

    return fileBlob;
  } catch (error) {
    console.error("Failed to fetch file:", error);
    throw error;
  }
}


const uploadFile2 = async (message, token) => {
 

  try {
    //console.log('📦 File selected:', message.file_name, message.file_size, message.file_type);
//console.log("host",host,"and token",token)
    // Step 1: Request the signed URL from your backend
const fileblob = await getBlobFromPath(message.file_path);
const uint8View = new Uint8Array(fileblob);


 // File or Blob from <input> or canvas

//console.log("testing from here ",uploadUrl,uploadAuthorizationToken)
    // Step 2: Upload the file directly to B2 using the signed URL
  const response = await fetch(`https://${Maindata.SERVER_URL}/messages/upload-to-b2`, {
      method: 'POST',
      headers: {
  'X-Filename': message.file_name,
  'X-Filesize': message.file_size,
        'Auth': token,
        'Content-Type': 'application/octet-stream'
      },
      body: uint8View,
      
    })
 
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    

    const result = await response.json(); 
  
 // B2 will return JSON
    //console.log('✅ Upload successful:', result);

    //console.log('✅ Upload response:', uploadResponse.data);

  return {
    fileId: result.fileId,
    fileName: result.fileName,
    uploadUrl : result.fileUrl,
  };

  
  } catch (error) {
    console.error('🚨 Error uploading file:', error?.response?.data || error.message);
  }
};




    return (
        <div className="chat-window d-flex flex-column vh-100">
          { isloading && (

   <div style={{ textAlign: 'center',display: 'flex', justifyContent: 'center', alignItems: 'center',position: 'fixed', top: '50%', left: '50%', zIndex: 999999,transform: 'translate(-50%, -50%)',    background:' rgba(0, 0, 0, 0.5',height: '100vh',width:'100%',overflowY: 'auto' }}>
      <StarLoader />
   
    </div>
  
         ) }

            {/* Header with user details and Back Button */}
            {
  selectionMode ? (
    // Header for selection mode
      <div className="flex items-center justify-between w-full max-w-3xl px-4 py-2 relative bg-primary text-white" style={{ height: '70px' ,position:'fixed'}}>
    {/* Left: Back Button */}
    <div className="flex items-center space-x-3">
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 z-10"
        title="Cancel Selection"
        onClick={(e) => {
          e.stopPropagation();
          handleDeselectAll();
        }}
      >
        <IonIcon icon={closeOutline} size="medium" />
      </button>

      <div className="ml-12 text-lg font-semibold">Selected</div>
    </div>

    {/* Right: Action Buttons */}
    <div className="flex items-center space-x-4">
      <button
        className="p-2 rounded-full hover:bg-white/20"
        onClick={handleCopy}
        title="Copy"
      >
        <IonIcon icon={copyOutline} size="small" />
      </button>

      <button
        className="p-2 rounded-full hover:bg-white/20"
        onClick={handleDelete}
        title="Delete"
      >
        <IonIcon icon={trashOutline} size="small" />
      </button>

      <button
        className="p-2 rounded-full hover:bg-white/20"
        onClick={handleForward}
        title="Forward"
      >
        <IonIcon icon={arrowRedoOutline} size="small" />
      </button>

      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-white/20"
          onClick={handleMoreOptions}
          title="More"
        >
          <IonIcon icon={ellipsisVerticalOutline} size="small" />
        </button>

        {showMoreOptions && (
          <div className="absolute top-12 right-0 bg-white text-black rounded shadow-lg z-10 w-40">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleOptionClick('Mark as Read')}
            >
              Mark as Read
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={handleArchive}
            >
              {isArchive ? 'Unarchive' : 'Move to Archive'}
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleOptionClick('Report')}
            >
              Report
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  ) : (
             <div
  className={`header bg-primary text-white d-flex items-center p-3 justify-between transition-all duration-300 ${isExpanded ? 'expanded' : ''}`}
  style={{ height: isExpanded ? '100vh' : '80px', overflow: isExpanded ? 'auto' : 'hidden' }}
>
  {/* Back Button */}
 {isExpanded && <button
    className="p-2 rounded-full hover:bg-gray-200 absolute left-2 top-4"
    title="Back"
    onClick={toggleHeader }
    style={{ color:'black' }}
  >
    <IonIcon icon={arrowBackOutline} size="medium" />
  </button>}
 
  {isExpanded && (
        <>
          {/* Main Ellipsis Button */}
          <button
            className="p-2 rounded-full hover:bg-black-200 absolute right-2 top-4"
            title="Options"
            onClick={toggleOptions}
             style={{ color:'black' }}
          >
            <IonIcon icon={ellipsisVerticalOutline} size="medium" />
          </button>

          {/* Floating Options Dropdown */}
{showOptions && (
  <div 
    style={{
      position: 'absolute', 
      right: '0.5rem', 
      top: '4rem', 
      width: '10rem', 
      backgroundColor: 'white', 
      border: '1px solid #D1D5DB', 
      borderRadius: '0.375rem', 
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', 
      zIndex: 50
    }}
  >
    <button
      onClick={handleShare}
      style={{
        width: '100%', 
        padding: '0.75rem', 
        fontSize: '20px', 
        textAlign: 'center', 
        color: 'black', 
        borderBottom: '1px solid #E5E7EB', 
        backgroundColor: 'transparent', 
        cursor: 'pointer', 
        transition: 'background-color 0.2s ease',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      Share
    </button>
    <button
      onClick={handleEditContact}
      style={{
        width: '100%', 
        padding: '0.75rem', 
        fontSize: '20px', 
        textAlign: 'center', 
        color: 'black', 
        backgroundColor: 'transparent', 
        cursor: 'pointer', 
        transition: 'background-color 0.2s ease',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      Edit Contact
    </button>
  </div>
)}







        </>
      )}

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
  {/* More Options (Three Dots) */}


  {/* Profile and Name Section */}
  {!isExpanded && userdetails && (
   <div className="flex items-center justify-between w-full max-w-3xl px-4 py-2 relative">

   {/* Left: Back Button */}
   <div className="flex items-center space-x-3">
   <button
    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 z-10"
    title="Back"
    onClick={(e) => {
      e.stopPropagation(); // Prevent toggleHeader
      handleBackButton();
    }}
  >
    <IonIcon icon={arrowBackOutline} size="medium" />
  </button>
 
     <div
       className="flex items-center space-x-3 cursor-pointer"
       onClick={toggleHeader}
     >
       {/* Avatar */}
       <img
         src={userdetails.avatar || img}
         alt="Avatar"
         style={{ aspectRatio: '4/3',marginLeft: '15px' }}
         className="w-14 h-14 rounded-full"
       />
 
       {/* User Name */}
       <div className="truncate" style={{ marginLeft: '10px',alignItems: 'center' }}>
  <h4 className="mb-3 font-semibold text-lg">
      {userdetails.name.length > 9
        ? `${userdetails.name.slice(0, 9)}…`
        : userdetails.name}
    </h4>
       </div>
     </div>
   </div>
 
   {/* Right: Action Buttons */}
   <div className="flex items-center space-x-4" style={{ marginRight: '0px' ,left: '0px'}}>
     <button
       className="p-1 rounded-full hover:bg-gray-200"
       title="Call"
       onClick={() => handleCall(userdetails.id)}
     >
       <IonIcon icon={callOutline} size="small" />
     </button>
     <button
       className="p-1 rounded-full hover:bg-gray-200"
       title="Video Call"
       onClick={() => handleVideoCall(userdetails.id)}
     >
       <IonIcon icon={videocamOutline} size="small" />
     </button>
     <button
       className="p-1 rounded-full hover:bg-gray-200"
       title="More Options"
       onClick={() => handleMoreOptions(userdetails.id)}
     >
       <IonIcon icon={ellipsisVerticalOutline} size="small" />
     </button>
   </div>
 </div>
 
  )}

  {/* Expanded View - User Details and Call Options */}
 {isExpanded && (
  <div className="user-details overflow-auto" style={{ height: '100vh', width: '100%', backgroundColor: '#f0f4f8',fontColor: 'black' }}>
    
    {/* Profile Picture */}
    <div className="flex justify-center mb-6">
      <img
        src={userdetails.avatar || img}
        alt="Avatar"
        className="rounded-full cursor-pointer"
        style={{
          height: '12rem',
          width: '12rem',
          marginTop: '2rem',
          aspectRatio: '4/3',
          border: '4px solid #4F46E5', // Edit border color
        }}
        onClick={() => isExpanded ? toglebigscreen() : toggleHeader()}
      />
    </div>

    {/* User Info */}
    <div 
  style={{
    textAlign: 'center', 
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#F9FAFB', 
    borderRadius: '0.375rem', 
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }}
>
  <div 
    style={{
      marginBottom: '1rem',
      padding: '0.5rem 0',
    }}
  >
    <p 
      style={{
        fontSize: '22px', 
        color: '#1F2937', 
        fontWeight: '600', 
        lineHeight: '1.5',
        marginBottom: '0.5rem'
      }}
    >
      {userdetails.name}
    </p>
    <p 
      style={{
        fontSize: '18px', 
        color: '#4B5563', 
        fontWeight: '400', 
        lineHeight: '1.5'
      }}
    >
       {userdetails.phoneNumber}
    </p>
  </div>
</div>


    {/* Call Buttons */}
  {/* Call Buttons */}
{/* Call Buttons */}
<div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '1rem' }}>
  <button
    onClick={() => handleCall(userdetails.id)}
    title="Call"
    style={{
      padding: '12px',
      borderRadius: '9999px',
      backgroundColor: '#22c55e', // Tailwind's green-500
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    }}
    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#16a34a')} // green-600
    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#22c55e')}
  >
    <IonIcon icon={callOutline} size="large" />
  </button>

  <button
    onClick={() => handleVideoCall(userdetails.id)}
    title="Video Call"
    style={{
      padding: '12px',
      borderRadius: '9999px',
      backgroundColor: '#3b82f6', // Tailwind's blue-500
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    }}
    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2563eb')} // blue-600
    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#3b82f6')}
  >
    <IonIcon icon={videocamOutline} size="large" />
  </button>
</div>



    {/* Bio */}
    <div className="mb-8 px-4">
      <h3 className="font-semibold text-2xl mb-2 text-indigo-600">Bio</h3>
      <p className="text-lg italic text-gray-700">
        {userdetails.About || "This user hasn't written a bio yet."}
      </p>
    </div>

    {/* Notifications */}
    <div className="flex flex-col border-t-4 border-gray-300 pt-4 px-4 space-y-6">
                <h3 className="text-xl font-semibold text-gray-800" style={{ color: 'rgb(79 70 229 / var(--tw-text-opacity))' ,fontWeight: '600',fontSize: '1.5rem'}}>Notifications</h3>
      <button
        onClick={toggleMute}
        className="flex items-center space-x-4 p-3 w-full hover:bg-gray-100 rounded-lg"
      >
        {isMuted ? (
          <MuteIcon className="text-red-500 w-8 h-8" />
        ) : (
          <UnmuteIcon className="text-green-500 w-8 h-8" />
        )}
        <span className="text-base text-gray-700 px-6 text-[17px]">
          {isMuted ? "Unmute" : "Mute"} Notifications
        </span>
      </button>

      <button
        onClick={handleCustomNotification}
        className="flex items-center space-x-4 p-3 w-full hover:bg-gray-100 rounded-lg"
      >
        <CustomBellIcon className="text-blue-500 w-8 h-8" />
     <span className="text-base text-gray-700 font-medium px-2 text-[17px]">
  {sound
    ? `Custom Notification: ${sound.fileName} (${sound.soundPath})`
    : "Set Custom Notification"}
</span>
      </button>
    </div>

   
    {/* Media Section */}
    <div className="media-section mt-8">
      {!showAll && (
        <div className="flex justify-between items-center p-4 border-t-4 border-gray-300">
          <h3 className="text-xl font-semibold text-gray-800" style={{ color: 'rgb(79 70 229 / var(--tw-text-opacity))' ,fontWeight: '600',fontSize: '1.5rem'}}>Recent Files</h3>
          <button
            onClick={handleViewAll}
            style={{ color: '#3b82f6',fontSize: '20px' }}
            className="text-indigo-600 hover:underline"
          >
            View All
          </button>
        </div>
      )}
      
      <div className="p-4 flex space-x-1 overflow-x-auto">
        
        {localchat_messages.current && localchat_messages.current.filter(msg => msg.file_type === "image").slice(0,10).map((msg, index) => (
          <div key={index} className="flex-none w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">

            <ImageRenderer
              src={msg.file_path}
              alt={`file ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    

      {/* Recent Files Section */}
   
      {/* Full Media Section with Navbar (Horizontal) */}
        {showAll && (
       <div style={{ height: '100dvh', position: 'fixed', top: 0, left: 0, width: '100%', backgroundColor: '#c0f5ff', display: 'flex', flexDirection: 'column',overflow: 'hidden' }}>
         
         {/* Header */}
         <div className="flex space-x-2 p-4 border-b border-gray-300" style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), var(--bs-bg-opacity))', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10,height:'120px' }}>
  {selectionModeFile ? (
    <>
      <button
        onClick={handleCancelSelection}
        className="text-black hover:underline p-2 flex items-center text-xl"
        style={{ position: 'absolute', top: '10px', left: '10px' }}
      >
        <IonIcon icon={closeOutline} size="small" />
      </button>
      <div className='flex space-x-2 ' style={{ position: 'absolute', top: '10px', right: '10px' }}>

     
      <button
        onClick={handleForwardFiles(selectedFiles)}
        className="text-black hover:underline p-2 flex items-center text-xl"
       
      >
        <IonIcon icon={arrowRedoOutline} size="small" />
      </button>
      <button
        onClick={handleDeleteFiles(selectedFiles)}
        className="text-black hover:underline p-2 flex items-center text-xl"
       
      >
        <IonIcon icon={trashOutline} size="small" />
      </button>
      </div>
      
      <div className="flex justify-center w-full space-x-3 mt-4">
        {['images', 'videos', 'documents', 'audio'].map((tab) => (
          <button
            key={tab}
            style={{ fontSize: '18px' }}
            onClick={() => setSelectedTab(tab)}
            className={`font-semibold text-black ${selectedTab === tab ? 'border-b-2 border-indigo-600' : ''} hover:text-indigo-600`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {/* Later add delete/copy buttons here */}
    </>
  ) : (
    <>
      <button
        onClick={handleBack}
        className="text-black hover:underline p-2 flex items-center text-xl"
        style={{ position: 'absolute', top: '10px', left: '10px' }}
      >
        <IonIcon icon={arrowBackOutline} size="small" /> 
      </button>

      <div className="flex justify-center w-full space-x-3 mt-4">
        {['images', 'videos', 'documents'].map((tab) => (
          <button
            key={tab}
            style={{ fontSize: '18px' }}
            onClick={() => setSelectedTab(tab)}
            className={`font-semibold text-black ${selectedTab === tab ? 'border-b-2 border-indigo-600' : ''} hover:text-indigo-600`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </>
  )}
</div>

     
         {/* Content */}
         <div className="flex-1 overflow-y-auto">
           {selectedTab === 'images' && (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2">
             {localchat_messages.current?.filter(msg => msg.file_type === "image" && msg.isDownload === 1).map((msg, index) => (
  <div
    key={index}
    className="w-full aspect-square bg-gray-100 overflow-hidden rounded-lg relative"
    onClick={() => handleFileClick(msg)}
    onContextMenu={(e) => {
      e.preventDefault(); // Prevent right-click menu
      handleLongPress(msg);
    }}
  >
    <ImageRenderer
      src={msg.file_path}
      alt={`file ${index + 1}`}
      className="w-full h-full object-cover"
        onClick={() => {
                    if (msg.isDownload !== 0) {
                      handleImageClick(msg.file_path);
                    } else if (!isDownloading[msg.id] && msg.isError === 0) {
                      handleFileDownload(msg);
                    }
                  }}
    />
    {/* Checkmark if selected */}
    {selectedFiles.some(f => f.id === msg.id) && (
      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
        ✓
      </div>
    )}
  </div>
))}

             </div>
           )}
     
           {selectedTab === 'videos' && (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
               {getFilesByType('video').map((msg, index) => (
                 <div key={index} style={{ position: "relative", width: "100%", aspectRatio: "1/1", overflow: "hidden", borderRadius: 8 }}   onContextMenu={(e) => {
                  e.preventDefault(); // Prevent right-click menu
                  handleLongPress(msg);
                }}
                
                onClick={() => handleFileClick(msg)}
                >
                   <VideoRenderer
                     src={msg.file_path}
                     muted
                     Name={msg.file_name}
                     Size={msg.file_size}
                     onClick={() => handleVideoClick(msg)}
                   
                     playsInline
                     style={{
                       width: "100%",
                       height: "100%",
                       objectFit: "cover",
                       pointerEvents: "none",
                     }}
                   />
                   {/* Play button overlay */}
                   <div
                     style={{
                       position: "absolute",
                       top: "50%",
                       left: "50%",
                       transform: "translate(-50%, -50%)",
                       backgroundColor: "rgba(0, 0, 0, 0.5)",
                       borderRadius: "50%",
                       padding: "10px",
                     }}
                   >
                     <IonIcon icon={playCircleOutline} style={{ color: "white", fontSize: 40 }} onClick={() => handleVideoClick(msg)} />
                   </div>
                   {selectedFiles.some(f => f.id === msg.id) && (
      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
        ✓
      </div>
    )}
                 </div>
               ))}
             </div>
           )}
     
           {selectedTab === 'documents' && (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2">
               {localchat_messages.current?.filter(msg => msg.file_type !== "audio" && msg.file_type !== "video" && msg.file_type !== "image" && msg.isDownload === 1).map((msg, index) => (
                 <div key={index} className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center rounded-lg overflow-hidden" onContextMenu={(e) => {
                  e.preventDefault(); // Prevent right-click menu
                  handleLongPress(msg);
                }}
                onClick={() => handleFileOpen(msg)}>
                   <IonIcon icon={documentOutline} size="large" className="text-red-500" />
                   <p className="text-xs text-gray-400 mt-1 text-center px-1">{msg.file_name}</p>
                 </div>
               ))}
                     {selectedFiles.some(f => f.id === msg.id) && (
      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
        ✓
      </div>
    )}
             </div>
           )}
     
          
         </div>
       </div>
     )}



    </div>
<div
  style={{
    border: '2px solid #d1d5db',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
 
    margin: '0 auto',
    overflow: 'hidden',
  }}
>
  {/* Archive */}
  <button
    onClick={handleArchive}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
      padding: '18px 24px',
      backgroundColor: '#eff6ff',
      color: '#1d4ed8',
      border: 'none',
      fontSize: '20px',
      fontWeight: '500',
      cursor: 'pointer',
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
  >
    📁 Archive
  </button>

  {/* Block */}
  <button
    onClick={handleBlock}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
      padding: '18px 24px',
      backgroundColor: '#fef9c3',
      color: '#92400e',
      borderTop: '1px solid #d1d5db',
      borderBottom: '1px solid #d1d5db',
      fontSize: '20px',
      fontWeight: '500',
      cursor: 'pointer',
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef08a')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fef9c3')}
  >
    🚫 Block
  </button>

  {/* Delete */}
  <button
    onClick={handleDeleteChat}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
      padding: '18px 24px',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      border: 'none',
      fontSize: '20px',
      fontWeight: '500',
      cursor: 'pointer',
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fecaca')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
  >
    🗑️ Delete
  </button>
</div>






    

  </div>
)}

</div>
)
}


            {/* Messages container */}
            <div className="messages-container flex-grow-1 flex flex-col-reverse overflow-y-auto p-3 bg-light" style={{ marginTop: "70px" }}   ref={scrollRef}
  onScroll={handleScroll}>
            <div ref={messagesEndRef} />
            {!isInView && (
        <button
          ref={buttonRef}
          onClick={scrollToMessages}
          style={{
            position: 'fixed',
            bottom: '20dvh',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
          }}
        >
        <FaArrowDown size={20} />

        </button>
      )}
      
      {localchat_messages.current && getSortedMessages().map((msg,index) => (
           <div key={msg.id}  
           onMouseDown={() => handlePressStart(msg)}
           onMouseUp={handlePressEnd}
            ref={index === 0 ? topMessageRef : null} 
           onTouchStart={() => handlePressStart(msg)}
           onClick={() => handleClick(msg)}
           onTouchEnd={handlePressEnd}

           className={`d-flex mb-2 ${
             msg.sender === user._id ? "justify-content-end" : "justify-content-start"
           }`}style={{ width: '100%', backgroundColor: isSelected(msg) ? '#e8f7fe' : 'transparent' }}>
             {msg.type === "file" ? (
                <div
                className="file-message position-relative p-2 rounded"

                style={{
                  backgroundColor: msg.file_type === "video" ? "#f5f5f5" : "#e8f7fe", // Different color for video and image
                  maxWidth: "90%",
                  borderRadius: "12px",
                  wordWrap: "break-word",
                }}
              >
          
                  
                  
                  
                  
                  
                  
                  
                  {     msg.file_type === "audio" ? (
 <div 
 className="audio-message d-flex p-2" 
 style={{
   backgroundColor: "#075E54",
   borderRadius: "20px",
   width: "100%",
   alignItems: "center",
   position: "relative",
 }}
>

{msg.sender === userdetails.id && msg.isError === 1 && (
  isDownloading[msg.id] ? (
    <IonSpinner name="crescent" color="primary" />
  ) : (
    <IonButton 
         fill="clear" 
         onClick={() => handleFileDownload(msg)} 
         disabled={isDownloading[msg.id]}
         style={{ minWidth: 40, height: 40 }}
       >
         <input
                type="range"
                min="0"
                max="100"
                value={0}
                disabled
                style={{
                  flex: 1,
                  appearance: "none",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "#C4C4C4",  // Light gray seekbar for dummy
                  outline: "none",
                  cursor: "not-allowed",
                }}
              />
         {isDownloading[msg.id] ? (
           <IonSpinner color="light" />
         ) : (
           <IonIcon icon={downloadOutline} color="light" />
         )}
       </IonButton>
  )
)}
{msg.sender === user._id && (
  <div
    className="message-status d-flex align-items-center gap-1"
    style={{
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {/* If not sent and error, show red exclamation + Retry */}

    {msg.sender === user._id && msg.isSent === 0 && msg.isError === 1 && (
      <>
        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.2rem', color: 'red' }}></i>
        <button 
          onClick={() => handleResend(msg)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          Retry
        </button>
      </>
    )}



    {/* If not sent and not error, show no wifi */}
    {msg.isSent === 0 && msg.isError === 0 && (
      <i className="bi bi-wifi-off" style={{ fontSize: '1.2rem', color: 'gray' }}></i>
    )}

    {/* If sent, show appropriate status */}
    {msg.isSent === 1 && (
      <>
        {msg.status === "pending" && (
          <i className="bi bi-watch" style={{ fontSize: '1.2rem' }}></i>
        )}
        {msg.status === "sent" && msg.read === 0 && (
          <i className="bi bi-check" style={{ fontSize: '1.2rem' }}></i>
        )}
        {msg.status === "sent" && msg.read === 1 && (
          <i className="bi bi-eye" style={{ fontSize: '1.2rem' }}></i>
        )}
      </>
    )}
  </div>
)}

 {/* Sender Profile Photo */}
 <img 
   src={userdetails.avatar ? userdetails.avatar : img} 
   alt="sender" 
   style={{ 
     width: 35, 
     height: 35, 
     borderRadius: "50%", 
     objectFit: "cover", 
     marginRight: 10 
   }} 
 />

 {/* Audio Section */}
 <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
   <div className="d-flex align-items-center" style={{ position: "relative", top: "3px" }}>
     {msg.isError === 0 && msg.isDownload === 0 ? (
       // Show DOWNLOAD button (not fake player)
       <IonButton 
         fill="clear" 
         onClick={() => handleFileDownload(msg)} 
         disabled={isDownloading[msg.id]}
         style={{ minWidth: 40, height: 40 }}
       >
         <input
                type="range"
                min="0"
                max="100"
                value={0}
                disabled
                style={{
                  flex: 1,
                  appearance: "none",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "#C4C4C4",  // Light gray seekbar for dummy
                  outline: "none",
                  cursor: "not-allowed",
                }}
              />
         {isDownloading[msg.id] ? (
           <IonSpinner color="light" />
         ) : (
           <IonIcon icon={downloadOutline} color="light" />
         )}
       </IonButton>
     ) : (
       // Show real audio player after downloaded
       <waveForm audioFile={msg.file_path} msg = {msg} />
     )}
   </div>
 </div>
</div>
)
: msg.file_type !== "image" && msg.file_type !== "video"   && msg.file_type !== "audio" ? (
  <div className="file-message bg-secondary p-3 rounded-lg flex flex-col max-w-xs" style={{ width: '200px',height: '200px', position: 'relative' }}>
    {msg.sender === user._id && (
  <div
    className="message-status d-flex align-items-center gap-1"
    style={{
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {/* If not sent and error, show red exclamation + Retry */}
    {msg.isSent === 0 && msg.isError === 1 && (
      <>
        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.2rem', color: 'red' }}></i>
        <button 
          onClick={() => handleResend(msg)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          Retry
        </button>
      </>
    )}




    {/* If not sent and not error, show no wifi */}
    {msg.isSent === 0 && msg.isError === 0 && (
      <i className="bi bi-wifi-off" style={{ fontSize: '1.2rem', color: 'gray' }}></i>
    )}

    {/* If sent, show appropriate status */}
    {msg.isSent === 1 && (
      <>
        {msg.status === "pending" && (
          <i className="bi bi-watch" style={{ fontSize: '1.2rem' }}></i>
        )}
        {msg.status === "sent" && msg.read === 0 && (
          <i className="bi bi-check" style={{ fontSize: '1.2rem' }}></i>
        )}
        {msg.status === "sent" && msg.read === 1 && (
          <i className="bi bi-eye" style={{ fontSize: '1.2rem' }}></i>
        )}
      </>
    )}
  </div>
)}
{msg.sender === userdetails.id && msg.isError === 1 && (
  isDownloading[msg.id] ? (
    <IonSpinner name="crescent" color="primary" />
  ) : (
    <button
      onClick={() => handleFileDownload(msg)}
      style={{
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
    >
      Retry
    </button>
  )
)}
    {/* Preview Section */}
    {msg.isDownload !== 0 && msg.file_type === "pdf" && msg.file_path ? (
      <div className="w-full h-[200px] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center mb-2">
        <DocumentRenderer
          data={msg.file_path}
          type={msg.file_type}
          className="w-full h-full pointer-events-none"
          style={{ overflow: 'hidden' }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <IonIcon icon={documentOutline} size="large" className="text-red-500" />
            <p className="text-xs text-gray-400">Preview not available</p>
          </div>
        </DocumentRenderer>
      </div>
    ) : (
      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center mb-2 h-[200px]">
        <IonIcon icon={documentOutline} size="large" className="text-red-500" />
      </div>
    )}

    {/* File Info + Button */}
    <div className="flex items-center justify-between">
      <div className="flex flex-col max-w-[130px]">
        <strong className="text-sm truncate">{msg.file_name}</strong>
        {msg.file_size && (
          <small className="text-xs text-gray-400">
            {(msg.file_size / 1024).toFixed(1)} KB
          </small>
        )}
      </div>
      <div className="ml-2">
        {msg.isError === 0 && msg.isDownload === 0 ? (
          <IonButton size="small" fill="clear" onClick={() => handleFileDownload(msg)} disabled={isDownloading[msg.id]}>
            <IonIcon icon={downloadOutline} />
          </IonButton>
        ) : (
          <IonButton size="small" fill="clear" onClick={() => handleFileOpen(msg)}>
            Open
          </IonButton>
        )}
      </div>
    </div>

    {/* Timestamp */}
    <div className="text-right mt-1">
      <small className="text-[10px] text-gray-400">
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </small>
    </div>
  </div>
) :  msg.file_type === "video" ? (
  <div
  className="video-container"
  style={{
    width: '200px',
    height: '200px',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    background: msg.sender === user._id
      ? 'linear-gradient(135deg, #13e247, #3bb9ff)'
      : 'linear-gradient(135deg, #ff8c00, #1722B9)',
    padding: '5px',
    boxShadow: '0 1px 3px rgba(59, 185, 243, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  {/* =============== SENDER IS CURRENT USER =============== */}
  {msg.sender === user._id && (
    <>
      {/* =========== ERROR CASE ========== */}
      {msg.isError === 1 ? (
        isDownloading[msg.id] ? (
          <IonSpinner name="crescent" color="primary" />
        ) : (
          <>
          <button
            onClick={() => handleResend(msg)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              position: 'absolute',
              top: '10%',
              right: '10%',
              zIndex: 2

              
            }}
          >
            Retry
          </button>
             <VideoRenderer
            src={msg.file_path}
            muted
            Name={msg.file_name}
            Size={msg.file_size}
            playsInline
         style={{
                  position: 'absolute',
                       width: "90%",
                       height: "90%",
                       objectFit: "cover",
                       pointerEvents: "none",
                       zIndex: 0
                     }}
          />
          </>
        )
      ) : (
        <>
          {/* Show video thumbnail + play button overlay */}
          <VideoRenderer
            src={msg.file_path}
            muted
            Name={msg.file_name}
            Size={msg.file_size}
            playsInline
                style={{
                  position: 'absolute',
                       width: "90%",
                       height: "90%",
                       objectFit: "cover",
                       pointerEvents: "none",
                       zIndex: 0
                     }}
        
          />
          <div
            style={{
              position: 'absolute',
         
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              padding: '10px',
              top: '50%',
              left: '50%',
              cursor: 'pointer',
              zIndex: 6
            }}
          >
            {loadingMessages[msg.id] ? (
              <IonSpinner style={{ color: 'white', fontSize: 40 }} />
            ) : (
              <IonIcon
                icon={playCircleOutline}
                style={{ color: 'white', fontSize: 40 }}
                onClick={() => handleVideoClick(msg)}
              />
            )}
          </div>
        </>
      )}

      {/* Message status (bottom right corner) */}
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          display: 'flex',
          alignItems: 'center',
        
        }}
      >
      {msg.isSent === 0 && msg.isError === 1 && (
  <>
    {isDownloading[msg.id] ? (
      <IonSpinner name="dots" style={{ fontSize: '1.5rem', color: 'gray' , position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} /> // Ion Spinner
    ) : (
      <>
        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.2rem', color: 'red',zIndex:'2' }}></i>
        <button 
          onClick={() => handleResend(msg)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
            textDecoration: 'underline',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3
          }}
        >
          Retry
        </button>
      </>
    )}
  </>
)}
        {msg.isSent === 0 && msg.isError === 0 && (
          <i className="bi bi-wifi-off" style={{ fontSize: '1.2rem', color: 'gray', zIndex:'3'}}></i>
        )}
        {msg.isSent === 1 && (
          <>
            {msg.status === 'pending' && <i className="bi bi-watch" style={{ fontSize: '1.2rem',zIndex:'3'}}></i>}
            {msg.status === 'sent' && msg.read === 0 && <i className="bi bi-check" style={{ fontSize: '1.2rem',zIndex:'3'}}></i>}
            {msg.status === 'sent' && msg.read === 1 && <i className="bi bi-eye" style={{ fontSize: '1.2rem',zIndex:'3'}}></i>}
          </>
        )}
      </div>
    </>
  )}

  {/* =============== RECEIVER SIDE (DOWNLOADED OR NOT) =============== */}
  {msg.sender === userdetails.id && msg.isDownload === 0 ? (
    // Show thumbnail and download or retry option
<>
      <img
        src={msg.thumbnail || 'https://via.placeholder.com/200'}
        alt="Video Thumbnail should not be empty"
        style={{
          width: '90%',
          height: '90%',
          objectFit: 'cover',
          borderRadius: 8,
          zIndex: 0,
          position: 'absolute',
          
        }}
      />
      <div
        style={{
          position: 'absolute',
top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '50%',
          padding: '10px',
          zIndex: 6
        }}
      >
        {msg.isError === 1 ? (
          isDownloading[msg.id] ? (
            <IonSpinner name="crescent" color="primary" />
          ) : (
            <button
              onClick={() => handleFileDownload(msg)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          )
        ) : (
          <IonButton
            fill="clear"
            onClick={() => handleFileDownload(msg)}
            disabled={isDownloading[msg.id]}
          >
            {isDownloading[msg.id] ? <IonSpinner /> : <IonIcon icon={downloadOutline} />}
          </IonButton>
        )}
      </div>
      </>
   
  ) : (
    // When video is already downloaded
<>
  {msg.sender === userdetails.id ? (
<>
    <VideoRenderer
      src={msg.file_path}
      Name={msg.file_name}
      Size={msg.file_size}
      muted
      playsInline
     style={{
                  position: 'absolute',
                       width: "90%",
                       height: "90%",
                       objectFit: "cover",
                       pointerEvents: "none",
                       zIndex: 0
                     }}
    />
    <div
      style={{
        position: 'absolute',
      top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '50%',
        padding: '10px',
        zIndex: 6
      }}
    >
      {loadingMessages[msg.id] ? (
        <IonSpinner style={{ color: 'white', fontSize: 40 }} />
      ) : (
        <IonIcon
          icon={playCircleOutline}
          style={{ color: 'white', fontSize: 40 }}
          onClick={() => handleVideoClick(msg)}
        />
      )}
    </div>
</>
) : null}

      </>
  )}
</div>

              ) : msg.file_type === "image" && (
                <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '12px',
                  position: 'relative',
                  background: msg.sender === user._id
                    ? "linear-gradient(135deg, #13e247, #3bb9ff)"
                    : "linear-gradient(135deg, #ff8c00, #ff5500)",
                  border: "2px solid #34B7F1",
                  padding: "5px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              >
                {msg.sender === user._id && (
  <div
    className="message-status d-flex align-items-center gap-1"
    style={{
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {/* If not sent and error, show red exclamation + Retry */}
    {msg.isSent === 0 && msg.isError === 1 && (
  <>
    {isDownloading[msg.id] ? (
      <IonSpinner name="dots" style={{ fontSize: '1.5rem', color: 'gray' ,position:'absolute',top: '50%',left: '50%',transform: 'translate(-50%, -50%)'}} /> // Ion Spinner
    ) : (
      <>
        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.2rem', color: 'red' }}></i>
        <button 
          onClick={() => handleResend(msg)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            position:'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 0,
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          Retry
        </button>
      </>
    )}
  </>
)}


    {/* If not sent and not error, show no wifi */}
    {msg.isSent === 0 && msg.isError === 0 && (
      <i className="bi bi-wifi-off" style={{ fontSize: '1.2rem', color: 'gray',zIndex:'3' }}></i>
    )}

    {/* If sent, show appropriate status */}
    {msg.isSent === 1 && (
      <>
        {msg.status === "pending" && (
          <i className="bi bi-watch" style={{ fontSize: '1.2rem',zIndex:'3' }}></i>
        )}
        {msg.status === "sent" && msg.read === 0 && (
          <i className="bi bi-check" style={{ fontSize: '1.2rem',zIndex:'3' }}></i>
        )}
        {msg.status === "sent" && msg.read === 1 && (
          <i className="bi bi-eye" style={{ fontSize: '1.2rem',zIndex:'3' }}></i>
        )}
      </>
    )}
  </div>
)}
{msg.sender === userdetails.id && msg.isError === 1 && (
  isDownloading[msg.id] ? (
    <IonSpinner name="crescent" color="primary" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
  ) : (
    <button
      onClick={() => handleFileDownload(msg)}
      style={{
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',

        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '0.85rem',
        cursor: 'pointer',
     
      }}
    >
      Retry
    </button>
  )
)}
{msg.isDownload === 1  ? (
  

                <ImageRenderer
                  src={msg.file_path}
                  alt={msg.fileName}
                  style={{ width: '100%', height: '100%', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => {
                    if (msg.isDownload !== 0) {
                      handleImageClick(msg.file_path);
                    } else if (!isDownloading[msg.id] && msg.isError === 0) {
                      handleFileDownload(msg);
                    }
                  }}
                />) : (
                  <>
               
                <img 
                src={msg.thumbnail}
                    alt={msg.fileName}
                          style={{ width: '100%', height: '100%', borderRadius: '8px', cursor: 'pointer' }}
                               onClick={() => {
                    if (msg.isDownload !== 0) {
                      handleImageClick(msg.file_path);
                    } else if (!isDownloading[msg.id] && msg.isError === 0) {
                      handleFileDownload(msg);
                    }
                  }}
                />
                </>
                )}
            
                {/* Timestamp */}
                <small style={{
                  position: "absolute",
                  bottom: "5px",
                  left: "8px",
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontSize: "10px"
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
            
                {/* Show Spinner if downloading */}
                { msg.isError === 0 && isDownloading[msg.id] && (
                  <IonSpinner
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
            
                {/* Show Download Button if not downloaded and not downloading */}
                {msg.isError === 0 && msg.isDownload === 0 && !isDownloading[msg.id] && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDownload(msg);
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: '#34B7F1',
                      padding: '5px 10px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    Download
                  </div>
                )}
              </div>
                              
                               )}
                             </div>
          ) : (
            <div
            className={`max-w-xs p-3 rounded-lg shadow `}
            style={{
              position: 'relative' ,
              maxWidth: "20rem",         // max-w-xs = max-width: 20rem
              padding: "0.75rem",         // p-3 = padding: 0.75rem
              borderRadius: "0.5rem",     // rounded-lg = border-radius: 0.5rem
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // shadow = basic light shadow
              backgroundColor: msg.sender === user._id ? "white" : "#BFDBFE", // bg-white or bg-blue-250
              color: msg.sender === user._id ? "black" : "black"             // text-black or text-red-1000
            }}
        >
            <p>{msg.content}</p>
            <small className="block mb-2 my-2 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</small>
            
            {/* Show message status only if the message is sent by the current user */}
            {msg.sender === user._id && (
  <div className="message-status d-flex align-items-center gap-1" style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
    {/* If not sent and error, show red exclamation circle + retry button */}
    {msg.isSent === 0 && msg.isError === 1 && (
      <>
        <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.2rem', color: 'red' }}></i>
        <button 
          onClick={() => handleResend(msg)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          Retry
        </button>
      </>
    )}
    

    {/* If not sent and not error, show no wifi icon */}
    {msg.isSent === 0 && msg.isError === 0 && (
      <i className="bi bi-wifi-off" style={{ fontSize: '1.2rem', color: 'gray' }}></i>
    )}

    {/* If sent, show based on status and read */}
    {msg.isSent === 1 && (
      <>
      
        {msg.status === "pending" && (
          <i className="bi bi-watch" style={{ fontSize: '1.2rem' }}></i>
        )}
        {msg.status === "sent" && msg.read === 0 && (
          <i className="bi bi-check" style={{ fontSize: '1.2rem' }}></i>
        )}
        {msg.status === "sent" && msg.read === 1 && (
          <i className="bi bi-eye" style={{ fontSize: '1.2rem' }}></i>
        )}
      </>
    )}
  </div>
)}



        </div>
          )}
        </div>
      ))}

      {fullscreenImage && (
  <div
    className="fullscreen-container"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "black",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <ImageRenderer
      src={fullscreenImage}
      alt='image'
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
        pointerEvents: "none", // so image doesn't block button
      }}
    />

    <button
      onClick={closeImageFullscreen}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "black",
        color: "white",
        margin: "10px",
        padding: "10px",
        zIndex: 10000,
        cursor: "pointer",
      }}
      className="close-button"
    >
      Close
    </button>
  </div>
)}

    </div>


            {/* Message input form */}
      <form
  onSubmit={sendMessage}
  className="message-input p-3 bg-light-blue d-flex align-items-center border-top position-relative"
  style={{
    zIndex: 100,
    minHeight: "120px",
    borderRadius: "12px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  }}
>
  {isRecording  ? (
    // 🎤 Voice Recording Mode UI
     <VoiceRecordingUI
      isRecording={isRecording}
      isPaused={isPaused}
      SendAudio={SendAudio}

      
      onCancel={handleCancelRecording}
      sendMessage={sendMessage}
    />
  ) : (
    // ✉️ Traditional Input UI
    <>
      {/* Emoji Button */}
      <button
        type="button"
        className="btn btn-light p-2 me-2"
        style={{
          borderRadius: "50%",
          backgroundColor: "#f0f8ff",
          border: "none",
        }}
        onClick={toggleEmojiPicker}
      >
        😊
      </button>

      {/* Text Input + File Attach */}
      <div className="flex-grow-1 position-relative d-flex align-items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="form-control custom-input"
        />

        {/* File Attach Button */}
        <button
          type="button"
          className="btn btn-light p-2 ms-2"
          style={{
            borderRadius: "50%",
            backgroundColor: "#f0f8ff",
            border: "none",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
          }}
          onClick={toggleFileOptions}
        >
          <FaPaperclip style={{ fontSize: "1.3rem", color: "#007bff" }} />
        </button>

        {/* File Options Popup */}
        {showFileOptions && (
          <div
            className="position-absolute shadow rounded"
            style={{
              bottom: "70px",
              right: "-50px",
              background: "#fff",
              padding: "12px 16px",
              zIndex: 200,
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Image/Video */}
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: "#e0f2ff",
                color: "#007bff",
                borderRadius: "50%",
                width: "55px",
                height: "55px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handlePickMedia}
            >
              <FaImage style={{ fontSize: "1.6rem" }} />
            </button>

            {/* Document */}
         {/*   <button
              type="button"
              className="btn"
              style={{
                backgroundColor: "#e0ffe0",
                color: "#28a745",
                borderRadius: "50%",
                width: "55px",
                height: "55px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handlePickDocument}
            >
              <FaFileAlt style={{ fontSize: "1.6rem" }} />
            </button> */}
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={imageVideoInputRef}
          onChange={handleMediaSelect}
          multiple
          className="d-none"
          accept="image/*,video/*"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelection}
          multiple
          className="d-none"
          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
        />
      </div>

      {/* Traditional Send Button */}
      <button
        type="submit"
        className="btn btn-primary ms-3"
        style={{
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "60px",
          padding: "7px 18px",
          fontSize: "1rem",
        }}
  onMouseDown={handlePressStart2}
  onMouseUp={handlePressEnd2}
  onMouseLeave={handlePressCancel}
  onTouchStart={handlePressStart2}
  onTouchEnd={handlePressEnd2}
  onClick={() => {
    if (!isRecording) sendMessage(); // send normally if not recording
  }}
>
  {isRecording ? "Recording..." : "Send"}
      </button>
    </>
  )}
</form>




{previewVideo && (
  <div
    className="video-fullscreen"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100dvh",
      zIndex: 9999,
      backgroundColor: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <VideoPlayerPlyrWithResolve
      source={{
        type: "video",
        sources: [{ src: previewVideo }],


      }}
      src={previewVideo.file_path || URL.createObjectURL(previewVideo)}
      Name ={previewVideo.file_name}
      Size={previewVideo.file_size} 
      options={{
        controls: ["play", "progress", "current-time", "fullscreen"],
      }}
    />
    <button
      onClick={closeVideoPreview}
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        color: "white",
        backgroundColor: "black",
        padding: "10px",
      }}
    >
      Back
    </button>
  </div>
)}

   {/* Media picker preview (display selected media files) */}
    {/* Media Preview */}


    {showMediaPreview && (
  <div className="fixed top-0 left-0 w-full h-full bg-black z-100000 zi flex flex-col items-center justify-center" style={{zIndex: 100000}}>
    {/* Close Button */}
    <button
  onClick={() => {
    setShowMediaPreview(false);
    setMediaFiles([]);
    setActiveMediaIndex(0);
  }}
  className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full text-lg"
>
  ❌
</button>
    {mediaFiles.length > 0 && (
  <button
  onClick={() => {
    const updatedFiles = mediaFiles.filter((_, i) => i !== activeMediaIndex);
    setMediaFiles(updatedFiles);
    if (activeMediaIndex >= updatedFiles.length) {
      setActiveMediaIndex(Math.max(0, updatedFiles.length - 1));
    }
    if (updatedFiles.length === 0) {
      setShowMediaPreview(false);
    }
  }}
  className="absolute top-4 left-16 z-50 w-10 h-10 flex items-center justify-center bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full text-lg"
>
  🗑️
</button>
)}
  <button
  onClick={handleClosePreview}
  className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-black bg-opacity-60 hover:bg-opacity-90 text-white rounded-full text-lg"
>
  📤
</button>


    {/* Main Preview */}
    <div className="flex-1 flex items-center justify-center w-full">
      {mediaFiles[activeMediaIndex].type.startsWith("image/") ? (
        <ImageRenderer
          src={mediaFiles[activeMediaIndex].path || URL.createObjectURL(mediaFiles[activeMediaIndex])}
          alt=""
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <VideoPlayerPlyrWithResolve
          controls
          Name={mediaFiles[activeMediaIndex].name}
          Size={mediaFiles[activeMediaIndex].size}
          src={ mediaFiles[activeMediaIndex].path || URL.createObjectURL(mediaFiles[activeMediaIndex])}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>

    {/* Thumbnails */}
    <div className="w-full py-2 z-50 px-3 bg-black overflow-x-auto flex gap-2 border-t border-gray-700">
      {mediaFiles.map((file, index) => (
        <div
          key={index}
          onClick={() => setActiveMediaIndex(index)}
          className={`w-16 h-16 rounded-md overflow-hidden border-2 relative ${
            index === activeMediaIndex ? "border-white" : "border-gray-600"
          }`}
        >
                <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click
          const updatedFiles = mediaFiles.filter((_, i) => i !== index);
          setMediaFiles(updatedFiles);
          if (index === activeMediaIndex) setActiveMediaIndex(0);
          if (updatedFiles.length === 0) setShowMediaPreview(false);
        }}
        className="absolute top-1 right-1 z-10 bg-black bg-opacity-60 hover:bg-opacity-90 text-white w-5 h-5 text-xs flex items-center justify-center rounded-full"
      >
        ×
      </button>
          {file.type.startsWith("image/") ? (
            <ImageRenderer
              src={file.path || URL.createObjectURL(file)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <VideoRenderer
              src={file.path || URL.createObjectURL(file)}
              Name ={file.name}
              Size={file.size}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  </div>
)}
{fileUploadError && (
  <div
    onClick={() => setFileUploadError(false)}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white p-4 rounded-md shadow-md max-w-xs w-full text-center"
    >
      <p className="text-red-600 font-semibold mb-4">Failed to upload the file.</p>
      <button
        onClick={() => setFileUploadError(false)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        OK
      </button>
    </div>
  </div>
)}
{fileDownloadError && (
  <div
    onClick={() => setFileDownloadError(false)}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white p-4 rounded-md shadow-md max-w-xs w-full text-center"
    >
      <p className="text-red-600 font-semibold mb-4">
        Failed to download the file.
      </p>
      <button
        onClick={() => setFileDownloadError(false)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        OK
      </button>
    </div>
  </div>
)}
{prodilepicBIg && (
  <div className="image-modal" onClick={() => setprodilepicBIg(false)}>
    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="back-button" onClick={() => setprodilepicBIg(false)}>← Back</button>
      <div className="aspect-container">
        <img src={userdetails.avatar} alt="Profile Full" />
      </div>
    </div>
  </div>
)}



        </div>
    );
};

export default Chatwindo;
