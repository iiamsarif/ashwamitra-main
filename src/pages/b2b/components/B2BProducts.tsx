import React, { useState } from "react";
import { Search, MapPin, ShoppingCart, Package, Plus, Minus, Loader2, User } from "lucide-react";
import { useProducts } from "@/hooks/useApi";
import { toast } from "sonner";

const categories = ["All", "Grains", "Vegetables", "Spices", "Fruits", "Other"];

function qualityBadge(quality: string) {
  const styles: Record<string, string> = {
    Standard: "bg-gray-100 text-gray-700 border border-gray-300",
    Premium: "bg-purple-100 text-purple-700 border border-purple-300",
    Organic: "bg-green-100 text-green-700 border border-green-300",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-md font-medium ${styles[quality] || styles["Standard"]}`}>
      {quality}
    </span>
  );
}

type B2BProductsProps = {
  cart?: Map<string, number>;
  onUpdateCart?: (cart: Map<string, number>) => void;
  onGoToCart?: () => void;
};

const B2BProducts: React.FC<B2BProductsProps> = ({ cart: externalCart, onUpdateCart, onGoToCart }) => {
  const { data: products, isLoading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [internalCart, setInternalCart] = useState<Map<string, number>>(new Map());

  const cart = externalCart || internalCart;
  const updateCart = (newCart: Map<string, number>) => {
    if (onUpdateCart) onUpdateCart(newCart);
    else setInternalCart(newCart);
  };

  const addToCart = (product: any, quantity: number) => {
    const next = new Map(cart);
    const currentQty = next.get(product._id) || 0;
    next.set(product._id, currentQty + quantity);
    updateCart(next);
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    const next = new Map(cart);
    next.delete(productId);
    updateCart(next);
  };

  const getCartItemsCount = () => {
    let count = 0;
    cart.forEach((q) => { count += q; });
    return count;
  };

  const filteredProducts = (products && Array.isArray(products)) ? products.filter((product) => {
    const matchCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch && product.isAvailable !== false;
  }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading farmer products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Cart */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Products</h1>
          <p className="text-sm text-gray-500">Browse and add to bulk cart</p>
        </div>
        <button onClick={onGoToCart}
          className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ShoppingCart className="w-5 h-5" /> Cart
          {getCartItemsCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getCartItemsCount()}
            </span>
          )}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search farmer products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === cat ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const discount = product.marketPrice > 0 ? Math.round(
            ((product.marketPrice - product.pricePerUnit) / product.marketPrice) * 100
          ) : 0;
          const cartQty = cart.get(product._id) || 0;

          return (
            <div key={product._id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-5xl mb-4">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>🌾</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Farmer: {product.farmerName || "Verified Farmer"}
              </p>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {product.village}, {product.district}
              </p>
              <div className="flex gap-2 mb-3">
                {product.quality && qualityBadge(product.quality)}
                {product.isOrganic && (
                  <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700 border border-green-300">Organic</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-blue-700 text-lg">₹{product.pricePerUnit}/{product.unit}</span>
                {product.marketPrice > 0 && product.marketPrice !== product.pricePerUnit && (
                  <>
                    <span className="text-sm line-through text-gray-400">₹{product.marketPrice}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{discount}% OFF</span>
                  </>
                )}
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Stock: {product.availableQuantity}{product.unit}</span>
                <span>Min: {product.minimumOrder}{product.unit}</span>
              </div>

              {/* Cart Controls */}
              {cartQty > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                    <button onClick={() => {
                      if (cartQty <= (product.minimumOrder || 1)) removeFromCart(product._id);
                      else {
                        const n = new Map(cart); n.set(product._id, cartQty - 1); updateCart(n);
                      }
                    }}
                      className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-blue-800">{cartQty} {product.unit}</span>
                    <button onClick={() => addToCart(product, 1)}
                      className="w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(product._id)}
                    className="w-full py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition">
                    Remove from Cart
                  </button>
                </div>
              ) : (
                <button onClick={() => addToCart(product, product.minimumOrder || 1)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:scale-105 transition">
                  <ShoppingCart className="w-4 h-4 inline mr-1" /> Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
        </div>
      )}
    </div>
  );
};

export default B2BProducts;
