import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.items.find(
        (item) => item.alien._id === action.payload.alien._id
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.alien._id === action.payload.alien._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.alien._id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.alien._id === action.payload.alienId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
};

// Import at the top level
import simpleCartService from "../services/simpleCartService";

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from server on mount and after login (cart-updated event)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const response = await simpleCartService.getCart();
        if (
          response.success &&
          response.data.cart &&
          response.data.cart.items.length > 0
        ) {
          const cartItems = response.data.cart.items.map((item) => ({
            alien: item.alien,
            quantity: item.quantity,
          }));
          dispatch({ type: "LOAD_CART", payload: cartItems });
        } else {
          dispatch({ type: "LOAD_CART", payload: [] });
        }
      } catch (error) {
        console.error("Failed to fetch cart from server:", error);
        dispatch({ type: "LOAD_CART", payload: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
    // Listen for cart-updated event (after login)
    const handler = () => fetchCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = async (alien, quantity = 1) => {
    // Update local state immediately for better UX
    dispatch({
      type: "ADD_TO_CART",
      payload: { alien, quantity },
    });
    try {
      const result = await simpleCartService.addToCart(alien._id, quantity);
      if (!result.success) {
        throw new Error(result.error || "Failed to add item to cart");
      }
      // After successful backend update, force reload cart
      await reloadCart();
    } catch (error) {
      console.error("Failed to add item to server cart:", error);
      // Optionally, show error to user
      alert("Failed to add item to cart. Please try again.");
      await reloadCart();
    }
  };

  // Helper to reload cart from backend
  const reloadCart = async () => {
    setIsLoading(true);
    try {
      const response = await simpleCartService.getCart();
      if (response.success && response.data.cart) {
        const cartItems = response.data.cart.items.map((item) => ({
          alien: item.alien,
          quantity: item.quantity,
        }));
        dispatch({ type: "LOAD_CART", payload: cartItems });
      } else {
        dispatch({ type: "LOAD_CART", payload: [] });
      }
    } catch (error) {
      dispatch({ type: "LOAD_CART", payload: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (alienId) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: alienId,
    });
    try {
      const result = await simpleCartService.removeFromCart(alienId);
      if (!result.success) {
        throw new Error(result.error || "Failed to remove item from cart");
      }
      await reloadCart();
    } catch (error) {
      console.error("Failed to remove item from server cart:", error);
      alert("Failed to remove item from cart. Please try again.");
      await reloadCart();
    }
  };

  const updateQuantity = async (alienId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(alienId);
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { alienId, quantity },
      });
      try {
        const result = await simpleCartService.updateQuantity(alienId, quantity);
        if (!result.success) {
          throw new Error(result.error || "Failed to update item quantity");
        }
        await reloadCart();
      } catch (error) {
        console.error("Failed to update item quantity in server cart:", error);
        alert("Failed to update item quantity. Please try again.");
        await reloadCart();
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    try {
      const result = await simpleCartService.clearCart();
      if (!result.success) {
        throw new Error(result.error || "Failed to clear cart");
      }
      await reloadCart();
    } catch (error) {
      console.error("Failed to clear server cart:", error);
      alert("Failed to clear cart. Please try again.");
      await reloadCart();
    }
  };

  const getCartTotal = () => {
    return state.items.reduce(
      (total, item) => total + item.alien.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    reloadCart, // expose reloadCart for manual triggers if needed
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
