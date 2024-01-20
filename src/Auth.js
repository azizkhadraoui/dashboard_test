import React, { useEffect, useState } from "react";
import app from "./base.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(user+" user");
      setCurrentUser(user);
      setPending(false);
    });

    return () => unsubscribe(); // Clean up the listener when unmounting
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign In Error:", error);
    }
  };

  const signInWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      console.error("Facebook Sign In Error:", error);
    }
  };

  if (pending) {
    return <>Loading...</>;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        signInWithGoogle,
        signInWithFacebook
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setCurrentUser(user);
      } else {
        // User is signed out.
        setCurrentUser(null);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return { currentUser };
};
