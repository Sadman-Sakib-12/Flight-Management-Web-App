import FlightSearchForm from "@/components/search/FlightSearchForm";
import { Plane, Shield, Zap, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const ROUTES = [
  { from: "Dubai", to: "London", code: "DXB → LHR", price: "$450", duration: "7h", flag: "🇦🇪" },
  { from: "London", to: "Dubai", code: "LHR → DXB", price: "$430", duration: "7h", flag: "🇬🇧" },
  { from: "New York", to: "Los Angeles", code: "JFK → LAX", price: "$280", duration: "6h", flag: "🗽" },
  { from: "Los Angeles", to: "New York", code: "LAX → JFK", price: "$270", duration: "6h", flag: "🌴" },
];

const FEATURES = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure & Reliable",
    desc: "Bank-grade security with encrypted data and RLS-protected bookings.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-time Seats",
    desc: "Live seat availability powered by Supabase Realtime — no stale data.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Instant PNR",
    desc: "Book in seconds and get your PNR code with full boarding pass details.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-hero-gradient">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-6">
              <Plane className="w-4 h-4" />
              <span>Book flights in seconds</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
              Your Journey,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                Simplified
              </span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Search, compare, and book flights with real-time seat selection and instant confirmation.
            </p>
          </div>

          <FlightSearchForm />
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">Why FlightX?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Everything you need for a seamless booking experience.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-hover group p-7">
              <div className={`w-12 h-12 ${f.bg} ${f.text} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Popular Routes</h2>
              <p className="text-gray-500 text-sm">Most booked destinations this month</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROUTES.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-300" />
                <div className="relative">
                  <div className="text-2xl mb-3">{route.flag}</div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-gray-900">{route.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    <span className="font-bold text-gray-900">{route.to}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mb-3">{route.code} · {route.duration}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">from</p>
                      <p className="text-xl font-bold text-blue-600">{route.price}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                      <Plane className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-hero-gradient rounded-3xl p-10 md:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to take off?</h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">Create your account and book your first flight in under 2 minutes.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
