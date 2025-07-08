// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXJczcDZ-XXwqOVidbsdAE5rEarQ_NVQ8",
  authDomain: "frontend-final-project-71b10.firebaseapp.com",
  projectId: "frontend-final-project-71b10",
  storageBucket: "frontend-final-project-71b10.firebasestorage.app",
  messagingSenderId: "949024928224",
  appId: "1:949024928224:web:2e3b8bcb4281e9f19abb85",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
