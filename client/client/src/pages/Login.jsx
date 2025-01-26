import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateUsername = async (username) => {
    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3 and 20 characters.";
    }

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

    return null;  // Validation passed
  };

  // Fetch bad words from the API
  const fetchBadWords = async (username) => {
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
      requestOptions
    );
    const result = await response.json();
    return result; // returns the result, which includes the bad words list
  };

  const validatePassword = (password) => {
    const lengthCheck = /.{8,}/;  // Minimum 8 characters
    const upperCaseCheck = /[A-Z]/;  // At least one uppercase letter
    const numberCheck = /[0-9]/;  // At least one number
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/;  // At least one special character
    
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
    return null;  // Validation passed
  };

  const handleLogin = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    const usernameError = await validateUsername(username);
    if (usernameError) {
      alert(usernameError);
      return;
    }

    try {
      const res = await axios.post("https://thumbbat-upgraded.onrender.com/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      navigate("/game");
    } catch (err) {
      alert("❌ Login Failed! Check your credentials.");
    }
  };

  const handleSignup = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    const usernameError = await validateUsername(username);
    if (usernameError) {
      alert(usernameError);
      return;
    }

    try {
      await axios.post("https://thumbbat-upgraded.onrender.com/api/auth/signup", { username, password });
      alert("✅ Signup Successful! Please log in.");
      setIsLogin(true);
    } catch (err) {
      alert("❌ Signup Failed! Username may already exist.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 ${isLogin ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"} rounded-l-md`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 ${!isLogin ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"} rounded-r-md`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">{isLogin ? "🔑 Login" : "📝 Signup"}</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 rounded bg-gray-700 border border-gray-600"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-gray-700 border border-gray-600"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className={`w-full py-2 text-white rounded font-semibold ${
            isLogin ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
          }`}
          onClick={isLogin ? handleLogin : handleSignup}
        >
          {isLogin ? "Login" : "Signup"}
        </button>
      </div>
    </div>
  );
};

export default Login;