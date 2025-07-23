import React from "react";
import CartDebugger from "../components/cart/CartDebugger";

const CartDebugPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Cart Debugger</h1>
        <CartDebugger />
      </div>
    </div>
  );
};

export default CartDebugPage;
