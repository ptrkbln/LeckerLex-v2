import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { isLoggedIn, setIsLoggedIn, checkLoginStatus, loading, setIsGuest } =
    useContext(AuthContext);
  const navigate = useNavigate(); // React Router's navigate function for redirection
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/home";

  // state to control show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const handleGuestLogin = () => {
    setIsGuest(true); // Gastmodus aktivieren

    if (redirectTo) {
      navigate(redirectTo); // zurück zur vorherigen Seite
    } else {
      navigate("/home"); // oder zur Startseite
    }
  };

  const handleRedirectToRegister = () => {
    navigate(`/home/register?redirectTo=${redirectTo}`);
  };

  useEffect(() => {
    const checkUserLogin = async () => {
      if (loading) return; // Prevent execution while loading
      if (isLoggedIn) {
        /* navigate("/home"); */
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate("/home");
        }
      }
    };

    checkUserLogin();
  }, [loading, isLoggedIn, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setErrorMessage(""); // clean previous errors

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        // TODO: use env variables for route
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || "Incorrent email or password.");
        return;
      }
      setIsLoggedIn(true);
      /* navigate("/home"); */

      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error by login", error); // debug log
      setErrorMessage(
        "An error occured while trying to login. Please try again later."
      );
    }
  };
  if (loading || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        {/* Registration Form */}
        <div className="max-w-md w-full bg-gray-900 p-8 shadow-lg rounded-3xl">
          <form onSubmit={handleSignUp}>
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Login
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300">
                Email:
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300">
                Password:
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              <p className="text-red-500 text-center mt-4">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 mb-4 mt-1 text-md bg-green-500 text-white rounded-3xl shadow-lg hover:bg-green-700 transition duration-300"
            >
              Sign In
            </button>
          </form>
          <div className="text-center mt-4 text-sm text-gray-300">
            <div className="text-center mt-4 text-sm text-gray-300">
              No profile?{" "}
              <button
                className="text-blue-400 font-medium hover:underline"
                onClick={handleRedirectToRegister}
              >
                Register here
              </button>
            </div>
            <div className="text-center mt-8 text-md text-gray-300">
              <button
                className="text-blue-400 font-semibold hover:scale-105"
                onClick={handleGuestLogin}
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

// import React from 'react';
// import { Link } from "react-router-dom";

// export default function LoginComponent() {
//   return (
//     <div className="min-h-screen flex flex-col bg-gray-100 font-sans">

//       {/* Main Content */}
//       <div className="flex-grow flex items-center justify-center">
//         {/* Registration Form */}
//         <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
//           {/* <h1 className="text-2xl font-heading text-gray-900 mb-6 text-center">
//             Sign Up
//           </h1> */}
//           <form>
//             <div className="mb-4">
//               <label className="text-2xl font-heading text-gray-900 mb-6 text-center">
//                 Email:
//               </label>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-gray-700 mb-2 font-heading">
//                 Password:
//               </label>
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full px-4 py-2 text-lg bg-green-600 text-white rounded-full shadow-lg hover:bg-green-500 transition duration-300"
//             >
//               Sign Up
//             </button>
//           </form>
//           <div className="text-center mt-4 text-sm text-gray-600">
//             <p>
//               No profile?{' '}
//               <a href="/register" className="text-indigo-600 hover:underline">
//                 Register here
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
