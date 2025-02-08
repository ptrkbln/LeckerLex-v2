import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// STRICT MODE in main.jsx must be turned off to properly work, otherwise due to double-render it makes two backend requests, the second one returns status 404

export default function EmailVerifyTokenPage() {
  const { token } = useParams(); // from path=email-verify/:token in App.jsx
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;

    const verifyEmail = async () => {
      try {
        setLoading(true);
        setMessage(""); // clear any previous message

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/verify-email/${token}`, // TODO: replace path with .env variable
          { credentials: "include" }
        );

        if (response.status === 200) {
          setMessage(
            "Email successfully verified and registration complete! Redirecting to login..."
          );
          timer = setTimeout(
            () => navigate("/home/login", { replace: true }),
            4000
          );
        } else if (response.status === 404) {
          setMessage(
            "Verification failed. This may be due to an expired or invalid link. Please check your email for a valid verification link or request a new one."
          );
        } else if (response.status === 400) {
          const errorData = await response.json();
          setMessage(
            errorData.msg ||
              "Verification failed due to an invalid or expired token."
          );
        } else {
          setMessage(
            "An unexpected error occurred. Please try again later or contact support."
          );
        }

        setLoading(false); // Set loading false once after all checks
      } catch (error) {
        console.error(error.message);
        setMessage(
          "An unexpected error occurred. Please try again later or contact support."
        );
        setLoading(false);
      }
    };

    if (token) verifyEmail();

    return () => {
      if (timer) clearTimeout(timer); // cleanup function for timeout function to prevent memory leak
    };
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center">
      {loading ? (
        <p className="text-xl font-bold text-gray-700">
          Verifying your email...
        </p>
      ) : (
        <p className="text-xl font-bold text-gray-700">{message}</p>
      )}
    </div>
  );
}
