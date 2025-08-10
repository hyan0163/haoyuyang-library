// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6rcWHsAL5-pN3dE7uXuNSLaWg7f4_4Sw",
  authDomain: "week7-haoyu-f8cb5.firebaseapp.com",
  projectId: "week7-haoyu-f8cb5",
  storageBucket: "week7-haoyu-f8cb5.firebasestorage.app",
  messagingSenderId: "963963724391",
  appId: "1:963963724391:web:b36fcf70ada2c8c9e92ac2"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const db = getFirestore()
export default db
