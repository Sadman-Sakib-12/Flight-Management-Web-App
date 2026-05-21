import FlightSearchForm from "@/components/search/FlightSearchForm";
import { Shield, Zap, HeadphonesIcon, ArrowRight, Star, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ROUTES = [
  { from: "Dubai", to: "London", fromCode: "DXB", toCode: "LHR", price: "$450", duration: "7h 00m", tag: "Popular" },
  { from: "London", to: "Dubai", fromCode: "LHR", toCode: "DXB", price: "$430", duration: "7h 00m", tag: null },
  { from: "New York", to: "Los Angeles", fromCode: "JFK", toCode: "LAX", price: "$280", duration: "6h 00m", tag: "Best Value" },
  { from: "Los Angeles", to: "New York", fromCode: "LAX", toCode: "JFK", price: "$270", duration: "6h 00m", tag: null },
];

const FEATURES = [
  { icon: Shield, title: "Secure Booking", desc: "Row-level security ensures your data stays private.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Zap, title: "Live Seat Updates", desc: "Supabase Realtime keeps seat availability accurate.", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: HeadphonesIcon, title: "Easy Management", desc: "Reschedule or cancel bookings anytime from your dashboard.", color: "text-emerald-600", bg: "bg-emerald-50" },
];

const STATS = [
  { value: "8+", label: "Flights" },
  { value: "4", label: "Routes" },
  { value: "3", label: "Cabin Classes" },
  { value: "100%", label: "Secure" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-[#0a1628] overflow-hidden min-h-[620px] flex flex-col justify-center">

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80&auto=format&fit=crop"
            alt="Airplane flying above clouds"
            fill
            className="object-cover object-center opacity-20"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0a1628]/75 to-[#0a1628]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/80 via-transparent to-[#0a1628]/80" />
        </div>

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

        <div className="relative section-container py-20 md:py-28">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full px-4 py-1.5 text-sm text-white/60">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Real-time seat availability</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white mb-4 leading-[1.1] tracking-tight">
              Book flights with
              <br />
              <span className="text-blue-400">confidence</span>
            </h1>
            <p className="text-white/45 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Search, compare, and book flights with live seat maps and instant PNR confirmation.
            </p>
          </div>

          {/* Search form */}
          <FlightSearchForm />

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 mb-10">
            {["No hidden fees", "Instant confirmation", "Free cancellation*"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-white/40">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400/70" />
                {t}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/35 mt-0.5 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade removed */}
      </section>

      {/* ── Popular Routes ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="section-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Destinations</p>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Popular routes</h2>
            </div>
            <Link href="/" className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROUTES.map((route) => (
              <div key={`${route.from}-${route.to}`} className="group relative bg-white border border-neutral-100 rounded-2xl p-5 hover:shadow-card-md hover:border-neutral-200 transition-all duration-200 cursor-pointer overflow-hidden">
                {route.tag && (
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {route.tag}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-neutral-900">{route.fromCode}</p>
                    <p className="text-xs text-neutral-400">{route.from}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="flex items-center w-full gap-1">
                      <div className="flex-1 h-px bg-neutral-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      <div className="flex-1 h-px bg-neutral-200" />
                    </div>
                    <p className="text-xs text-neutral-400">{route.duration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-neutral-900">{route.toCode}</p>
                    <p className="text-xs text-neutral-400">{route.to}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400">from</p>
                    <p className="text-lg font-bold text-blue-600">{route.price}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-neutral-50 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-200">
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors duration-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Why FlightX</p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Built for modern travelers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl border border-neutral-100 p-7 hover:shadow-card-md transition-all duration-200">
                <div className={`w-11 h-11 ${bg} ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="section-container">
          <div className="relative bg-[#0a1628] rounded-3xl px-8 py-14 md:px-14 text-center overflow-hidden">
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=70&auto=format&fit=crop"
                alt="Airport terminal"
                fill
                className="object-cover opacity-10"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/90 to-[#0d2044]/90" />
            </div>
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-2">
                  {["bg-blue-400", "bg-indigo-400", "bg-violet-400"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-[#0a1628] flex items-center justify-center`}>
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  ))}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Ready to fly?</h2>
              <p className="text-white/50 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                Create your account and book your first flight in under 2 minutes.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
