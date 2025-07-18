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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login_pg = process.env.PUBLIC_URL + "/images/login_pg.jpg";

  const handleLogin = async (values) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        .required("Email is required")
        .matches(/@gmail\.com$|\.lk$/, "Email must be a Gmail or .lk address"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      handleLogin(values);
    },
  });

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left Section - Image with Overlay (Hidden on small mobile) */}
      <div className="hidden sm:block md:w-1/2 relative">
        <img
          src={login_pg}
          alt="Library interior with books"
          className="w-full h-full min-h-screen object-cover fixed md:relative"
          loading="eager"
        />
        <div className="absolute inset-0 bg-blue-900/30 flex flex-col justify-center items-center p-8 text-white">
          <FaUniversity className="text-5xl mb-4 text-blue-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Welcome to <span className="text-amber-300">LiberVerse</span>
          </h1>
          <p className="text-lg text-blue-100 text-center max-w-md">
            Access thousands of books, digital resources, and more with your
            library account
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
          {/* Header with Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <FaBookOpen className="text-blue-700 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Member Login</h2>
            <p className="text-gray-500 mt-2 text-center">
              Sign in to access your library account
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
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
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                } focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                placeholder="your@email.com"
                autoComplete="email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-300 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  } focus:outline-none focus:ring-2 focus:border-transparent transition-colors pr-12`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1.5 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
