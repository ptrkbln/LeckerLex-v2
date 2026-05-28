import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImSpinner2 } from "react-icons/im";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

// React Strict Mode triggers this effect twice in development,
// causing duplicate verification requests and invalidating the token.

export default function VerifyEmailTokenPage() {
  const { token } = useParams(); // from frontend path /verify-email/:token
  const navigate = useNavigate();
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer;

    const verifyEmail = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setMessage("");

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/verify-email/${token}`, // TODO: replace path with .env variable
          { credentials: "include" },
        );
        if (!response.ok) {
          setIsError(true);
          setMessage(
            "This verification link is invalid, expired, or has already been used.",
          );
          return;
        }
        setIsError(false);
        setMessage(
          "Your email has been successfully verified!\nRedirecting to sign in...",
        );
        timer = setTimeout(
          () => navigate("/home/login", { replace: true }),
          4000,
        );
      } catch {
        setIsError(true);
        setMessage("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) verifyEmail();

    // Cleanup timeout on component unmount to prevent memory leaks
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token, navigate]);

  return (
    <>
      {isLoading ? (
        <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100 " />
      ) : (
        <div className="flex flex-col items-center gap-5">
          {isError ? (
            <MdError className="size-10 sm:size-12 text-rose-400" />
          ) : (
            <FaCheckCircle className="size-10 sm:size-12 text-green-400" />
          )}

          <p
            className={`text-center text-lg sm:text-xl font-semibold whitespace-pre-line ${isError ? "text-rose-100" : "text-green-100"}`}
          >
            {message}
          </p>
        </div>
      )}
    </>
  );
}
