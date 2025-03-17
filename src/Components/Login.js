import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./Api"; // Use a relative path to reference Api.js
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login_pg = process.env.PUBLIC_URL + "/images/login_pg.jpg";

  const handleLogin = async (values) => {
    const { email, password } = values; // Destructure values directly
    try {
      const response = await api.post("/login", { email, password });

      // Save token and role
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role); // Store the role

      toast.success("Login Successful!");

      // Get role from the response
      const userRole = response.data.role;

      // Navigate based on the role
      if (userRole === "admin") {
        localStorage.setItem("admin_token", response.data.access_token); // Save admin token
        navigate("/admin/dashboard");
      } else if (userRole === "user") {
        navigate("/dashboard");
      } else {
        alert("Unknown role: " + userRole);
      }
    } catch (error) {
      toast.error(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Formik setup
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
    <div className="flex h-screen">
      <div className="flex-1 bg-black">
        <img
          src={login_pg}
          alt="Books"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white bg-opacity-90">
        <h2 className="mb-5 text-2xl font-semibold">Log In</h2>
        <form className="w-full max-w-sm" onSubmit={formik.handleSubmit}>
          {/* Email Input */}
          <div className="mb-4 w-full">
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium"
            >
              Email:
            </label>
            <input
              type="text"
              id="username"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`w-full p-2 border rounded-md ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>

          {/* Password Input with Toggle Icon */}
          <div className="mb-4 w-full relative">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium"
            >
              Password:
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full p-2 pr-10 border rounded-md ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {/* Toggle Button */}
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm">
                {formik.errors.password}
              </div>
            ) : null}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-[#003d73] text-white rounded-md text-lg hover:bg-[#0056a3]"
          >
            Log In
          </button>
        </form>
        <div className="mt-4">
          <a
            href="/forgot-password"
            className="block text-[#003d73] text-sm mb-2 hover:underline"
          >
            Forgot Password
          </a>
          <a
            href="/signIn"
            className="block text-[#003d73] text-sm hover:underline"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
