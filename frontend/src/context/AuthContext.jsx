import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const checkLoginStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/verify-user`,
        {
          credentials: "include",
        },
      ); // TODO: route with .env replace

      if (response.ok) {
        setIsLoggedIn(true);
        setErrorMessage("");
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
      setIsAuthChecked(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        checkLoginStatus,
        loading,
        setLoading,
        isGuest,
        setIsGuest,
        isAuthChecked,
        setIsAuthChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
