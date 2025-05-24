import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7wQ7km7G8PREprvBHqZw2s2dWfEN-0-U",
  authDomain: "manageme-13e59.firebaseapp.com",
  projectId: "manageme-13e59",
  storageBucket: "manageme-13e59.appspot.com",
  messagingSenderId: "181492680229",
  appId: "1:181492680229:web:f0074bfa69ac27c7b9a1cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }; 