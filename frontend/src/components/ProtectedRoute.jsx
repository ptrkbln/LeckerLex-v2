import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, checkLoginStatus, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoggedIn) checkLoginStatus();
  }, [isLoggedIn]);

  if (loading)
    return (
      <div className="flex flex-col items-center text-gray-800 pt-52">
        <div className="text-center px-4 text-gray-200">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
            Loading...
          </h2>
          <p className="text-lg sm:text-xl mb-8 leading-relaxed">
            We're checking your authentication status. Please wait a moment.
          </p>
        </div>
      </div>
    );

  return !isLoggedIn ? <Navigate to="/home/login" replace /> : children;
}
