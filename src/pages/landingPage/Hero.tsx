

import React from "react";
import { useNavigate } from "react-router-dom";
import { Wheat, Building2, ShoppingCart, Contact2Icon } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const loginButtons = [
    {
      id: "farmer",
      label: "Farmer Login",
      icon: Wheat,
      color: "bg-green-600 hover:bg-green-700",
      path: "/farmer",
    },
    {
      id: "b2b",
      label: "Business Login",
      icon: Building2,
      color: "bg-emerald-600 hover:bg-emerald-700",
      path: "/b2b",
    },
    {
      id: "customer",
      label: "Customer Login",
      icon: ShoppingCart,
      color: "bg-emerald-600 hover:bg-emerald-700",
      path: "/customer",
    },
    {
      id: "Contact",
      label: "Contact Us",
      icon: Contact2Icon,
      color: "bg-green-600 hover:bg-green-700",
      path: "/contact",
    },
  ];

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["publicStats"],
    queryFn: publicApi.getStats,
    staleTime: 1000 * 60 * 5,
  });

  const formatCount = (value: number) => {
    if (value >= 1e7) return `${(value / 1e7).toFixed(1).replace(/\.0$/, "")}Cr+`;
    if (value >= 1e5) return `${(value / 1e5).toFixed(1).replace(/\.0$/, "")}L+`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1).replace(/\.0$/, "")}K+`;
    return `${value}+`;
  };

  const formatRevenue = (value: number) => {
    if (value >= 1e7) return `Rs ${(value / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
    if (value >= 1e5) return `Rs ${(value / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
    if (value >= 1e3) return `Rs ${(value / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
    return `Rs ${Math.round(value)}`;
  };

  const stats = [
    {
      value: statsData ? formatCount(statsData.totalFarmers) : "12,500+",
      label: "Farmers",
    },
    {
      value: statsData ? formatRevenue(statsData.totalRevenue) : "Rs 48Cr",
      label: "Transactions",
    },
    {
      value: statsData ? formatCount(statsData.totalBusinesses) : "850+",
      label: "Businesses",
    },
    {
      value: statsData ? formatCount(statsData.totalCustomers) : "2.1L+",
      label: "Customers",
    },
  ];

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroFarm})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-green-800/70" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        <div className="max-w-3xl lg:max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Connecting Farmers
            <span className="block text-yellow-400 text-2xl sm:text-3xl lg:text-5xl mt-1 sm:mt-2">
              Directly to Markets
            </span>
          </h2>

          <p className="text-base sm:text-lg text-green-100 mb-8 sm:mb-10 leading-relaxed">
            Empowering farmers, businesses, and customers through a transparent
            and fair agricultural marketplace platform.
          </p>

          {/* Login Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {loginButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => navigate(btn.path)}
                  className={`flex items-center justify-center gap-2 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:border hover:border-yellow-400 text-sm sm:text-base ${btn.color}`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 border border-white/20"
              >
                <div className="text-yellow-400 font-bold text-base sm:text-lg">
                  {isLoading ? "..." : stat.value}
                </div>
                <div className="text-xs sm:text-sm text-green-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


