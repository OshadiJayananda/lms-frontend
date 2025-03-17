import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useBackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackButton = (event) => {
      const isAdmin = localStorage.getItem("admin_token");
      const isUser = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      // Block back navigation to the login page if the user is authenticated
      if (
        (isAdmin || isUser) &&
        (location.pathname === "/login" || location.pathname === "/signIn")
      ) {
        event.preventDefault(); // Prevent default back navigation
        if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true }); // Redirect to admin dashboard
        } else if (userRole === "user") {
          navigate("/dashboard", { replace: true }); // Redirect to user dashboard
        }
      }

      // Redirect to the appropriate dashboard if the user tries to go back from a non-dashboard page
      if (
        isAdmin &&
        userRole === "admin" &&
        !location.pathname.startsWith("/admin")
      ) {
        navigate("/admin/dashboard", { replace: true }); // Replace the current history entry
      } else if (
        isUser &&
        userRole === "user" &&
        !location.pathname.startsWith("/dashboard")
      ) {
        navigate("/dashboard", { replace: true }); // Replace the current history entry
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
