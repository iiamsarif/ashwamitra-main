import { UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface FarmerSectionProps {
  onSelectRole: (role: UserRole) => void;
}

export default function FarmerSection({ onSelectRole }: FarmerSectionProps) {
  return (
    <section className="relative py-28 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 text-white overflow-hidden">

      {/* Background Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">

        {/* Text Content */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Farmers Can{" "}
            <span className="text-yellow-400">
              Sell Directly
            </span>{" "}
            to Customers
          </h2>

          <p className="mt-6 text-green-200 text-lg leading-relaxed">
            List your products, receive orders directly, and earn better
            profits without middlemen. Our platform connects you directly
            with local customers and businesses.
          </p>

          <ul className="mt-8 space-y-3 text-green-100 text-base">
            <li className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">✔</span>
              Sell products directly
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">✔</span>
              Get fair market prices
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">✔</span>
              Receive fast payments
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">✔</span>
              Reach more customers
            </li>
          </ul>

          {/* Button now triggers role selection instead of routing */}
          <Button
            size="lg"
            onClick={() => onSelectRole("farmer")}
            className="mt-10 bg-yellow-400 text-green-900 font-semibold px-8 py-6 rounded-xl shadow-lg hover:scale-105 hover:bg-yellow-300 transition-all duration-300"
          >
            Start Selling
          </Button>
        </div>

        {/* Image */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 to-emerald-400/30 blur-2xl rounded-3xl opacity-70 group-hover:opacity-100 transition duration-500"></div>

          <img
            src="https://images.unsplash.com/photo-1620200423727-8127f75d7f53?w=600&auto=format&fit=crop&q=60"
            alt="Farmer"
            className="relative rounded-3xl shadow-2xl w-full h-[450px] object-cover transform group-hover:scale-105 transition duration-500"
          />
        </div>

      </div>
    </section>
  );
}