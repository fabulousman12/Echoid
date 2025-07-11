import React from 'react';
import './StatusCard.css';
import { ffmpeg_thumnail } from 'ionic-thumbnail'; // adjust path as needed
import Maindata from '../data';
import {  showRewardedAd } from '../services/pluginHelper';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';

const StatusCard = ({ avatar, name, timestamp, type = 'normal' }) => {
  const AD_URL = 'https://www.profitableratecpm.com/y50ksh6n?key=6a363443c8d4cfdfb428a4274ab5b58e';

const handleAdClick = async () => {
  try {
    const res = await ffmpeg_thumnail.showStartioRewarded();

    if (res.rewarded) {
      alert('Thanks for supporting us! 🎉');

      let user = JSON.parse(localStorage.getItem('currentuser'));
      const token = localStorage.getItem('token');
      if (!user || !token) return console.warn('User or token missing');

      const now = Date.now();
      const timeSpent = 30; // Example: assume 30s ad duration

      // Set reset point if not exists
      if (!user.weeklyResetStart) {
        user.weeklyResetStart = now;
        user.weeklyAdTime = 0;
      }

      // Reset weeklyAdTime if more than 7 days
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
if (now - (user.weeklyResetStart || 0) > oneWeek) {
  user.weeklyAdTime = timeSpent; // reset to only current session
  user.weeklyResetStart = now;
}

// 🔁 Send updated weeklyAdTime to server
await fetch(`https://${Maindata.SERVER_URL}/user/weeklyaddtime`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Auth': token
  },
  body: JSON.stringify({
    minutes: user.weeklyAdTime  // in minutes
  })
});

      // Update ad times
      user.adTime = (user.adTime || 0) + timeSpent;
      user.weeklyAdTime = (user.weeklyAdTime || 0) + timeSpent;

      // Save updated user to localStorage
      localStorage.setItem('currentuser', JSON.stringify(user));

      // Send update to server
      await fetch('https://${Maindata.SERVER_URL}/user/addtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify({
   
          minutes: timeSpent,
          weeklyAdTime: user.weeklyAdTime,
          watchedAt: now
        })
      });

    } else {
      alert('Ad skipped or not completed.');
    }
  } catch (error) {
    console.error('Error showing rewarded ad:', error);
  }
};

// const handleAdClickWithUnityAds = async () => {
//   try {
//     const userStr = localStorage.getItem('currentuser');
//     const token = localStorage.getItem('token');
//     const gameId = '5874964'; // Your Unity Game ID
//     const videoAdPlacementId = 'defaultZone';
//     const rewardedVideoAdPlacementId = 'rewardedVideoZone';
//     const isTest = true;
//     const adWatchDuration = 30;
//     const now = Date.now();

//     if (!userStr || !token) {
//       alert('Login required to watch ads.');
//       return;
//     }

//     const user = JSON.parse(userStr);

//     // ⚙️ Setup Unity Ads using CranberryGame plugin
//     const initUnityAds = () => {
//       return new Promise((resolve, reject) => {
//         if (window?.unityads?.setUp) {
//           window.unityads.setUp(gameId, videoAdPlacementId, rewardedVideoAdPlacementId, isTest);

//           // Optional: add callback for load event
//           window.unityads.onRewardedVideoAdLoaded = () => {
//             console.log('Rewarded ad loaded');
//             resolve(true);
//           };

//           window.unityads.onRewardedVideoAdCompleted = () => {
//             console.log('User completed ad');
//             resolve(true);
//           };

//           window.unityads.onRewardedVideoAdHidden = () => {
//             console.log('Rewarded ad hidden');
//           };

//           window.unityads.onRewardedVideoAdShown = () => {
//             console.log('Rewarded ad shown');
//           };

//           // Edge case: fallback if onRewardedVideoAdLoaded doesn't fire
//           setTimeout(() => resolve(true), 2000); // timeout fallback
//         } else {
//           reject('UnityAds plugin not available (setUp)');
//         }
//       });
//     };

//     // 🎬 Show the ad
//     const showRewardedAd = () => {
//       return new Promise((resolve, reject) => {
//         if (window?.unityads?.loadedRewardedVideoAd && window.unityads.loadedRewardedVideoAd()) {
//           window.unityads.onRewardedVideoAdCompleted = () => {
//             console.log('Ad completed!');
//             resolve(true);
//           };

//           window.unityads.showRewardedVideoAd();
//         } else {
//           reject('Rewarded ad not loaded');
//         }
//       });
//     };

//     // 🛰️ Sync reward with backend
//     const syncReward = async (updatedUser) => {
//       localStorage.setItem('currentuser', JSON.stringify(updatedUser));

//       await fetch(`https://${Maindata.SERVER_URL}/user/weeklyaddtime`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Auth: token,
//         },
//         body: JSON.stringify({ minutes: updatedUser.weeklyAdTime }),
//       });

//       await fetch(`https://${Maindata.SERVER_URL}/user/addtime`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Auth: token,
//         },
//         body: JSON.stringify({
//           minutes: adWatchDuration,
//           weeklyAdTime: updatedUser.weeklyAdTime,
//           watchedAt: now,
//         }),
//       });
//     };

//     // 📡 Run full flow
//     await initUnityAds();
//     const adSuccess = await showRewardedAd();

