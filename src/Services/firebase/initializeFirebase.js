import { initializeApp } from "firebase/app";

const initializeFirebase = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyB1819lJYFTwGlNLppSsD426jlmf9lUrNY",
    authDomain: "ihk-quiz.firebaseapp.com",
    projectId: "ihk-quiz",
    storageBucket: "ihk-quiz.appspot.com",
    messagingSenderId: "813502981642",
    appId: "1:813502981642:web:8a1a8e2abfc4fdf550a1f3",
    measurementId: "G-7QM0JDWSPD",
  };

  return initializeApp(firebaseConfig);
};

export default initializeFirebase;
