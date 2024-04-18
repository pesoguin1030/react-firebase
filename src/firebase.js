import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCf3EedT3ircIZhrLikuEKnEYsTyFoqJzQ",
  authDomain: "carbon-linebot.firebaseapp.com",
  projectId: "carbon-linebot",
  storageBucket: "carbon-linebot.appspot.com",
  messagingSenderId: "728913584048",
  appId: "1:728913584048:web:a7d35f31ef6ba1c4b60075",
  measurementId: "G-1RZ6T10P7X"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);