import { useState, useEffect } from "react";
import { Menu, X, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Farmer", path: "/farmer" },
  { name: "Business", path: "/b2b" },
  { name: "Customer", path: "/customer" },
  { name: "Contact", path: "/contact" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-green-900/90 backdrop-blur-xl shadow-2xl" : ""
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleClick("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-md transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
            <Wheat className="w-5 h-5 text-white" />
          </div>

          <div className="leading-tight">
            <h1 className="text-lg font-bold text-white tracking-wide">
              ASWAMITHRA
            </h1>
            <p className="text-xs text-yellow-300">
              Agricultural Marketplace
            </p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleClick(item.path)}
              className="relative text-white text-base font-medium transition duration-300 group"
            >
              {item.name}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white transition-transform duration-300 hover:scale-110"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-green-900/95 backdrop-blur-xl px-6 py-6 space-y-6 shadow-2xl border-t border-green-700">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleClick(item.path)}
              className="block w-full text-left text-lg font-medium text-white hover:text-yellow-400 transition duration-300"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
