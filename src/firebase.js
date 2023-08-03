 // Import the functions you need from the SDKs you need
 import { initializeApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ40L_LgIs4Dr3bQLujw4-5kFz-eYGFSw",
  authDomain: "roine-fceb7.firebaseapp.com",
  projectId: "roine-fceb7",
  storageBucket: "roine-fceb7.appspot.com",
  messagingSenderId: "1011812631546",
  appId: "1:1011812631546:web:c38b628002911200da5a43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);