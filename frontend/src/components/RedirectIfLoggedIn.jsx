import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RedirectIfLoggedIn() {
  const { isLoggedIn, checkLoginStatus, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        navigate("/home", { replace: true });
      } else {
        checkLoginStatus();
      }
    }
  }, [isLoggedIn, navigate, loading, checkLoginStatus]);
  return null; // component doesnt render anything
}
