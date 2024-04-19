import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIwgMix9qYE1fTZXGRSxk6xaqB3R4vV0A",
  authDomain: "carbon-sms.firebaseapp.com",
  projectId: "carbon-sms",
  storageBucket: "carbon-sms.appspot.com",
  messagingSenderId: "629532014082",
  appId: "1:629532014082:web:cd6314dbb29b36d174591b",
  measurementId: "G-0Q91CN1DTC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);