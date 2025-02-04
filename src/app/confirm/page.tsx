"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Confirm = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL params
    const token = searchParams.get("token");

    if (!token) {
      setErrorMessage("Invalid or missing token.");
      setLoading(false);
      return;
    }

    let timer: NodeJS.Timeout;

    // Call backend to validate the token
    const validateToken = async () => {
      try {
        const response = await axios.get(`/api/auth/confirm?token=${token}`);
        if (response.status === 200) {
          // Successfully confirmed
          toast.success("Account confirmed successfully!");
          setLoading(false);

          // Create separate timer for countdown
          timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
          }, 1000);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        // If token validation fails
        setErrorMessage("Invalid or expired token. Please try again.");
        setLoading(false);
      }
    };

    validateToken();

    // Cleanup timer
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [searchParams]);

  // Separate useEffect for navigation
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/login");
    }
  }, [countdown, router]);

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
            <h2 className="text-2xl font-semibold mb-4">
              ✅ Account confirmed successfully!
            </h2>
            <p className="mb-4">
              You will be redirected to the login page in {countdown} seconds.
            </p>
            <button
              onClick={() => router.push("/login")}
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
