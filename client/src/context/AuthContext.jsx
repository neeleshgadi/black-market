import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import authService from "../services/authService";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  LOGOUT: "LOGOUT",
  LOAD_USER_START: "LOAD_USER_START",
  LOAD_USER_SUCCESS: "LOAD_USER_SUCCESS",
  LOAD_USER_FAILURE: "LOAD_USER_FAILURE",
  UPDATE_PROFILE_SUCCESS: "UPDATE_PROFILE_SUCCESS",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
import { useCart } from "./CartContext";

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authService.setAuthToken(token);
    }
  }, []);

  // Load user from token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: "No token found",
      });
      return;
    }
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
    try {
      authService.setAuthToken(token);
      const response = await authService.getProfile();
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: error.response?.data?.error?.message || "Failed to load user",
      });
      authService.setAuthToken(null);
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    // Get reloadCart from CartContext
    let reloadCart;
    try {
      // useCart must be called inside a React component, so we check if window is defined for SSR safety
      if (typeof window !== "undefined") {
        reloadCart = require("./CartContext").useCart().reloadCart;
      }
    } catch (e) {
      // fallback: ignore if not in browser context
    }
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authService.login(email, password);
      const { user, token } = response.data;
      authService.setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      // --- Cart merge logic after login ---
      try {
        const simpleCartService = (await import("../services/simpleCartService")).default;
        console.log("[AuthContext] Triggering cart merge after login...");
        const mergeResult = await simpleCartService.mergeCart();
        console.log("[AuthContext] Cart merge result:", mergeResult);
      } catch (cartMergeError) {
        console.error("Cart merge after login failed:", cartMergeError);
      }
      // --- Ensure cart is reloaded and ready before proceeding ---
      try {
        if (reloadCart) {
          await reloadCart(); // Explicitly reload cart and wait for it
        } else {
          // fallback: dispatch event and wait
          if (window && window.dispatchEvent) {
            window.dispatchEvent(new Event("cart-updated"));
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (e) {}
      return { success: true };


    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || "Login failed";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register user
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;
      authService.setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token },
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || "Registration failed";
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
        payload: response.data,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || "Profile update failed";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || "Password change failed";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    loadUser,
  }), [
    state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    loadUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
