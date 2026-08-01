import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStatistics, AdminStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Building2, 
  ClipboardList,
  RefreshCcw,
  ShieldAlert,
  BarChart3,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStatistics();
      setStats(data);
    } catch (err) {
      setError("Failed to load admin statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2">Only administrators can access this area.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-6">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading admin overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold text-red-700">Error Loading Data</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchStats}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Overview</h1>
          <p className="text-sm text-slate-500">Global metrics for ComplaintOS.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchStats} className="bg-white">
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Link to="/reports">
            <Button className="bg-slate-900 shadow-sm hover:bg-slate-800">
              <BarChart3 className="mr-2 h-4 w-4" /> View Full Report
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.total_users || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-indigo-100 p-3">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Domains</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.total_domains || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 p-3">
              <ClipboardList className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Complaints</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.total_complaints || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">High Priority (P1/P2)</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.high_priority_complaints || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Complaint Resolution Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-slate-700">Resolved</span>
              </div>
              <span className="font-semibold">{stats?.resolved_complaints || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats?.resolved_complaints || 0) / (stats?.total_complaints || 1) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-yellow-500" />
                <span className="text-slate-700">Pending / In Progress</span>
              </div>
              <span className="font-semibold">{stats?.pending_complaints || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats?.pending_complaints || 0) / (stats?.total_complaints || 1) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Domain Heads</h3>
          <p className="text-3xl font-bold text-indigo-600 my-2">{stats?.total_domain_heads || 0}</p>
          <p className="text-sm text-slate-500 max-w-xs">Domain heads responsible for triage and resolution of complaints.</p>
          <Link to="/admin/domains" className="mt-4">
            <Button variant="outline" size="sm">Manage Domains</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
