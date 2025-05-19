import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Components/Api";

const PaymentSuccess = () => {
  const [message, setMessage] = useState("Verifying payment...");
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );

    if (sessionId) {
      api
        .get(`/payments/success?session_id=${sessionId}`)
        .then((response) => {
          setMessage("✅ Payment successful!");
          setTimeout(() => {
            navigate("/payments");
          }, 3000); // redirect after 3 seconds
        })
        .catch((error) => {
          setMessage("❌ Payment verification failed.");
          setTimeout(() => {
            navigate("/payments");
          }, 3000);
        });
    } else {
      setMessage("❌ No session ID found.");
      setTimeout(() => {
        navigate("/payments");
      }, 3000);
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f6f8",
        fontFamily: "Segoe UI, sans-serif",
        color: "#333",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "3rem 2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        <h2
          style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "#28a745" }}
        >
          {message}
        </h2>
        <p style={{ fontSize: "1rem", color: "#555" }}>
          You will be redirected to the payments page shortly...
        </p>
      </div>

      {/* Optional: fade-in animation */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>
    </div>
  );
};

export default PaymentSuccess;
