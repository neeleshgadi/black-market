import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        dispatch({ type: "CLEAR_CART" });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await cartService.getCart();
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
        console.error("Failed to fetch cart:", error);
        dispatch({ type: "LOAD_CART", payload: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (alien, quantity = 1) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const result = await cartService.addToCart(alien._id, quantity);
      if (result.success) {
        // Reload cart after successful add
        await reloadCart();
      } else {
        alert(result.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const removeFromCart = async (alienId) => {
    if (!user) return;

    try {
      const result = await cartService.removeFromCart(alienId);
      if (result.success) {
        await reloadCart();
      } else {
        alert(result.error || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const updateQuantity = async (alienId, quantity) => {
    if (!user) return;

    try {
      const result = await cartService.updateQuantity(alienId, quantity);
      if (result.success) {
        await reloadCart();
      } else {
        alert(result.error || "Failed to update item quantity");
      }
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      alert("Failed to update item quantity. Please try again.");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const result = await cartService.clearCart();
      if (result.success) {
        dispatch({ type: "CLEAR_CART" });
      } else {
        alert(result.error || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      alert("Failed to clear cart. Please try again.");
    }
  };

  const reloadCart = async () => {
    if (!user) {
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    try {
      const response = await cartService.getCart();
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
      console.error("Failed to reload cart:", error);
      dispatch({ type: "LOAD_CART", payload: [] });
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
    reloadCart,
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
