import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "./Api";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
        address: values.address, // Ensure address is included
        contact: values.contact, // Ensure contact is included
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      };

      try {
        console.log("Submitting user data:", newUser); // Log the data being submitted
        await api.post("/register", newUser);
        toast.success("User Added Successfully");
        navigate("/dashboard");
      } catch (err) {
        console.error("Error:", err.response.data); // Log the error response for debugging
        toast.error(
          "Error adding user: " + (err.response?.data?.message || err.message)
        );
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const togglePasswordConfirmationVisibility = () => {
    setShowPasswordConfirmation((prev) => !prev);
  };
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
        <h2 className="mb-5 text-2xl font-semibold">Sign In</h2>
        <form className="w-full max-w-sm" onSubmit={formik.handleSubmit}>
          <div className="mb-4 w-full">
            <label htmlFor="name" className="block mb-2 text-sm font-medium">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            ) : null}
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="address" className="block mb-2 text-sm font-medium">
              Address:
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="contact" className="block mb-2 text-sm font-medium">
              Contact:
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formik.values.contact}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {formik.touched.contact && formik.errors.contact ? (
              <div className="text-red-500 text-sm">
                {formik.errors.contact}
              </div>
            ) : null}
          </div>
          <div>
            <div className="mb-4 w-full">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium"
              >
                Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.password}
                </div>
              ) : null}
            </div>
            <div className="mb-4 w-full">
              <label
                htmlFor="passwordConfirmation"
                className="block mb-2 text-sm font-medium"
              >
                Confirm Password:
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={formik.values.passwordConfirmation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={togglePasswordConfirmationVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPasswordConfirmation ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.passwordConfirmation &&
              formik.errors.passwordConfirmation ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.passwordConfirmation}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full max-w-sm py-2 bg-[#003d73] text-white rounded-md text-lg hover:bg-[#0056a3]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
