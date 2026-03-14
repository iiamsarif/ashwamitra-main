import { Leaf, Users, Handshake, Sprout } from "lucide-react";

const features = [
  {
    icon: <Leaf className="w-6 h-6 text-yellow-400" />,
    title: "Fresh & Organic",
    desc: "We promote natural farming and direct access to fresh, high-quality produce.",
  },
  {
    icon: <Users className="w-6 h-6 text-yellow-400" />,
    title: "Community Driven",
    desc: "Connecting farmers, businesses, and customers in one trusted ecosystem.",
  },
  {
    icon: <Handshake className="w-6 h-6 text-yellow-400" />,
    title: "Fair Trade",
    desc: "Ensuring transparent pricing and better profits without middlemen.",
  },
  {
    icon: <Sprout className="w-6 h-6 text-yellow-400" />,
    title: "Sustainable Growth",
    desc: "Empowering agriculture through technology and innovation.",
  },
];

export default function AboutUs() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white overflow-hidden">
      
      {/* Soft background glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-bold">
          About <span className="text-yellow-400">ASWAMITHRA</span>
        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-green-100">
          ASWAMITHRA is a modern agricultural marketplace built to empower
          farmers and connect them directly with customers and businesses.
          We believe in transparency, fair pricing, and sustainable farming
          practices that benefit everyone.
        </p>

        {/* Features Grid */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-md border border-green-700 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-yellow-400"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-green-800 mb-6">
                {item.icon}
              </div>

              <h3 className="text-lg font-semibold">{item.title}</h3>

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