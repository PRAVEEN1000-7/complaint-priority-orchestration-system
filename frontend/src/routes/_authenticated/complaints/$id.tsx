import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getComplaint, Complaint } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Brain, 
  Clock, 
  CheckCircle, 
  RefreshCcw, 
  AlertCircle,
  ShieldAlert,
  Building2,
  Calendar,
  MessageSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  component: ComplaintDetailsPage,
});

function ComplaintDetailsPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getComplaint(id);
        setComplaint(data);
      } catch (error) {
        console.error("Failed to load complaint details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      P1: "bg-red-100 text-red-700 border-red-200",
      P2: "bg-orange-100 text-orange-700 border-orange-200",
      P3: "bg-blue-100 text-blue-700 border-blue-200",
      P4: "bg-green-100 text-green-700 border-green-200",
    };
    return map[priority] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "In Progress":
        return <RefreshCcw className="h-5 w-5 text-blue-500" />;
      case "Resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Complaint Not Found</h2>
        <p className="text-slate-500 mt-2">The ticket you are looking for does not exist or you do not have permission.</p>
        <Link to="/complaints">
          <Button variant="outline" className="mt-6">Back to list</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/complaints">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ticket #{complaint.id.substring(0, 8).toUpperCase()}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getPriorityBadge(complaint.priority)}`}>
                {complaint.priority}
              </span>
            </div>
          </div>
        </div>
        {user?.role === "domain_head" && (
          <Link to={`/domain-head/review/${complaint.id}`}>
            <Button className="bg-slate-900 shadow-sm">Review & Update Status</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-100/60 p-6">
              <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(complaint.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          {complaint.explanation && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 p-2 mt-1">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">AI Reasoning</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{complaint.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {complaint.remarks && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-slate-400 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Reviewer Remarks</h3>
                  <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3">{complaint.remarks}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Status</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              {getStatusIcon(complaint.status)}
              <span className="font-semibold text-slate-900">{complaint.status}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Assignment</h3>
            
            <div>
              <div className="text-xs text-slate-500 mb-1">Department</div>
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <Building2 className="h-4 w-4 text-slate-400" />
                {complaint.domain_name || "Unassigned"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Assigned To</div>
              <div className="font-medium text-slate-900">
                {complaint.domain_head_name || "Pending Assignment"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
