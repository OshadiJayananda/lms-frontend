import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./Api";
import login_pg from "../images/login_pg.jpg";

export default function SignIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = {
      name,
      email,
      address,
      contact,
      password,
      password_confirmation: passwordConfirmation,
    };

    try {
      await api.post("/register", newUser);
      alert("User Added Successfully");
      navigate("/dashboard");
    } catch (err) {
      alert(
        "Error adding user: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-black">
        {/* Add your image source here */}
        <img
          src={login_pg}
          alt="Books"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white bg-opacity-90">
        <h2 className="mb-5 text-2xl font-semibold">Sign In</h2>
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-4 w-full">
            <label htmlFor="name" className="block mb-2 text-sm font-medium">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 w-full">
            <label htmlFor="address" className="block mb-2 text-sm font-medium">
              Address:
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 w-full">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4 w-full">
            <label
              htmlFor="passwordConfirmation"
              className="block mb-2 text-sm font-medium"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
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
