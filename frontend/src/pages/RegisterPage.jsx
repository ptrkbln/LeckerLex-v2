import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple form submissions while request is in progress
  const { isLoggedIn, loading } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const inputClasses =
    "w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 transition";

  // Logged-in user should not have acccess to register page
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-=_+])[A-Za-z\d@$!%*?&^#\-=_+]{6,}$/;
    const invalidPasswordCharsRegex = /[^A-Za-z0-9@$!%*?&^#\-=_+]/;

    if (!email || !password || !name) {
      setErrorMessage("Please enter your username, email and password.");
      return;
    }

    if (!nameRegex.test(name)) {
      setErrorMessage(
        "Username must be 3-15 characters and contain only letters, numbers, and underscores.",
      );
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email format.");
      return;
    }

    if (invalidPasswordCharsRegex.test(password)) {
      setErrorMessage(
        "Password contains invalid characters. Allowed special characters: @$!%*?&^#-=_+",
      );
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must contain 6+ characters, uppercase, lowercase, number, and special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!isChecked) {
      setErrorMessage(
        "To register you must agree to the terms and conditions.",
      );
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/signup`,
        {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("This email address is already in use.");
        } else {
          toast.error(
            "We couldn't create your account right now. Try again later.",
          );
        }
        return;
      }
      navigate("/home/verify-email", { replace: true });
    } catch (error) {
      setErrorMessage(toast.error("Connection failed."));
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
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-white/90 text-center mb-14">
              Create an account
            </h2>
            {/* Username */}
            <div className="mb-6">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username"
                  className={inputClasses}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  className={inputClasses}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Password"
                  className={inputClasses}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEye className="text-gray-400" />
                  ) : (
                    <FaEyeSlash className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="mb-2">
              <label htmlFor="confirm_password" className="sr-only">
                Confirm password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={inputClasses}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEye className="text-gray-400" />
                  ) : (
                    <FaEyeSlash className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="min-h-[40px] flex justify-center items-center">
              {errorMessage && (
                <p className="text-rose-400 text-center text-sm">
                  {errorMessage}
                </p>
              )}
            </div>
            {/* Terms & Conditions */}
            <div className="flex items-center justify-center mt-1">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 border-gray-600 rounded"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <label
                htmlFor="terms"
                className="ml-2.5 text-sm text-gray-300 tracking-wide"
              >
                I agree to the{" "}
                <a href="/terms" className="text-green-500 hover:underline">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center px-4 py-2 mt-3 text-md bg-green-500 text-white rounded-3xl shadow-lg hover:bg-green-700 transition duration-300"
            >
              {isSubmitting ? (
                <ImSpinner2 className="animate-spin size-6" />
              ) : (
                "Get started"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
