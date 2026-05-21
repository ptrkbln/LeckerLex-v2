import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ImSpinner2 } from "react-icons/im";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, checkLoginStatus, loading, isAuthChecked } =
    useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthChecked) checkLoginStatus();
  }, [isAuthChecked, checkLoginStatus]);

  if (loading || !isAuthChecked)
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100 " />
    );

  return !isLoggedIn ? (
    <Navigate
      to={`/home/login?redirectTo=${encodeURIComponent(
        location.pathname + location.search,
      )}`}
      replace
    />
  ) : (
    children
  );
}
