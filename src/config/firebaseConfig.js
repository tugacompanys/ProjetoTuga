import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdBX1zk5Z5Y8suoMm5_xdfQaQmTQsaiWo",
  authDomain: "myglucoapp-d82c7.firebaseapp.com",
  projectId: "myglucoapp-d82c7",
  storageBucket: "myglucoapp-d82c7.appspot.com",
  messagingSenderId: "516976311002",
  appId: "1:516976311002:web:1d2906cb410496533c83e3",
  measurementId: "G-HHHPJGWYT8"
};

const app = initializeApp(firebaseConfig);

// 🔹 Persistência com AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
export const db = getFirestore(app);
