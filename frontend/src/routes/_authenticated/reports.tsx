import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStatistics, AdminStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, BarChart3, RefreshCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Optional chaining to support recharts if it exists in the build without strict typing checks
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      getAdminStatistics().then(setStats).finally(() => setLoading(false));
    }
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const pieData = [
    { name: "Resolved", value: stats.resolved_complaints },
    { name: "Pending", value: stats.pending_complaints }
  ];
  const COLORS = ["#10b981", "#f59e0b"];

  const barData = [
    { name: "High Priority (P1/P2)", count: stats.high_priority_complaints },
    { name: "Standard (P3/P4)", count: stats.total_complaints - stats.high_priority_complaints }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Deep dive into ComplaintOS performance.</p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Resolution Ratio</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Priority Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
