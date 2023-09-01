import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCePkyfmU8zlDGgnkR-sHVpAunNw9A30-k",
  authDomain: "upappp-120c3.firebaseapp.com",
  projectId: "upappp-120c3",
  storageBucket: "upappp-120c3.appspot.com",
  messagingSenderId: "964268878870",
  appId: "1:964268878870:web:fdde1458a70d4c90f61937",
  measurementId: "G-B2QRE923P0",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase
// const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage, firebase };
