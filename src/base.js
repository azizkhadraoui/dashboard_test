import { initializeApp } from "firebase/app";



const firebaseConfig = {
    apiKey: "AIzaSyAXTDYnwEijgHwCllrkmye5ssSvR019zAk",
    authDomain: "medtour-test-b44b4.firebaseapp.com",
    projectId: "medtour-test",
    storageBucket: "medtour-test.appspot.com",
    messagingSenderId: "7008508086",
    appId: "1:7008508086:web:1e1d24bda89b2033626e17",
    measurementId: "G-604PG6PBRN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export default app;