import FlightSearchForm from "@/components/search/FlightSearchForm";
import { Plane, Shield, Clock, CreditCard } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Flight
            </h1>
            <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto">
              Search hundreds of flights, compare prices, and book your seat in minutes.
            </p>
          </div>

          {/* Search Form */}
          <FlightSearchForm />
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Why choose FlightX?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield className="w-8 h-8 text-primary-600" />,
              title: "Secure Booking",
              desc: "Your data is protected with enterprise-grade security and encrypted payments.",
            },
            {
              icon: <Clock className="w-8 h-8 text-primary-600" />,
              title: "Real-time Updates",
              desc: "Live seat availability and instant booking confirmation with PNR code.",
            },
            {
              icon: <CreditCard className="w-8 h-8 text-primary-600" />,
              title: "Best Prices",
              desc: "Compare economy, business, and first class options to find the best deal.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Routes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { from: "Dubai", to: "London", price: "$450" },
              { from: "London", to: "Dubai", price: "$430" },
              { from: "New York", to: "Los Angeles", price: "$280" },
              { from: "Los Angeles", to: "New York", price: "$270" },
            ].map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="card hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                  <span className="text-xs text-gray-500">One way</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{route.from}</p>
                <p className="text-gray-400 text-xs">→</p>
                <p className="font-semibold text-gray-900 text-sm">{route.to}</p>
                <p className="text-primary-600 font-bold mt-2">from {route.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
