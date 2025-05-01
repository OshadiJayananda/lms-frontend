import api from "../Components/Api";

const isTokenValid = async (token) => {
  try {
    return await validateToken(token);
  } catch {
    return false;
  }
};

const cleanupInvalidToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

const validateToken = async (token) => {
  try {
    const response = await api.get("/validate-token");
    if (response.status === 200) return true;
    if (response.status === 401) {
      cleanupInvalidToken();
      return false;
    }
  } catch (error) {
    console.error("Token validation failed:", error);
    cleanupInvalidToken(); // Clear on network errors too
    return false;
  }
};

export { isTokenValid, cleanupInvalidToken };
