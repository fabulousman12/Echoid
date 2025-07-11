import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swipe',
  appName: 'Echoid',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    CapacitorSQLite: {
      android: {
        debug: true, // Enables debug mode for the SQLite plugin
        location: "default" // Sets the location of the database
      }
    },    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },FileChooser: {},
  Media: {
    androidGalleryMode: true
  },
  UnityAds: {
      gameId: "5874964",
      testMode: true
    }
  
  },
  
};

export default config;
