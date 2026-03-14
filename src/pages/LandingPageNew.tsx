import React, { useState } from "react";
import { UserRole } from "@/context/AuthContext";
import { ArrowRight, Wheat, Building2, ShoppingCart, Shield, CheckCircle2, Leaf, Sun } from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";

const roles = [
  {
    id: "farmer" as UserRole,
    label: "Farmer",
    icon: Wheat,
    emoji: "🌾",
    color: "hsl(var(--primary))",
    lightColor: "hsl(var(--primary) / 0.08)",
    borderColor: "hsl(var(--primary) / 0.25)",
    tagline: "Sell your produce directly",
    features: ["List products easily", "UPI & bank payments", "Earnings analytics"],
  },
  {
    id: "b2b" as UserRole,
    label: "B2B Business",
    icon: Building2,
    emoji: "🏢",
    color: "hsl(var(--info))",
    lightColor: "hsl(210 80% 45% / 0.08)",
    borderColor: "hsl(210 80% 45% / 0.25)",
    tagline: "Source produce in bulk",
    features: ["Bulk order management", "Procurement analytics", "Audit-ready records"],
  },
  {
    id: "customer" as UserRole,
    label: "Customer",
    icon: ShoppingCart,
    emoji: "🛒",
    color: "hsl(var(--success))",
    lightColor: "hsl(142 70% 35% / 0.08)",
    borderColor: "hsl(142 70% 35% / 0.25)",
    tagline: "Buy fresh at fair prices",
    features: ["Farm-fresh produce", "Transparent pricing", "Track your savings"],
  },
  {
    id: "admin" as UserRole,
    label: "Admin",
    icon: Shield,
    emoji: "🛡️",
    color: "hsl(var(--destructive))",
    lightColor: "hsl(var(--destructive) / 0.08)",
    borderColor: "hsl(var(--destructive) / 0.25)",
    tagline: "Manage platform",
    features: ["Approve registrations", "Monitor transactions", "Download reports"],
  },
];

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with Rice/Wheat Field Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50">
        {/* Rice Field Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-100/30 to-green-200/40"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-100/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-green-100/60 to-transparent"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-30 animate-pulse">🌾</div>
        <div className="absolute top-40 right-20 text-5xl opacity-25 animate-pulse delay-100">🌾</div>
        <div className="absolute bottom-40 left-20 text-7xl opacity-35 animate-pulse delay-200">🌾</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-30 animate-pulse delay-300">🌾</div>
        <div className="absolute top-60 left-1/3 text-5xl opacity-20 animate-pulse delay-150">🌾</div>
        <div className="absolute bottom-60 right-1/3 text-6xl opacity-25 animate-pulse delay-250">🌾</div>
        
        {/* Sun Icon */}
        <div className="absolute top-10 right-10 text-6xl text-yellow-400 animate-spin-slow">
          <Sun className="w-16 h-16" />
        </div>
        
        {/* Wheat Stalks */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end">
          <div className="text-8xl opacity-40 transform translate-y-8">🌾</div>
          <div className="text-9xl opacity-35 transform translate-y-6">🌾</div>
          <div className="text-7xl opacity-45 transform translate-y-10">🌾</div>
          <div className="text-8xl opacity-30 transform translate-y-7">🌾</div>
          <div className="text-9xl opacity-40 transform translate-y-5">🌾</div>
          <div className="text-7xl opacity-35 transform translate-y-9">🌾</div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="text-center px-6 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Leaf className="w-10 h-10 text-green-600" />
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                FarmFresh Connect
              </h1>
              <Leaf className="w-10 h-10 text-amber-600" />
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connecting farmers directly with businesses and customers. 
              <span className="block text-green-600 font-semibold mt-2">
                Fresh produce, fair prices, transparent marketplace
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">Verified Farmers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-amber-200">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span className="text-gray-700 font-medium">Quality Assured</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Fair Pricing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-12">
              Join Our Agricultural Community
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    selectedRole === role.id
                      ? "border-blue-500 shadow-xl"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    backgroundColor: selectedRole === role.id ? role.lightColor : undefined,
                    borderColor: selectedRole === role.id ? role.color : undefined,
                  }}
                >
                  {selectedRole === role.id && (
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: role.lightColor,
                        borderColor: role.borderColor,
                        borderWidth: "2px",
                        borderStyle: "solid",
                      }}
                    >
                      {role.emoji}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{role.label}</h3>
                    <p className="text-gray-600 mb-6 text-sm">{role.tagline}</p>
                    
                    <ul className="space-y-2 text-left">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Auth Form */}
            {selectedRole && (
              <div className="mt-12 max-w-md mx-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-200 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      <span className="text-2xl">{roles.find(r => r.id === selectedRole)?.emoji}</span>
                      {roles.find(r => r.id === selectedRole)?.label} Account
                    </div>
                  </div>
                  <AuthForm role={selectedRole!} onBack={() => setSelectedRole(null)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-250 {
          animation-delay: 250ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}
