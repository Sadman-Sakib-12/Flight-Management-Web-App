"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const { setSession } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (data.session) { setSession(data.session); toast.success("Welcome to FlightX!"); router.push("/"); }
    else { toast.success("Check your email to confirm."); router.push("/auth/login"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a1628] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Flight<span className="text-blue-400">X</span></span>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Join thousands of<br />happy travelers
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Create your account and start booking flights with real-time seat selection.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          {["8+ Flights", "4 Routes", "Live Seats", "Instant PNR"].map((f) => (
            <div key={f} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/50">{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-neutral-900">Flight<span className="text-blue-600">X</span></span>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Create account</h1>
          <p className="text-neutral-500 text-sm mb-8">Start booking flights today</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-11" placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-10" placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? "Creating account..." : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="text-sm text-neutral-500 text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
