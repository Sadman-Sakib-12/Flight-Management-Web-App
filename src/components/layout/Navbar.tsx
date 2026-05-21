"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plane, Menu, X, LogOut, User, BookOpen, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useFlightStore } from "@/store/useFlightStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session, setSession, resetUser } = useUserStore();
  const { resetAll } = useFlightStore();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetUser(); resetAll();
    toast.success("Logged out");
    router.push("/");
    setMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Flights", icon: Search },
    { href: "/bookings", label: "My Bookings", icon: BookOpen },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-200",
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-card border-b border-neutral-100"
        : "bg-white border-b border-neutral-100"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-neutral-900 tracking-tight">
              Flight<span className="text-blue-600">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-150",
                  pathname === href
                    ? "text-blue-600 bg-blue-50"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {session.user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-neutral-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost">Sign in</Link>
                <Link href="/auth/signup" className="btn-primary">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === href ? "bg-blue-50 text-blue-600" : "text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-neutral-100 space-y-1.5">
            {session ? (
              <>
                <div className="px-4 py-2 text-sm text-neutral-500">{session.user.email}</div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block btn-secondary text-center">Sign in</Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
