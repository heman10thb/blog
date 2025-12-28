// Firebase Configuration
// Uses environment variables with hardcoded fallback for platforms that don't inject env vars at build time

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAprQYWWBPlysi5SP30vmYsdgSkpF2uGYs",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "letuscrackmain.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "letuscrackmain",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "letuscrackmain.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "552460048706",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:552460048706:web:fa08c5de709004f093d0db"
};

export default firebaseConfig;

