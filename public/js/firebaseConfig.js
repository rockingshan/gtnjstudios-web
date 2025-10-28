// Firebase configuration
// IMPORTANT: Replace these values with your actual Firebase project configuration
// You can find these in Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyBzzCOHTmexgmAM_5FNnrOXoTiaA2VIHos",
  authDomain: "gtnjstudios-b3140.firebaseapp.com",
  projectId: "gtnjstudios-b3140",
  storageBucket: "gtnjstudios-b3140.firebasestorage.app",
  messagingSenderId: "965460104588",
  appId: "1:965460104588:web:c785892596789436fbf2a9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();
