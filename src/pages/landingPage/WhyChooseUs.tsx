import { ShieldCheck, Truck, IndianRupee, TrendingUp } from "lucide-react";

const reasons = [
  {
    icon: <ShieldCheck className="w-7 h-7 text-yellow-400" />,
    title: "Trusted & Transparent",
    desc: "We ensure secure transactions and transparent pricing for both farmers and buyers.",
  },
  {
    icon: <Truck className="w-7 h-7 text-yellow-400" />,
    title: "Fast & Reliable Delivery",
    desc: "Efficient logistics system to deliver fresh produce on time.",
  },
  {
    icon: <IndianRupee className="w-7 h-7 text-yellow-400" />,
    title: "Better Profit Margins",
    desc: "Farmers earn more by selling directly without middlemen.",
  },
  {
    icon: <TrendingUp className="w-7 h-7 text-yellow-400" />,
    title: "Technology Driven",
    desc: "Smart marketplace powered by modern tools for seamless trading.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-bold">
          Why Choose <span className="text-yellow-400">ASWAMITHRA?</span>
        </h2>

        <p className="mt-6 max-w-2xl mx-auto text-green-100">
          We are redefining agricultural commerce by creating a fair,
          technology-driven, and community-focused marketplace.
        </p>

        {/* Cards */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-green-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-yellow-400"
            >
              <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-xl bg-green-800 mb-6 transition duration-300 group-hover:bg-yellow-500">
                {item.icon}
              </div>

              <h3 className="text-lg font-semibold">
                {item.title}
              </h3>

              <p className="mt-4 text-green-200 text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}