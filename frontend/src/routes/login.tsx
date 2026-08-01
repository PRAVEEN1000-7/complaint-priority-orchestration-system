import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { login, setAuthToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in - ComplaintOS" },
      {
        name: "description",
        content: "Sign in to access your Complaint Priority Orchestration System dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      setAuthUser(response.user);
      toast.success("Welcome back to ComplaintOS!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between text-primary-foreground">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <Link to="/" className="relative flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl">ComplaintOS</span>
        </Link>
        <div className="relative">
          <h1 className="text-5xl font-bold leading-tight">
            Intelligent Triage,
            <br />
            Faster Resolutions.
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Automate complaint routing and prioritization across your entire organization with Agentic AI.
          </p>
        </div>
        <div className="relative text-xs opacity-70">Copyright 2026 ComplaintOS</div>
      </div>

      <div 
        className="relative flex items-center justify-center p-6 sm:p-12 bg-slate-100/50 overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          e.currentTarget.style.setProperty('--x', `${x}px`);
          e.currentTarget.style.setProperty('--y', `${y}px`);
        }}
      >
        {/* Static background blobs for the glass card to refract */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-[80px] pointer-events-none" />

        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle 600px at var(--x, 50%) var(--y, 50%), rgba(99, 102, 241, 0.15), transparent 40%)'
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10 rounded-3xl bg-white/40 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 p-8 sm:p-10"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">ComplaintOS</span>
          </Link>

          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-muted-foreground">Sign in to continue to your dashboard.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 shadow-md hover:bg-slate-800"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
