import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-OONQuYXw8PGIt5XpEq2dv4EBG-dp_qs",
  authDomain: "academixauth.firebaseapp.com",
  projectId: "academixauth",
  storageBucket: "academixauth.firebasestorage.app",
  messagingSenderId: "975570914948",
  appId: "1:975570914948:web:040d64b8648cd4065b3cd1",
  measurementId: "G-5XB7SRX81N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth instance for use in your app
export const auth = getAuth(app);
