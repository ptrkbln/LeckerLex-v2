import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { isLoggedIn, setIsLoggedIn, loading } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple form submissions while request is in progress
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";
  const navigate = useNavigate();
  const protectedFromGuestRoutes = [
    "/home/favorites",
    "/home/shopping-list",
    "/home/shopping-list",
    "/home/journal",
    "/home/profile",
  ]; // Routes accessible only to logged-in users

  // Logged-in user should not have acccess to login page
  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, isLoggedIn, redirectTo, navigate]);

  // Clear inline validation/error messages once form fields are non-empty
  useEffect(() => {
    if (email && password && errorMessage) setErrorMessage("");
  }, [email, password, errorMessage]);

  // Prevent page flicker while auth status is loading/processing
  if (loading || isLoggedIn) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100 " />
    );
  }

  const handleContinueAsGuest = () => {
    if (protectedFromGuestRoutes.includes(redirectTo)) {
      navigate("/home");
    } else {
      navigate(redirectTo);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email && !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    } else if (!email) {
      setErrorMessage("Please enter your email.");
      return;
    } else if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("The login information entered is incorrect.");
        } else if (response.status === 403) {
          toast.error("Please verify your email before signing in.");
        } else {
          toast.error("We couldn't sign you in right now.");
        }
        return;
      }

      setIsLoggedIn(true);
      navigate(redirectTo);
    } catch {
      toast.error("Connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow">
      {/* Main Content */}
      <div className="flex justify-center">
        {/* Sign-in Form */}
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl">
          <form onSubmit={handleSignIn}>
            <h2 className="text-2xl font-bold text-white/90 text-center mb-14">
              Sign In
            </h2>
            <div className="mb-6">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>
            <div className="mb-3.5">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="text-rose-400 text-center absolute left-1/2 -translate-x-1/2 text-sm w-full">
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              className="w-full flex justify-center items-center px-4 py-2 mt-12 text-md bg-green-500 text-white rounded-3xl shadow-lg hover:bg-green-700 transition duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ImSpinner2 className="animate-spin size-6" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="text-center mt-6 text-sm text-gray-300">
            <div className="text-center mt-4 text-sm text-gray-300">
              No profile?{" "}
              <button
                className="text-blue-400 font-medium hover:underline"
                onClick={() => navigate("/home/register")}
              >
                Register here
              </button>
            </div>
            <div className="text-center mt-3 text-sm">
              <button
                className="text-blue-400 hover:scale-105"
                onClick={handleContinueAsGuest}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
