import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBI7t32gnyc1vkwK-wuqUEHycoRJu9T7uQ",
  authDomain: "splitwise-7cd53.firebaseapp.com",
  projectId: "splitwise-7cd53",
  storageBucket: "splitwise-7cd53.firebasestorage.app",
  messagingSenderId: "1001430455740",
  appId: "1:1001430455740:web:5d89e3db5c754bf45b47b9",
  measurementId: "G-EJ57Z4HEY8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
