import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const checkLoginStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/verify-user`,
        {
          credentials: "include",
        }
      ); // TODO: route with .env replace

      if (response.ok) {
        setIsLoggedIn(true);
        setErrorMessage("");
      } else {
        setIsLoggedIn(false);
        setErrorMessage(
          "This feature is available to registered users only. Please log in to access it."
        );
      }
    } catch (error) {
      setIsLoggedIn(false);
      setErrorMessage("An error occured. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        errorMessage,
        setErrorMessage,
        checkLoginStatus,
        loading,
        setLoading,
        isGuest,
        setIsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
