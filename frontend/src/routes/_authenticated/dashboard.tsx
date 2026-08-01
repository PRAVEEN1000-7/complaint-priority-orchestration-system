import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  ArrowRight,
  RefreshCcw 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-500">Here's an overview of your complaint activity.</p>
        </div>
        <Link to="/complaints/submit">
          <Button className="bg-slate-900 shadow-sm hover:bg-slate-800">
            Submit New Complaint <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Complaints</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.total_complaints || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.pending_complaints || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.resolved_complaints || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Critical (P1)</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.critical_complaints || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200/60 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <Link to="/complaints">
            <Button variant="ghost" size="sm" className="text-slate-600">View All</Button>
          </Link>
        </div>
        <div className="p-0">
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recent_activity.map((complaint) => (
                <Link key={complaint.id} to={`/complaints/${complaint.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-900 truncate max-w-sm md:max-w-md">{complaint.title}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(complaint.created_at).toLocaleDateString()} &middot; {complaint.domain_name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      complaint.priority === 'P1' ? 'bg-red-100 text-red-700' :
                      complaint.priority === 'P2' ? 'bg-orange-100 text-orange-700' :
                      complaint.priority === 'P3' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      complaint.status === 'Resolved' ? 'bg-slate-100 text-slate-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No recent complaints found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
