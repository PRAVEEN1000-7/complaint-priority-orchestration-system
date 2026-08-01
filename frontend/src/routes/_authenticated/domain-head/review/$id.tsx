import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getComplaint, updateComplaint, Complaint } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Brain, 
  Loader2,
  ShieldAlert,
  Building2,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/domain-head/review/$id")({
  component: ComplaintReviewPage,
});

function ComplaintReviewPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getComplaint(id);
        setComplaint(data);
        setStatus(data.status);
        setRemarks(data.remarks || "");
      } catch (error) {
        toast.error("Failed to load complaint details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateComplaint(id, status, remarks);
      toast.success("Complaint updated successfully!");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error("Failed to update complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      P1: "bg-red-100 text-red-700 border-red-200",
      P2: "bg-orange-100 text-orange-700 border-orange-200",
      P3: "bg-blue-100 text-blue-700 border-blue-200",
      P4: "bg-green-100 text-green-700 border-green-200",
    };
    return map[priority] || "bg-slate-100 text-slate-700 border-slate-200";
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

  if (!complaint || (user?.role !== "domain_head" && user?.role !== "admin")) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to review this complaint.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-6">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review Ticket #{complaint.id.substring(0, 8).toUpperCase()}</h1>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getPriorityBadge(complaint.priority)}`}>
              {complaint.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-100/60 p-6">
              <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted: {new Date(complaint.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {complaint.domain_name}
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
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">AI Routing Reasoning</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{complaint.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Update Status</h3>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="status">Current Status</Label>
                <SelectDropdown
                  id="status"
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Resolved", label: "Resolved" },
                    { value: "Rejected", label: "Rejected" },
                  ]}
                  value={{ value: status, label: status }}
                  onChange={(option: any) => setStatus(option?.value || "")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Official Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Leave a note for the user or internal records..."
                  className="min-h-[120px] resize-y"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-slate-900 shadow-sm hover:bg-slate-800 h-11">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
