"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { env } from "../../env";

const BACKEND_URL = "/api";
const FILTER_USERNAME = env.NEXT_PUBLIC_FILTER_USERNAME;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateUsername = async (username: string) => {
    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3 and 20 characters.";
    }
    if (FILTER_USERNAME) {
      try {
        const response = await fetchBadWords(username);
        const badWords = response.bad_words_list;
        if (badWords.length > 0) {
          return "Username contains inappropriate language. Please choose another one.";
        }
      } catch (error) {
        console.error("Error checking bad words:", error);
        return "There was an error checking the username. Please try again.";
      }
      return null;
    }
  };

  const fetchBadWords = async (username: string) => {
    const myHeaders = new Headers();
    myHeaders.append("apikey", "ekDwcLAZDcnm9zA87TYalJxntYLM59qL");

    const raw = username;

    const requestOptions = {
      method: "POST",
      redirect: "follow",
      headers: myHeaders,
      body: raw,
    };

    const response = await fetch(
      "https://api.apilayer.com/bad_words?censor_character=",
      requestOptions as RequestInit
    );
    const result = await response.json();
    return result;
  };

  const validatePassword = (password: string) => {
    const lengthCheck = /.{8,}/;
    const upperCaseCheck = /[A-Z]/;
    const numberCheck = /[0-9]/;
    const specialCharCheck = /[!@#$%^&*(),.?":/{}|<>]/;

    if (!lengthCheck.test(password)) {
      return "Password must be at least 8 characters long.";
    }
    if (!upperCaseCheck.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!numberCheck.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!specialCharCheck.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null;
  };

  const handleLogin = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    const usernameError = await validateUsername(username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        username,
        password,
      });

      // Store token in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      // Store token in cookies
      document.cookie = `token=${res.data.token}; path=/`;

      // Dispatch custom event for navbar
      window.dispatchEvent(new Event("login-success"));

      // Show success message
      toast.success("✅ Login successful!");

      // Use replace instead of push to prevent back navigation
      router.replace("/game");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("❌ Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    const usernameError = await validateUsername(username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("❌ Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/signup`, {
        username,
        password,
        email,
      });
      toast.success(
        "✅ Signup successful! Please check your email to confirm your account."
      );
      setIsLogin(true);
    } catch (err) {
      console.error(
        "Signup error:",
        (err as AxiosError<{ error: string }>).response?.data
      ); // Log the full error response
      toast.error(
        `❌ ${
          (err as AxiosError<{ error: string }>).response?.data?.error ||
          "An error occurred during signup"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <button
            className={`w-1/2 py-3 rounded-l-xl text-lg font-semibold ${
              isLogin ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setIsLogin(true)}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-3 rounded-r-xl text-lg font-semibold ${
              !isLogin ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setIsLogin(false)}
            disabled={loading}
          >
            Signup
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isLogin ? "🔑 Login" : "📝 Signup"}
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        {/* Add email field in signup form */}
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        )}

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          className={`w-full py-3 rounded-lg text-lg font-semibold ${
            isLogin
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={isLogin ? handleLogin : handleSignup}
          disabled={loading}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="w-6 h-6 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
            </div>
          ) : isLogin ? (
            "Login"
          ) : (
            "Signup"
          )}
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={5000} />
    </div>
  );
};

export default Login;
