import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { ImSpinner2 } from "react-icons/im";

export default function VerifyEmailPage() {
  const { isLoggedIn, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Logged-in user should not have acccess to email verify page
  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) {
      navigate("/home", { replace: true });
    }
  }, [loading, isLoggedIn, navigate]);

  // Prevent page flicker while auth status is loading
  if (loading || isLoggedIn) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100 " />
    );
  }

  return (
    <div className="flex flex-col items-center text-gray-200">
      <div className="text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
          Registration Successful! 🎉
        </h2>
        <p className="text-lg sm:text-xl mb-8 leading-relaxed">
          One last step! We have sent a verification email to your inbox. <br />
          Please check your email and confirm your address to complete your
          registration.
        </p>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
          onClick={() => navigate("/home")}
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
