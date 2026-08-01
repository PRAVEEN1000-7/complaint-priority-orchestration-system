import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getComplaints, Complaint } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ClipboardList, 
  Search, 
  ArrowRight,
  Filter,
  RefreshCcw,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/complaints/")({
  component: ComplaintsListPage,
});

function ComplaintsListPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.status.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      P1: "bg-red-100 text-red-700 border-red-200",
      P2: "bg-orange-100 text-orange-700 border-orange-200",
      P3: "bg-blue-100 text-blue-700 border-blue-200",
      P4: "bg-green-100 text-green-700 border-green-200",
    };
    return map[priority] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <div className="flex items-center gap-1 text-yellow-600"><Clock className="h-3 w-3" /> Pending</div>;
      case "In Progress":
        return <div className="flex items-center gap-1 text-blue-600"><RefreshCcw className="h-3 w-3" /> In Progress</div>;
      case "Resolved":
        return <div className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" /> Resolved</div>;
      case "Rejected":
        return <div className="flex items-center gap-1 text-red-600"><AlertCircle className="h-3 w-3" /> Rejected</div>;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {user?.role === "user" ? "My Complaints" : "All Complaints"}
          </h1>
          <p className="text-sm text-slate-500">View and track the status of complaints.</p>
        </div>
        {user?.role === "user" && (
          <Link to="/complaints/submit">
            <Button className="bg-slate-900 shadow-sm hover:bg-slate-800">
              New Complaint <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between bg-white/40">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID, title, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
          <Button variant="outline" className="h-10">
            <Filter className="h-4 w-4 mr-2 text-slate-500" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[100px]">Ticket ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-slate-300" />
                      <p>No complaints found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-slate-500">
                      {c.id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 max-w-[200px] truncate">
                      {c.title}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {c.domain_name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {getStatusBadge(c.status)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {user?.role === "domain_head" ? (
                        <Link to={`/domain-head/review/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
                            Review
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/complaints/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
                            View
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// Temporary mock for Loader2 since it wasn't imported from lucide-react above
function Loader2(props: any) {
  return <RefreshCcw {...props} />;
}
