import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAPPiXi5k3OuK1WtJdlJqzVo58syEnvRqQ",
  authDomain: "projet3a-5e66f.firebaseapp.com",
  projectId: "projet3a-5e66f",
  storageBucket: "projet3a-5e66f.firebasestorage.app",
  messagingSenderId: "320170314810",
  appId: "1:320170314810:web:a3efb68adf13b938ee3903",
};

// 👉 Export de l'app Firebase pour l'utiliser dans _layout.tsx
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
