import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  Wind,
  MapPin,
  ShieldAlert,
  BarChart3,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ComplaintOS - AI Complaint Priority Orchestration" },
      {
        name: "description",
        content:
          "Automated complaint routing and prioritization across your organization using Agentic AI.",
      },
      { property: "og:title", content: "ComplaintOS - AI Orchestration" },
      {
        property: "og:description",
        content:
          "Triage issues with AI. Route complaints across departments instantly.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <LayoutGrid className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">ComplaintOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">
              Features
            </a>
            <a href="#how" className="hover:text-foreground transition">
              How it works
            </a>
          </nav>
          <Link to="/login">
            <Button variant="default" className="bg-slate-900 shadow-sm hover:opacity-90">
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 mb-6">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live AI triage processing
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-slate-900">
              Resolve faster.
              <br />
              <span className="text-slate-600">Automate triage.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              ComplaintOS is an AI-powered orchestration platform that intercepts, categorizes, and prioritizes unstructured complaints, routing them directly to the correct Domain Head before delays occur.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-slate-900 shadow-sm hover:opacity-90 text-base px-8 h-12"
                >
                  Launch dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Explore features
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl bg-white border border-slate-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-500">Ticket #A92-841</div>
                  <div className="text-xl font-bold mt-1 text-slate-900">Laptop battery expanding</div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  P1 Critical
                </div>
              </div>
              
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">AI Routing Decision</div>
                    <div className="font-semibold mt-0.5 text-slate-900">Routed to IT Hardware</div>
                    <p className="mt-2 text-sm text-slate-600">
                      Assigned to IT Hardware as P1 because a swelling battery is an immediate fire and safety hazard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Capabilities
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-slate-900">Intelligence for support teams</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Activity,
                title: "Real-time intake",
                desc: "Instantly captures and sanitizes unstructured user input.",
              },
              {
                icon: Brain,
                title: "AI Category Detection",
                desc: "Corrects manual routing errors by semantically analyzing complaints.",
              },
              {
                icon: BarChart3,
                title: "Severity Prioritization",
                desc: "Determines P1 to P4 urgency levels based on risk analysis.",
              },
              {
                icon: MapPin,
                title: "Dynamic Assignment",
                desc: "Automatically maps issues to designated Domain Heads.",
              },
              {
                icon: ShieldAlert,
                title: "Explainability",
                desc: "Generates human-readable reasoning for every routing decision.",
              },
              {
                icon: Wind,
                title: "Role-Based Dashboards",
                desc: "Custom views for Admins, Domain Heads, and regular Users.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center transition-all">
                  <f.icon className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="mt-4 font-semibold text-lg text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">From submission to resolution</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Submit", d: "User submits an unstructured complaint text." },
              { n: "02", t: "Orchestrate", d: "LangGraph pipeline cleans, categorizes, and prioritizes." },
              { n: "03", t: "Resolve", d: "Domain Head receives the ticket and executes a fix." },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl bg-white border border-slate-200 p-8 text-left shadow-sm"
              >
                <div className="text-5xl font-bold text-slate-300">{s.n}</div>
                <div className="mt-4 font-semibold text-xl text-slate-900">{s.t}</div>
                <p className="mt-2 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <Link to="/login">
              <Button size="lg" className="bg-slate-900 shadow-sm h-12 px-10 text-base">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-slate-400" />
            <span>Copyright 2026 ComplaintOS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
