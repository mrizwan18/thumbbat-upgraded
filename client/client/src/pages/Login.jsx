import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Redirect user to game if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/game");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      navigate("/game");
    } catch (err) {
      alert("❌ Login Failed! Check your credentials.");
    }
  };

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", { username, password });
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