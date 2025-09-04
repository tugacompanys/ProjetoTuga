import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- importar Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAdBX1zk5Z5Y8suoMm5_xdfQaQmTQsaiWo",
  authDomain: "myglucoapp-d82c7.firebaseapp.com",
  projectId: "myglucoapp-d82c7",
  storageBucket: "myglucoapp-d82c7.appspot.com", // <-- corrigido
  messagingSenderId: "516976311002",
  appId: "1:516976311002:web:1d2906cb410496533c83e3",
  measurementId: "G-HHHPJGWYT8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Exporta Firestore
export const db = getFirestore(app);