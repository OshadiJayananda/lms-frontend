import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useBackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackButton = (event) => {
      const isAdmin = localStorage.getItem("admin_token");
      const isUser = localStorage.getItem("token");

      // If the user is on a non-dashboard page and clicks back, redirect to the dashboard
      if (isAdmin && !location.pathname.startsWith("/admin/dashboard")) {
        navigate("/admin/dashboard");
        event.preventDefault(); // Prevent default back navigation
      } else if (isUser && !location.pathname.startsWith("/dashboard")) {
        navigate("/dashboard");
        event.preventDefault(); // Prevent default back navigation
      }
    };

    // Add event listener for popstate (back button)
    window.addEventListener("popstate", handleBackButton);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [location, navigate]);
}

export default useBackButtonHandler;
