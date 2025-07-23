import React from "react";
import FixedCartDebugger from "../components/cart/FixedCartDebugger";

const FixedCartDebugPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Fixed Cart Debugger
        </h1>
        <FixedCartDebugger />
      </div>
    </div>
  );
};

export default FixedCartDebugPage;
