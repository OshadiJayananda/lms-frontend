import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./Api";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash, FaBookOpen, FaUniversity } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login_pg = process.env.PUBLIC_URL + "/images/login_pg.jpg";

  const handleLogin = async (values) => {
    const { email, password } = values;
    try {
      const response = await api.post("/login", { email, password });

      if (!response.data?.access_token || !response.data?.role) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      toast.success("Login Successful!");

      const userRole = response.data.role;
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "user") {
        navigate("/dashboard");
      } else {
        toast.error(
          "Your account role is not recognized. Please contact support."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error("Login failed: " + errorMessage);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Please add an email")
        .matches(/@gmail\.com$|\.lk$/, "Email must be a Gmail or .lk address"),
      password: Yup.string()
        .min(6, "Password must be more than 6 characters")
        .required("Please add a password"),
    }),
    onSubmit: (values) => {
      handleLogin(values);
    },
  });

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left Section - Image with Overlay */}
      <div className="md:w-1/2 h-64 md:h-auto relative">
        <img
          src={login_pg}
          alt="Library interior with books"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/30 flex flex-col justify-center items-center p-8 text-white">
          <FaUniversity className="text-5xl mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-center">
            Welcome to <span className="text-amber-300">LiberVerse</span>
          </h1>
          <p className="text-lg text-center max-w-md">
            Access thousands of books, digital resources, and more with your
            library account
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          {/* Header with Logo */}
          <div className="flex flex-col items-center mb-8">
            <FaBookOpen className="text-blue-700 text-4xl mb-3" />
            <h2 className="text-2xl font-bold text-gray-800 font-serif">
              Member Login
            </h2>
            <p className="text-gray-600 mt-1">
              Sign in to your library account
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="text"
                id="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-400"
                } focus:outline-none focus:ring-2`}
                placeholder="your@email.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  } focus:outline-none focus:ring-2 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-blue-700 hover:text-blue-600"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
