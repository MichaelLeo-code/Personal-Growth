// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getReactNativePersistence } from "./firebase/react-native-persistence";

const firebaseConfig = {
  apiKey: "AIzaSyAX5VMvwgfuNvzkOLgKKXntZbt1z61P0Qg",
  authDomain: "pga1-f49e3.firebaseapp.com",
  projectId: "pga1-f49e3",
  storageBucket: "pga1-f49e3.firebasestorage.app",
  messagingSenderId: "868666344562",
  appId: "1:868666344562:web:014e740decf4c53d53aeeb",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const FIREBASE_DB = getFirestore(FIREBASE_APP);
