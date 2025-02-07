import React from "react";
import { useNavigate } from "react-router-dom";
import login_pg from "../images/login_pg.jpg";
import api from "./Api"; // Use a relative path to reference Api.js

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    try {
      const response = await api.post("/login", { email, password });
  
      // Save token
      localStorage.setItem("token", response.data.access_token);
  
      // Get role from the response
      const userRole = response.data.role;
  
      // Navigate based on the role
      if (userRole === "admin") {
        navigate("/dashboard");
      } else if (userRole === "user") {
        navigate("/addBook");
      } else {
        alert("Unknown role: " + userRole);
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || error.message));
    }
  };
  

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-black">
        <img src={login_pg} alt="Books" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white bg-opacity-90">
        <h2 className="mb-5 text-2xl font-semibold">Log In</h2>
        <form className="w-full max-w-sm" onSubmit={handleLogin}>
          <div className="mb-4 w-full">
            <label htmlFor="username" className="block mb-2 text-sm font-medium">
              Email:
            </label>
            <input
              type="text"
              id="username"
              name="email"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#003d73] text-white rounded-md text-lg hover:bg-[#0056a3]"
          >
            Log In
          </button>
        </form>
        <div className="mt-4">
          <a href="/forgot-password" className="block text-[#003d73] text-sm mb-2 hover:underline">
            Forgot Password
          </a>
          <a href="/signIn" className="block text-[#003d73] text-sm hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;