//     if (!adSuccess) {
//       alert('Ad was skipped or failed.');
//       return;
//     }

//     alert('Thanks for supporting us! 🎉');

//     const oneWeek = 7 * 24 * 60 * 60 * 1000;
//     if (!user.weeklyResetStart || now - user.weeklyResetStart > oneWeek) {
//       user.weeklyAdTime = 0;
//       user.weeklyResetStart = now;
//     }

//     user.adTime = (user.adTime || 0) + adWatchDuration;
//     user.weeklyAdTime = (user.weeklyAdTime || 0) + adWatchDuration;

//     await syncReward(user);
//   } catch (error) {
//     console.error('Unity Ad Error:', error);
//     alert(`Ad error: ${error}`);
//   }
// };



const handleAdClickWithAdsterra = async () => {
  try {
    const userStr = localStorage.getItem('currentuser');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      console.warn('User or token missing');
      return;
    }

    let user = JSON.parse(userStr);
    const now = Date.now();
    const adWatchDuration = 30; // Assume 30s reward time

    // Open Adsterra ad in a browser tab
    const browser = InAppBrowser.create(AD_URL, '_blank', {
        location: 'no',
    hidden: 'no',
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'no',
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'yes',
    });

    // Wait for the user to close the ad
    browser.on('exit').subscribe(async () => {
      alert('Thanks for supporting us! 🎉');

      // Weekly reset logic
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (!user.weeklyResetStart) {
        user.weeklyResetStart = now;
        user.weeklyAdTime = 0;
      } else if (now - user.weeklyResetStart > oneWeek) {
        user.weeklyAdTime = 0;
        user.weeklyResetStart = now;
      }

      user.adTime = (user.adTime || 0) + adWatchDuration;
      user.weeklyAdTime = (user.weeklyAdTime || 0) + adWatchDuration;

      localStorage.setItem('currentuser', JSON.stringify(user));

      // 🛰️ Update weeklyAdTime
      await fetch(`https://${Maindata.SERVER_URL}/user/weeklyaddtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify({
          minutes: user.weeklyAdTime
        })
      });

      // 🛰️ Log individual ad view
      await fetch(`https://${Maindata.SERVER_URL}/user/addtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify({
          minutes: adWatchDuration,
          weeklyAdTime: user.weeklyAdTime,
          watchedAt: now
        })
      });
    });
  } catch (err) {
    console.error('Failed to show ad or update:', err);
  }
};

const handleAdClick2 = async () => {
  try {
    const userStr = localStorage.getItem('currentuser');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      console.warn('User or token missing');
      return;
    }

    let user = JSON.parse(userStr);
    const now = Date.now();
    const adWatchDuration = 30; // reward time in seconds

    // Function to show Unity Ad as a Promise
    const showUnityRewardedAdWithPromise = () => {
      return new Promise((resolve, reject) => {
        const handler = (event) => {
          resolve(event.detail);
          window.removeEventListener("AdCompleted", handler);
        };

        window.addEventListener("AdCompleted", handler);

        if (window.NativeAds && typeof window.NativeAds.showUnityRewardedAd === "function") {
          window.NativeAds.showUnityRewardedAd();
        } else {
          window.removeEventListener("AdCompleted", handler);
          reject("Ad not supported on this platform or not ready.");
        }
      });
    };

    // Show Unity Ad and wait for completion
    const result = await showUnityRewardedAdWithPromise();

    if (result?.placementId) {
      alert('🎉 Thanks for watching the ad and supporting us!');

      // Weekly reset logic
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (!user.weeklyResetStart) {
        user.weeklyResetStart = now;
        user.weeklyAdTime = 0;
      } else if (now - user.weeklyResetStart > oneWeek) {
        user.weeklyAdTime = 0;
        user.weeklyResetStart = now;
      }

      user.adTime = (user.adTime || 0) + adWatchDuration;
      user.weeklyAdTime = (user.weeklyAdTime || 0) + adWatchDuration;

      localStorage.setItem('currentuser', JSON.stringify(user));

      // Update weeklyAdTime
      await fetch(`https://${Maindata.SERVER_URL}/user/weeklyaddtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify({
          minutes: user.weeklyAdTime
        })
      });

      // Log individual ad view
      await fetch(`https://${Maindata.SERVER_URL}/user/addtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        },
        body: JSON.stringify({
          minutes: adWatchDuration,
          weeklyAdTime: user.weeklyAdTime,
          watchedAt: now
        })
      });

    } else {
      alert("⚠️ Ad was skipped or failed.");
    }

  } catch (err) {
    console.error("Ad failed or update error:", err);
  }
};



  if (type === 'ad') {
    return (
      <div className="ad-horizontal-box">
        <button className="watch-ad-btn" onClick={handleAdClick2}>
          🎬 Watch & Support
        </button>
        <p className="support-message">
          ❤️ Help us keep this app free. Every ad you watch supports development. Thank you!
        </p>
      </div>
    );
  }

  return (
    <div className="status-card normal-card">
      <img src={avatar} alt="avatar" className="status-avatar" />
      <div className="status-details">
        <h6 className="status-name">{name}</h6>
        <small className="status-timestamp">{timestamp}</small>
      </div>
    </div>
  );
};

export default StatusCard;
