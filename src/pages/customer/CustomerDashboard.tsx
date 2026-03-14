"use client";

import React, { useState } from "react";
import {
  Search, MapPin, Home, ShoppingCart, Package, User, LogOut, CheckCircle,
  Loader2, Star, Truck, Plus, Minus, Menu, X,
} from "lucide-react";
import { useProducts } from "@/hooks/useApi";
import CartComponent from "./components/CartComponent";
import OrdersComponent from "./components/OrdersComponent";
import ProfileComponent from "./components/ProfileComponent";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { useAuth } from "@/context/AuthContext";

const categories = ["All", "Vegetables", "Fruits", "Grains", "Other"];

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

export default function CustomerDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("shop");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string>("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: products, isLoading, error } = useProducts();

  const addToCart = (product: any, quantity: number = 1) => {
    setCart((prev) => {
      const next = new Map(prev);
      const currentQty = next.get(product._id) || 0;
      next.set(product._id, currentQty + quantity);
      return next;
    });
    setAddedProduct(product.name);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  };

  const getCartItemsCount = () => {
    let count = 0;
    cart.forEach((quantity) => { count += quantity; });
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
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-green-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading fresh products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
          <p className="text-gray-500">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    setCart(new Map());
    logout();
  };

  const handleCartUpdate = (newCart: Map<string, number>) => {
    setCart(newCart);
    if (newCart.size === 0 && cart.size > 0) {
      setShowOrderSuccess(true);
      setTimeout(() => setShowOrderSuccess(false), 5000);
      setActiveTab("orders");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-green-50">
      {/* Cart Notification */}
      {showCartNotification && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">{addedProduct} added to cart!</span>
        </div>
      )}

      {/* Order Success */}
      {showOrderSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
          <CheckCircle className="w-5 h-5" />
          <div>
            <span className="font-bold block">Order Placed Successfully!</span>
            <span className="text-sm text-green-100">Check your orders for tracking details</span>
          </div>
        </div>
      )}

      {/* TOP NAVBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Delivering to Hyderabad</span>
              <span className="sm:hidden">Hyderabad</span>
            </div>
            <button 
              className="sm:hidden p-1 rounded-lg hover:bg-green-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search fresh vegetables, fruits..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => setActiveTab("shop")} className={`flex items-center gap-1 ${activeTab === "shop" ? "text-green-700" : "text-gray-600 hover:text-green-700"}`}>
              <Home size={18} /> Shop
            </button>
            <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-1 ${activeTab === "orders" ? "text-green-700" : "text-gray-600 hover:text-green-700"}`}>
              <Package size={18} /> Orders
            </button>
            <button onClick={() => setActiveTab("cart")} className={`relative flex items-center gap-1 ${activeTab === "cart" ? "text-green-700" : "text-gray-600 hover:text-green-700"}`}>
              <ShoppingCart size={18} /> Cart
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-1 ${activeTab === "profile" ? "text-green-700" : "text-gray-600 hover:text-green-700"}`}>
              <User size={18} /> Profile
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-green-100 bg-white/90 backdrop-blur-md">
            <div className="px-4 py-3 space-y-2">
              <button 
                onClick={() => { setActiveTab("shop"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "shop" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-green-50"}`}
              >
                <Home size={18} /> Shop
              </button>
              <button 
                onClick={() => { setActiveTab("orders"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "orders" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-green-50"}`}
              >
                <Package size={18} /> Orders
              </button>
              <button 
                onClick={() => { setActiveTab("cart"); setMobileMenuOpen(false); }}
                className={`w-full relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "cart" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-green-50"}`}
              >
                <ShoppingCart size={18} /> Cart
                {getCartItemsCount() > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>
              <button 
                onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === "profile" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-green-50"}`}
              >
                <User size={18} /> Profile
              </button>
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="pt-24 pb-24 sm:pb-10">
        {activeTab === "shop" && (
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto py-4">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts.map((product) => {
                const discount = product.marketPrice > 0 ? Math.round(
                  ((product.marketPrice - product.pricePerUnit) / product.marketPrice) * 100
                ) : 0;
                const cartQty = cart.get(product._id) || 0;

                return (
                  <div key={product._id} className="bg-white rounded-2xl border border-green-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="h-36 w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center text-5xl mb-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <span>🌾</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-green-800 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.farmerName || "Local Farmer"} • {product.village}</p>
                    <div className="flex gap-1 mb-2">
                      {product.quality && qualityBadge(product.quality)}
                      {product.isOrganic && (
                        <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700 border border-green-300">Organic</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-green-700 text-sm">₹{product.pricePerUnit}/{product.unit}</span>
                      {product.marketPrice > 0 && product.marketPrice !== product.pricePerUnit && (
                        <span className="text-xs line-through text-gray-400">₹{product.marketPrice}</span>
                      )}
                      {discount > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{discount}% OFF</span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mb-3">
                      <span>Stock: {product.availableQuantity}{product.unit}</span>
                      <span>Min: {product.minimumOrder}{product.unit}</span>
                    </div>

                    {/* Add to Cart / Quantity Controls */}
                    {cartQty > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                          <button onClick={() => {
                            if (cartQty <= 1) removeFromCart(product._id);
                            else {
                              setCart(prev => { const n = new Map(prev); n.set(product._id, cartQty - 1); return n; });
                            }
                          }}
                            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold text-green-800">{cartQty} {product.unit}</span>
                          <button onClick={() => addToCart(product, 1)}
                            className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center">
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
                        className="w-full py-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-semibold hover:scale-105 transition">
                        <ShoppingCart className="w-3 h-3 inline mr-1" /> Add to Cart
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredProducts.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-12">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">No farmer products available matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && <OrdersComponent />}
        {activeTab === "cart" && (
          <CartComponent
            cart={cart}
            products={products || []}
            onUpdateCart={handleCartUpdate}
            onGoToOrders={() => setActiveTab("orders")}
          />
        )}
        {activeTab === "profile" && <ProfileComponent />}
      </div>

      <WhatsAppButton />

      {/* MOBILE NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 shadow-inner z-50 sm:hidden">
        <div className="flex justify-around items-center py-3 text-xs font-medium">
          <button onClick={() => setActiveTab("shop")} className={`flex flex-col items-center ${activeTab === "shop" ? "text-green-600" : "text-gray-500"}`}>
            <Home size={20} /> Shop
          </button>
          <button onClick={() => setActiveTab("orders")} className={`flex flex-col items-center ${activeTab === "orders" ? "text-green-600" : "text-gray-500"}`}>
            <Package size={20} /> Orders
          </button>
          <button onClick={() => setActiveTab("cart")} className={`relative flex flex-col items-center ${activeTab === "cart" ? "text-green-600" : "text-gray-500"}`}>
            <ShoppingCart size={20} /> Cart
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {getCartItemsCount()}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center ${activeTab === "profile" ? "text-green-600" : "text-gray-500"}`}>
            <User size={20} /> Profile
          </button>
        </div>
      </div>
    </div>
  );
}
