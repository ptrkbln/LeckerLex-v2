import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export function useLogout() {
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        toast.error("Something went wrong while logging you out.");
        return;
      }
      navigate("/");
      // Delay auth state update so navigation to landing page happens before ProtectedRoute redirects to login
      setTimeout(() => {
        setIsLoggedIn(false);
      }, 0);
    } catch {
      toast.error("Connection failed.");
    }
  };

  return handleLogout;
}
