import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "./Api";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaBook,
  FaUser,
  FaEnvelope,
  FaHome,
  FaPhone,
} from "react-icons/fa";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const navigate = useNavigate();

  const login_pg = process.env.PUBLIC_URL + "/images/login_pg.jpg";

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      address: "",
      contact: "",
      password: "",
      passwordConfirmation: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Required"),
      email: Yup.string()
        .email("Invalid email format")
        .matches(
          /^[\w-.]+@(gmail\.com|.+\.lk)$/,
          "Email must end with @gmail.com or .lk"
        )
        .required("Required"),
      contact: Yup.string()
        .matches(/^\d{10}$/, "Contact must be exactly 10 digits")
        .required("Required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Required"),
      passwordConfirmation: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),

    onSubmit: async (values) => {
      const newUser = {
        name: values.name,
        email: values.email,
        address: values.address,
        contact: values.contact,
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      };

      try {
        const response = await api.post("/register", newUser);

        if (!response.data?.access_token || !response.data?.role) {
          throw new Error("Invalid response from server");
        }

        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("role", response.data.role);

        toast.success("Registration successful! Welcome to our library.");

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
          "Registration failed. Please try again.";
        toast.error(errorMessage);
      }
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
        <div className="absolute inset-0 bg-blue-900/40 flex flex-col justify-center items-center p-8 text-white">
          <FaBook className="text-5xl mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-center">
            Join Our <span className="text-amber-300">Library</span>
          </h1>
          <p className="text-lg text-center max-w-md">
            Create an account to access thousands of books and digital resources
          </p>
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="md:w-1/2 flex flex-col p-8 md:p-12 lg:p-16 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <FaUser className="text-blue-700 text-4xl mb-3" />
            <h2 className="text-2xl font-bold text-gray-800 font-serif">
              Create Account
            </h2>
            <p className="text-gray-600 mt-1">
              Fill in your details to register
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  } focus:outline-none focus:ring-2`}
                  placeholder="John Doe"
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  } focus:outline-none focus:ring-2`}
                  placeholder="your@email.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaHome className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="123 Library St"
                />
              </div>
            </div>

            {/* Contact Field */}
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formik.values.contact}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    formik.touched.contact && formik.errors.contact
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  } focus:outline-none focus:ring-2`}
                  placeholder="0712345678"
                />
              </div>
              {formik.touched.contact && formik.errors.contact && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.contact}
                </p>
              )}
            </div>

            {/* Password Field */}
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
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="passwordConfirmation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={formik.values.passwordConfirmation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formik.touched.passwordConfirmation &&
                    formik.errors.passwordConfirmation
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-400"
                  } focus:outline-none focus:ring-2 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-700"
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  aria-label={
                    showPasswordConfirmation ? "Hide password" : "Show password"
                  }
                >
                  {showPasswordConfirmation ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
              {formik.touched.passwordConfirmation &&
                formik.errors.passwordConfirmation && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.passwordConfirmation}
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mt-6"
            >
              Register Now
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
