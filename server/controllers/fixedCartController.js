import Cart from "../models/Cart.js";

// Get the fixed cart directly from the database
export const getFixedCart = async (req, res) => {
  try {
    const FIXED_SESSION_ID = "fixed_cart_session_id_123";
    console.log(
      `[getFixedCart] Looking for cart with fixed session ID: ${FIXED_SESSION_ID}`
    );

    // Find the cart with the fixed session ID
    const cart = await Cart.findOne({ sessionId: FIXED_SESSION_ID });

    if (!cart) {
      console.log(`[getFixedCart] Cart not found, creating new cart`);
      // Create a new cart with the fixed session ID
      const newCart = new Cart({
        sessionId: FIXED_SESSION_ID,
        items: [],
      });
      await newCart.save();

      // Populate the cart items
      await newCart.populate(
        "items.alien",
        "name price image faction rarity inStock"
      );

      return res.status(200).json({
        success: true,
        data: {
          cart: {
            id: newCart._id,
            items: newCart.items,
            totalItems: newCart.totalItems,
            totalPrice: newCart.totalPrice,
            updatedAt: newCart.updatedAt,
          },
        },
      });
    }

    console.log(`[getFixedCart] Cart found with ${cart.items.length} items`);

    // Populate the cart items
    await cart.populate(
      "items.alien",
      "name price image faction rarity inStock"
    );

    return res.status(200).json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          updatedAt: cart.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("[getFixedCart] Error:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Failed to retrieve fixed cart",
        code: "FIXED_CART_RETRIEVAL_ERROR",
      },
    });
  }
};
