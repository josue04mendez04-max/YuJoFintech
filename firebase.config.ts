import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration credentials
// Note: These are client-side Firebase credentials that are safe to expose in the frontend.
// Security is enforced through Firestore Security Rules on the backend.
// The Firestore rules restrict access to the collections: reportes, iglesias, soporte, 
// actividades, and yujofintech.
const firebaseConfig = {
  apiKey: "AIzaSyB6YNzBMN3c4kM2T11nt3iJC9XwLwzWmUI",
  authDomain: "easyrep-a1.firebaseapp.com",
  projectId: "easyrep-a1",
  storageBucket: "easyrep-a1.firebasestorage.app",
  messagingSenderId: "669667654952",
  appId: "1:669667654952:web:9f5d950eaa223ef4d4a41d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
