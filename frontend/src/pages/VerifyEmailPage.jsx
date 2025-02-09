import React from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-gray-200 pt-52">
      <div className="text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
          Registration Successful! 🎉
        </h2>
        <p className="text-lg sm:text-xl mb-8 leading-relaxed">
          One last step! We've sent a verification email to your inbox. <br />
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
