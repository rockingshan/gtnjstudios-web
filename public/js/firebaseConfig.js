// Firebase configuration
// IMPORTANT: Replace these values with your actual Firebase project configuration
// You can find these in Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "gtnjstudios-b3140.firebaseapp.com",
  projectId: "gtnjstudios-b3140",
  storageBucket: "gtnjstudios-b3140.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();
