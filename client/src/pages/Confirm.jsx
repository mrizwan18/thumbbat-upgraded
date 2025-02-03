import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const Confirm = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(10);  // 10 seconds countdown
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token from URL params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setErrorMessage("Invalid or missing token.");
      setLoading(false);
      return;
    }

    // Call backend to validate the token
    const validateToken = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/confirm?token=${token}`);
        if (response.status === 200) {
          // Successfully confirmed
          toast.success("Account confirmed successfully!");
          setLoading(false);

          // Start countdown for redirecting
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/login");  // Redirect after countdown
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        // If token validation fails
        setErrorMessage("Invalid or expired token. Please try again.");
        setLoading(false);
      }
    };

    validateToken();
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="w-12 h-12 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        {errorMessage ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">❌ {errorMessage}</h2>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">✅ Account confirmed successfully!</h2>
            <p className="mb-4">You will be redirected to the login page in {countdown} seconds.</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Go to Login Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirm;