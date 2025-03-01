// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAvcC1vA8iO6YN5iw3lF1garmvTCWnkfzA",
    authDomain: "fitquest-21fd4.firebaseapp.com",
    projectId: "fitquest-21fd4",
    storageBucket: "fitquest-21fd4.firebasestorage.app",
    messagingSenderId: "831625255395",
    appId: "1:831625255395:web:b2f03224950ef69f01e8d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export { auth, db };
