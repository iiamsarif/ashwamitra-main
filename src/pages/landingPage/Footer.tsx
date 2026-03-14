import { UserRole } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  onSelectRole: (role: UserRole) => void;
}

export default function Footer({ onSelectRole }: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 text-gray-300 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 blur-3xl rounded-full -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400/10 blur-3xl rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4 tracking-wide">
            ASWAMITHRA
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            Connecting farmers directly with customers and businesses
            through transparent and fair trading.
          </p>
        </div>

        {/* Marketplace */}
        <div>
          <h4 className="text-white mb-4 font-semibold">Marketplace</h4>
          <ul className="space-y-3 text-sm">

            <li>
              <button
                onClick={() => navigate("/customer")}
                className="group relative hover:text-green-400 transition duration-300"
              >
                Browse Products
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate("/farmer")}
                className="group relative hover:text-yellow-400 transition duration-300"
              >
                Sell Products
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>

          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white mb-4 font-semibold">Support</h4>
          <ul className="space-y-3 text-sm">
            
            <li>
              <button
                onClick={() => navigate("/contact")}
                className="group relative hover:text-green-400 transition duration-300"
              >
                Contact Us
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/terms")}
                className="group relative hover:text-green-400 transition duration-300"
              >
                Terms of Service
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/privacy")}
                className="group relative hover:text-green-400 transition duration-300"
              >
                Privacy Policy
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white mb-4 font-semibold">Contact</h4>
          <p className="text-sm text-gray-400">
            Email: support@aswamithra.com
          </p>
          <p className="text-sm mt-2 text-gray-400">
            Phone: +91 9876543210
          </p>
        </div>

      </div>

      {/* Bottom */}
      <div className="relative border-t border-gray-800 text-center py-5 text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-green-400 font-semibold">
          ASWAMITHRA
        </span>. All rights reserved.
      </div>
    </footer>
  );
}
