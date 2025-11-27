import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtTKxKCEx3bo0D99bwXYUohq7IhlbrBg0",
  authDomain: "kadrom-ffdc2.firebaseapp.com",
  projectId: "kadrom-ffdc2",
  storageBucket: "kadrom-ffdc2.firebasestorage.app",
  messagingSenderId: "1081364826044",
  appId: "1:1081364826044:web:bcada4cc081a9c85630db9",
  measurementId: "G-6RLRK41JGN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);