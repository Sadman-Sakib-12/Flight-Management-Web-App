import Link from "next/link";
import { Plane, Github, Twitter, Mail } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Search Flights", href: "/" },
    { label: "My Bookings", href: "/bookings" },
  ],
  Routes: [
    { label: "Dubai → London", href: "/" },
    { label: "London → Dubai", href: "/" },
    { label: "New York → LA", href: "/" },
    { label: "LA → New York", href: "/" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white">Flight<span className="text-blue-400">X</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-white/30">
              A modern flight booking platform built with Next.js 14, Supabase Realtime, and Tailwind CSS.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white/70 font-semibold text-sm mb-4">{group}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm hover:text-white/70 transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} FlightX. Built with Next.js + Supabase.
          </p>

          <div className="flex items-center gap-2">
            {["Next.js", "Supabase", "Tailwind", "TypeScript"].map((t) => (
              <span key={t} className="text-xs bg-white/5 border border-white/10 text-white/30 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[
              { icon: Github, label: "GitHub", href: "#" },
              { icon: Twitter, label: "Twitter", href: "#" },
              { icon: Mail, label: "Email", href: "#" },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-all duration-150"
              >
                <Icon className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
