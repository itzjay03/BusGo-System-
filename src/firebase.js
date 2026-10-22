import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZ1XrMw1lfahDdSNauqW1oFYM9QKTnKqw",
  authDomain: "fir-login-15fe0.firebaseapp.com",
  projectId: "fir-login-15fe0",
  storageBucket: "fir-login-15fe0.firebasestorage.app",
  messagingSenderId: "22423324346",
  appId: "1:22423324346:web:376f4b980a3fafee0ba483",
  measurementId: "G-EDS95G832Y"
    // ilagay dito ang config ng BusGo Firebase app
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

export const db = getFirestore(app);