import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'QR Forge',
  slug: 'qr-forge',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'qrforge',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0f0f14',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.artisanintuition.qrforge',
    infoPlist: {
      NSPhotoLibraryAddUsageDescription:
        'QR Forge saves QR code images to your photo library.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#0f0f14',
    },
    package: 'com.artisanintuition.qrforge',
    permissions: [
      'READ_MEDIA_IMAGES', // Required by expo-media-library to save QR images on Android 13+
    ],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/images/QR_Scanner.png',
    name: 'QR Forge',
    shortName: 'QR Forge',
    description: 'Generate QR codes for URLs, text, and contacts. Save and manage your QR history.',
    themeColor: '#7c6af7',
    backgroundColor: '#0f0f14',
    lang: 'en',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-media-library',
      {
        photosPermission: 'QR Forge saves QR code images to your photo library.',
        savePhotosPermission: 'QR Forge saves QR code images to your photo library.',
        isAccessMediaLocationEnabled: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'a328e655-ab36-4404-a706-206d0af92fc7',
    },
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
});
