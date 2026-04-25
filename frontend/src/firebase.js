// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAdtVjNw766K0zIwZmfN38qVI0ZF9UTWA",
    authDomain: "ai-chemistry-tutor.firebaseapp.com",
    projectId: "ai-chemistry-tutor",
    storageBucket: "ai-chemistry-tutor.firebasestorage.app",
    messagingSenderId: "706492059851",
    appId: "1:706492059851:web:0ee9348362f3186deb4b4e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;