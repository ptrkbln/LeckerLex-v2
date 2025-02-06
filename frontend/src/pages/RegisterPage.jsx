import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaEnvelope, FaUser, FaLock } from "react-icons/fa";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false); // terms and conditions checkbox
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple clicks
  const { isLoggedIn, loading } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";

  useEffect(() => {
    const checkUserLogin = async () => {
      if (loading) return; // Prevent execution while loading
      if (isLoggedIn) {
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate("/home");
        }
      }
    };

    checkUserLogin();
  }, [loading, isLoggedIn, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-=_+])[A-Za-z\d@$!%*?&^#\-=_+]{6,}$/;

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email format.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&^#-=_+)."
      );
      return;
    }

    if (!email || !password || !name) {
      setErrorMessage("Please enter your username, email and password.");
      return;
    }

    if (!nameRegex.test(name)) {
      setErrorMessage(
        "Username must be between 3 and 15 characters long, and allows only letters, digits and underscores."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!isChecked) {
      setErrorMessage(
        "To register you must agree to the terms and conditions."
      );
      return;
    }

    setErrorMessage(""); // Clear previous errors
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/users/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(
          errorData.msg || "An error occurred. Please try again."
        );
        return;
      }

      if (redirectTo) {
        navigate(`/home/verify-email?redirectTo=${redirectTo}`, {
          replace: true,
        });
      } else {
        navigate("/home/verify-email", { replace: true });
      }
    } catch (error) {
      setErrorMessage(
        "An error occurred while trying to register. Please try again later."
      );
    }
  };

  if (loading || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-200">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center mt-10 font-sans">
      {/* Form Card */}
      <div className="bg-[#11151E] p-8 rounded-3xl border border-gray-700 shadow-2xl max-w-lg w-full">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-200 text-center mb-6">
          Create Account
        </h1>
        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                USERNAME
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-3xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                YOUR E-MAIL
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-3xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Password */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              CREATE PASSWORD
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2 border border-gray-600 rounded-3xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-10 py-2 border border-gray-600 rounded-3xl bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>
          {/* Terms & Conditions */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 border-gray-600 rounded"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
              I Agree To{" "}
              <a href="/terms" className="text-green-500 hover:underline">
                The Terms & Conditions
              </a>
            </label>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-center mt-4">{errorMessage}</p>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-8 bg-green-500 text-white font-medium py-2 rounded-full hover:bg-green-600 transition"
          >
            {isSubmitting ? "Registering..." : "GET STARTED"}
          </button>
        </form>
      </div>
    </div>
  );
}
