import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getDomains, submitComplaint, Domain } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/complaints/submit")({
  component: SubmitComplaintPage,
});

function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domainId, setDomainId] = useState("");

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await getDomains();
        setDomains(data);
      } catch (error) {
        toast.error("Failed to load domains");
      }
    };
    fetchDomains();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await submitComplaint(title, description, domainId);
      toast.success("Complaint submitted successfully!");
      navigate({ to: "/complaints/$id", params: { id: result.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit complaint";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Submit Complaint</h1>
          <p className="text-sm text-slate-500">Describe the issue you're facing. Our AI will automatically categorize and prioritize it.</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title / Short Summary <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Laptop battery expanding"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide as much detail as possible about the issue..."
              className="min-h-[150px] resize-y"
              required
            />
            <p className="text-xs text-slate-500">Our Agentic AI reads this description to understand the severity and direct it to the right department.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Department (Optional)</Label>
            <SelectDropdown
              id="domain"
              options={[
                { value: "", label: "Let AI decide (Recommended)" },
                ...domains.map(d => ({ value: d.id, label: d.domain_name }))
              ]}
              value={
                domainId 
                  ? { value: domainId, label: domains.find(d => d.id === domainId)?.domain_name || "" }
                  : { value: "", label: "Let AI decide (Recommended)" }
              }
              onChange={(option: any) => setDomainId(option?.value || "")}
              placeholder="Select department..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md">
              <Sparkles className="h-4 w-4 text-blue-500" /> AI routing enabled
            </div>
            <Button type="submit" disabled={loading} className="bg-slate-900 px-8 hover:bg-slate-800">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
