import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useApi";
import B2BCart from "./components/B2BCart";

const B2BCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading } = useProducts();
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  React.useEffect(() => {
    const savedCart = localStorage.getItem("b2b_cart");
    if (!savedCart) return;

    try {
      const parsed = JSON.parse(savedCart) as [string, number][];
      if (Array.isArray(parsed)) {
        setCart(new Map(parsed.filter((entry) => Array.isArray(entry) && typeof entry[0] === "string")));
      }
    } catch {
      localStorage.removeItem("b2b_cart");
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("b2b_cart", JSON.stringify(Array.from(cart.entries())));
  }, [cart]);

  const handleCartUpdate = (newCart: Map<string, number>) => {
    setCart(newCart);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/b2b/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <button
              onClick={() => navigate("/b2b/dashboard?tab=products")}
              className="text-blue-600 hover:text-blue-700"
            >
              Continue Shopping →
            </button>
          </div>
        </div>
      </div>

      {productsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading products for cart...</span>
        </div>
      ) : (
        <B2BCart
          cart={cart}
          products={products || []}
          onUpdateCart={handleCartUpdate}
          onGoToOrders={() => navigate("/b2b/dashboard?tab=orders")}
        />
      )}
    </div>
  );
};

export default B2BCartPage;
