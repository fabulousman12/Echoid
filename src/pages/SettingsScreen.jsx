import React, { useState, useEffect } from 'react';
import './Settings.css';
import { useHistory } from 'react-router';
import data from '../data.ts'
import { FaBellSlash } from 'react-icons/fa';
import { Preferences } from '@capacitor/preferences';
const themes = [
  { background: "#1A1A2E", name: "Dark Blue" },
  { background: "#461220", name: "Wine Red" },
  { background: "#192A51", name: "Steel Blue" },
  { background: "#F7B267", name: "Soft Orange" },
  { background: "#F25F5C", name: "Coral Red" },
  { background: "#231F20", name: "Charcoal" }
];

const Settings = ({ ForAllSounfds, setForAllSounds, setismute, isnotmute, mode, setMode, messagesRef,  }) => {
  const [view, setView] = useState('main');
  const [notificationsEnabled, setNotificationsEnabled] = useState(isnotmute);
  const [theme, setTheme] = useState('#ffffff');
  const [appver , setappver] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [fontSize, setFontSize] = useState("medium");
const [bubbleStyle, setBubbleStyle] = useState("rounded");
const [readReceipts, setReadReceipts] = useState(true);
const [timestampFormat, setTimestampFormat] = useState("12hr");

  const [storageStats, setStorageStats] = useState({
    total: 0,
    image: 0,
    video: 0,
    audio: 0,
    document: 0,
  });
  const history = useHistory()
  const formattedDate = new Date(data.UpdatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const mutedUserIds = JSON.parse(localStorage.getItem('mutedUsers') || '[]');
const userMainList = JSON.parse(localStorage.getItem('usersMain') || '[]');

// Filter full user objects whose ID exists in mutedUsers
const mutedUsers = userMainList.filter(user => mutedUserIds.includes(user.id));
console.log(mutedUsers);
  useEffect(() => {
    const saved = localStorage.getItem('chatThemeColor');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("chatUISettings");
    if (saved) {
      const s = JSON.parse(saved);
      setFontSize(s.fontSize || "medium");
      setBubbleStyle(s.bubbleStyle || "rounded");
      setReadReceipts(s.readReceipts !== false);
      setTimestampFormat(s.timestampFormat || "12hr");
      handleThemeChange(s.theme || themes[0]);
      handleModeChange(s.mode || "normal");
    }
  }, []);
  

  useEffect(() => {

    setappver(data.AppVersion)
    if (messagesRef.current) {
      const stats = { total: 0, image: 0, video: 0, audio: 0, document: 0 };
      messagesRef.current.forEach(msg => {
        if (msg.type === 'file') {
          const size = msg.file_size || 0;
          stats.total += size;
          stats[msg.file_type] += size;
        }
      });
      setStorageStats(stats);
    }
  }, [messagesRef]);
const onBackToHome = () => {
  
    history.goBack();
}
const handleSoundUpload = () => {
  return new Promise((resolve, reject) => {
    // Open native file chooser for audio files
    window.FileChooser.open(
      { mime: 'audio/*' },
      uri => {
        // Resolve content:// or file:// URI to native file path
        window.FilePath.resolveNativePath(
          uri,
          nativePath => {
            console.log('Native file path:', nativePath);
            const fileName = nativePath.split('/').pop();
            const newSound = { name: fileName, path: nativePath };

            // Save in localStorage and Preferences
            localStorage.setItem('ForAllSoundNotification', JSON.stringify(newSound));
            Preferences.set({
              key: 'ForAllSoundNotification',
              value: JSON.stringify(newSound),
            });

            // Update state
            setForAllSounds(newSound);

            resolve(newSound);
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
};


  const handleThemeChange = (themeObj) => {
    setTheme(themeObj.background);
    localStorage.setItem('chatThemeColor', themeObj.background);
    Preferences.set({
      key: 'chatThemeColor',
      value: themeObj.background,
    });
  };

  const handleNotificationToggle = () => {
    const value = !notificationsEnabled;
    setNotificationsEnabled(value);
    localStorage.setItem('ismute', JSON.stringify(value));
    Preferences.set({
      key: 'ismute',
      value: JSON.stringify(value),
    });
    setismute(value);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    localStorage.setItem('mode', newMode);
    Preferences.set({
      key: 'mode',
      value: newMode,
    });
  };
  const handleUnmuteUser = (userId) => {
    const updatedMutedUsers = mutedUserIds.filter(id => id !== userId);
    localStorage.setItem('mutedUsers', JSON.stringify(updatedMutedUsers));
    Preferences.set({
      key: 'mutedUsers',  
      value: JSON.stringify(updatedMutedUsers),
    });
    setSelectedUsers(prev => prev.filter(id => id !== userId)); // Remove from selected users if unmuted
  };

  const handleClearMutedUsers = () => {
    if (window.confirm('Are you sure you want to clear all muted users?')) {
      localStorage.setItem('mutedUsers', JSON.stringify([]));
      Preferences.set({
        key: 'mutedUsers',
        value: JSON.stringify([]),
      });
      setSelectedUsers([]);
    }
  };

  const resetToDefaults = () => {
    setFontSize("medium");
    setBubbleStyle("rounded");
    setReadReceipts(true);
    setTimestampFormat("12hr");
    // Also reset theme and mode if needed
  };
  
  const saveSettings = () => {
    const settings = {
      fontSize,
      bubbleStyle,
      readReceipts,
      timestampFormat,
      theme,
      mode,
    };
    localStorage.setItem("chatUISettings", JSON.stringify(settings));
    Preferences.set({
      key: 'chatUISettings',  
      value: JSON.stringify(settings),
    });
    alert("Settings saved!");
  };
  
  

  const handleLongPress = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const formatSize = size => `${(size / 1024 / 1024).toFixed(2)} MB`;

  const renderMain = () => (
    <div className="settings-main">
      <div className="settings-header">
        <button onClick={onBackToHome}>⬅ </button>
        <h1> Settings</h1>
      </div>
      <div className="settings-options">
        <button onClick={() => setView('notifications')}>🔔 Notifications</button>
        <button onClick={() => setView('ui')}>🎨 UI Settings</button>
        <button onClick={() => setView('storage')}>💾 Storage</button>
        <button onClick={() => setView('About')}>🎨 About</button>
      </div>
    </div>
  );

  const renderHeader = (title) => (
    <div className="fullscreen-header">
      <button onClick={() => setView('main')}>⬅ Back</button>
      <h2>{title}</h2>
    </div>
  );

  const renderNotifications = () => (
    <div className="fullscreen">
      <div className="fullscreen-header">
        <button onClick={() => setView('main')}>⬅ Back</button>
        <h2>Notifications</h2>
      </div>
      <div className="fullscreen-body">
        <label>
          <input type="checkbox" checked={notificationsEnabled} onChange={handleNotificationToggle} />
          Enable Notifications
        </label>
<div>
  <label>Upload Sound:</label>
  <button
    onClick={() => {
      handleSoundUpload().catch(() => alert('Failed to pick audio file'));
    }}
    className="px-3 py-1 border rounded bg-blue-500 text-white"
  >
    Pick Audio File
  </button>
</div>

        {ForAllSounfds?.path && (
          <div>
            <p>Current Sound: {ForAllSounfds.name}</p>
            <button onClick={() => new Audio(ForAllSounfds.path).play()}>▶ Play</button>
          </div>
        )}
        <div className="muted-users-section">
          <h5>Muted Users</h5>
          <button onClick={handleClearMutedUsers} className="clear-muted-button">
            Clear All Mutes
          </button>
          <div
            className="muted-users-list"
            style={{ height: '300px', overflowY: 'scroll', marginTop: '10px' }}
          >
            {mutedUsers.length === 0 ? (
              <p className="text-muted">No muted users</p>
            ) : (
              mutedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`list-group-item user-card d-flex justify-content-between align-items-center ${
                    selectedUsers.includes(user.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleUnmuteUser(user.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleLongPress(user.id);
                  }}
                  style={{
                    
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                >
                  <img
                    src={user.avatar || img}
                    alt={`${user.name}'s avatar`}
                    loading="lazy"
                    className="rounded-circle"
                    style={{ marginRight: '10px', width: '48px', height: '48px', aspectRatio: '4/3' }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 user-name">{user.name}</h6>
                    <FaBellSlash
                      className="ms-2"
                      style={{ color: 'gray', fontSize: '0.9rem' }}
                      title="Muted"
                    />
                    <small className="text-muted last-message">{user.lastMessage}</small>
                  </div>
                  <div className="text-right">
                    {user.unreadCount > 0 && <span className="badge bg-primary">{user.unreadCount}</span>}
                    <small className="text-muted timestamp d-block">
                      {user.timestamp ? new Date(user.timestamp).toLocaleTimeString() : ''}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
          {selectedUsers.length > 0 && (
         <div className="unmute-controls">
         <button
           onClick={() => selectedUsers.forEach((id) => handleUnmuteUser(id))}
           className="unmute-selected-button"
         >
           Unmute Selected
         </button>
         <button
           onClick={() => setSelectedUsers([])}
           className="unmute-selected-button"
         >
           Cancel selected
         </button>
       </div>
          )}
        </div>
      </div>
    </div>
  );
  const renderUISettings = () => (
    <div className="fullscreen">
      {renderHeader("UI Settings")}
      <div className="fullscreen-body">
        
        {/* Theme Selection */}
        <h3>Theme</h3>
        <div className="theme-selector">
          {themes.map((t, i) => (
            <div
              key={i}
              className="theme-swatch"
              style={{ backgroundColor: t.background }}
              onClick={() => handleThemeChange(t)}
              title={t.name}
            />
          ))}
        </div>
        <div className="theme-preview" style={{ backgroundColor: theme }}>
          Chat Preview
        </div>
  
        {/* Mode Selection */}
        <h3>Mode</h3>
        <div className="mode-buttons">
          <button className={mode === 'normal' ? 'selected' : ''} onClick={() => handleModeChange('normal')}>
            Normal
          </button>
          <button className={mode === 'swipe' ? 'selected' : ''} onClick={() => handleModeChange('swipe')}>
            Swipe
          </button>
        </div>
  
        {/* Font Size Selection */}
        <h3>Font Size</h3>
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
          <option value="small">Small</option>
          <option value="medium">Medium (default)</option>
          <option value="large">Large</option>
        </select>
  
        {/* Chat Bubble Style */}
        <h3>Chat Bubble Style</h3>
        <div className="bubble-style-buttons">
          <button className={bubbleStyle === 'rounded' ? 'selected' : ''} onClick={() => setBubbleStyle('rounded')}>
            Rounded
          </button>
          <button className={bubbleStyle === 'square' ? 'selected' : ''} onClick={() => setBubbleStyle('square')}>
            Square
          </button>
        </div>
  
        {/* Read Receipts Toggle */}
        <h3>Read Receipts</h3>
        <label>
          <input
            type="checkbox"
            checked={readReceipts}
            onChange={() => setReadReceipts(!readReceipts)}
          />
          Show read receipts
        </label>
  
        {/* Timestamp Format */}
        <h3>Timestamp Format</h3>
        <select value={timestampFormat} onChange={(e) => setTimestampFormat(e.target.value)}>
          <option value="12hr">12-hour (e.g., 2:00 PM)</option>
          <option value="24hr">24-hour (e.g., 14:00)</option>
        </select>
  
        {/* Action Buttons */}
        <div className="settings-actions">
          <button onClick={resetToDefaults} className="reset-button">Reset to Defaults</button>
          <button onClick={saveSettings} className="save-button">Save Settings</button>
        </div>
      </div>
    </div>
  );
  

  const renderStorage = () => (
    <div className="fullscreen">
      {renderHeader("Storage")}
      <div className="fullscreen-body">
        <p>Total: {formatSize(storageStats.total)}</p>
        {['image', 'video', 'audio', 'document'].map(type => (
          <div key={type} className="storage-bar-row">
            <label>{type}</label>
            <progress value={storageStats[type]} max={storageStats.total} />
            <span>{formatSize(storageStats[type])}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="fullscreen">
  {renderHeader("About")}
    <div className="fullscreen-body">
      <h3>App Information</h3>
      <p><strong>Version:</strong> {appver}</p>
      <p><strong>Build Date:</strong> {formattedDate}</p>

      <h3>Technologies Used</h3>
      <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
        <li>React & React Native</li>
        <li>Node.js + Express</li>
        <li>WebSocket / Socket.IO</li>
        <li>MySQL & MongoDB</li>
        <li>WatermelonDB (for mobile offline storage)</li>
        <li>AWS S3 (for file storage)</li>
      </ul>

      <h3>Developer Notes</h3>
      <p>This app was built to combine modern communication with efficient file sharing, real-time messaging, and a polished UI inspired by WhatsApp and Telegram.</p>

      <h3>Credits</h3>
      <p>Designed and developed by [Your Name or Team Name]</p>
    </div>
  </div>
  );
  return (
    <>
      {view === 'main' && renderMain()}
      {view === 'notifications' && renderNotifications()}
      {view === 'ui' && renderUISettings()}
      {view === 'storage' && renderStorage()}
      {view === 'About' && renderAbout()}
    </>
  );
};

export default Settings;
