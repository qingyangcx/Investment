import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD34U1jY1e2c-QeYTodDLJHpDUMfvUtcIQ",
  authDomain: "invest-57bc7.firebaseapp.com",
  projectId: "invest-57bc7",
  storageBucket: "invest-57bc7.firebasestorage.app",
  messagingSenderId: "67829343175",
  appId: "1:67829343175:web:c0651454e6dc9c21fa6fe2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
