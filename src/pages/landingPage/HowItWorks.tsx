export default function HowItWorks() {
    return (
      <section className="relative py-28 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 overflow-hidden">
  
        {/* Background Glow Blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
  
        <div className="relative max-w-6xl mx-auto px-6 text-center">
  
          {/* Heading */}
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            How It{" "}
            <span className="text-yellow-400">
              Works
            </span>
          </h2>
  
          <p className="text-green-200 max-w-2xl mx-auto mb-20 text-lg">
            Connecting farmers directly with customers in a simple,
            transparent and profitable way.
          </p>
  
          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-10">
  
            {/* Step 1 */}
            <div className="group relative bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
  
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-400 text-green-900 rounded-full text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110">
                1
              </div>
  
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                Farmers List Products
              </h3>
  
              <p className="text-green-100 leading-relaxed">
                Farmers upload their fresh produce directly to the platform
                with transparent pricing and real-time stock updates.
              </p>
            </div>
  
            {/* Step 2 */}
            <div className="group relative bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
  
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-400 text-green-900 rounded-full text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110">
                2
              </div>
  
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                Customers Order Directly
              </h3>
  
              <p className="text-green-100 leading-relaxed">
                Customers browse fresh produce and place orders without
                middlemen, ensuring better prices and quality.
              </p>
            </div>
  
            {/* Step 3 */}
            <div className="group relative bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
  
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-yellow-400 text-green-900 rounded-full text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110">
                3
              </div>
  
              <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                Farmers Earn More
              </h3>
  
              <p className="text-green-100 leading-relaxed">
                Farmers receive fair prices, faster payments, and build
                long-term relationships with customers.
              </p>
            </div>
  
          </div>
        </div>
      </section>
    );
  }