import { useAuth as useAuthContext } from "../context/AuthContext.jsx";

// Custom hook that provides authentication functionality
export const useAuth = () => {
  const auth = useAuthContext();

  // Helper functions for common authentication checks
  const isLoggedIn = auth.isAuthenticated && auth.user;
  const isAdmin = isLoggedIn && auth.user.isAdmin;
  const isLoading = auth.loading;

  // Helper function to check if user has specific permissions
  const hasPermission = (permission) => {
    if (!isLoggedIn) return false;

    switch (permission) {
      case "admin":
        return auth.user.isAdmin;
      case "user":
        return true; // Any authenticated user
      default:
        return false;
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!auth.user) return "";

    if (auth.user.fullName) {
      return auth.user.fullName;
    }

    if (auth.user.firstName) {
      return auth.user.firstName;
    }

    return auth.user.email;
  };

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,

    // Helper properties
    isLoggedIn,
    isAdmin,
    isLoading,

    // Actions
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    changePassword: auth.changePassword,
    clearError: auth.clearError,
    loadUser: auth.loadUser,

    // Helper functions
    hasPermission,
    getUserDisplayName,
  };
};

export default useAuth;
