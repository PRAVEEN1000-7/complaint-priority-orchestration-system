import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminDomainHeads, getDomains, getAdminUsers, createDomainHead, deleteDomainHead, DomainHead, Domain, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createDomain } from "@/lib/api";
import { ShieldAlert, Building2, Trash2, Plus, RefreshCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/domains")({
  component: AdminDomainsPage,
});

function AdminDomainsPage() {
  const { user } = useAuth();
  const [domainHeads, setDomainHeads] = useState<DomainHead[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [creatingDomain, setCreatingDomain] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dhData, domData, usrData] = await Promise.all([
        getAdminDomainHeads(),
        getDomains(),
        getAdminUsers()
      ]);
      setDomainHeads(dhData);
      setDomains(domData);
      setUsers(usrData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedDomain) {
      toast.error("Select both a user and a domain");
      return;
    }
    setSubmitting(true);
    try {
      await createDomainHead(selectedUser, selectedDomain);
      toast.success("Domain head assigned successfully");
      fetchData();
      setSelectedUser("");
      setSelectedDomain("");
    } catch (error) {
      toast.error("Failed to assign domain head. They might already be assigned.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDomainHead(id);
      toast.success("Domain head removed");
      setDomainHeads(domainHeads.filter(d => d.id !== id));
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDomain(true);
    try {
      await createDomain(newDomainName);
      toast.success("Domain created! AI will automatically re-evaluate any unresolved unassigned complaints.");
      setIsDomainDialogOpen(false);
      setNewDomainName("");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create domain");
    } finally {
      setCreatingDomain(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Domains & Departments</h1>
          <p className="text-sm text-slate-500">Manage domains and assign domain heads.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDomainDialogOpen} onOpenChange={setIsDomainDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900">Create Domain</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Domain</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDomain} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Domain Name</Label>
                  <Input 
                    required 
                    value={newDomainName} 
                    onChange={e => setNewDomainName(e.target.value)} 
                    placeholder="e.g. IT Department, Facilities"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creatingDomain}>
                  {creatingDomain ? "Creating..." : "Create Domain"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Assign New Head</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <SelectDropdown
                  options={[
                    { value: "", label: "-- Choose User --" },
                    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))
                  ]}
                  value={
                    selectedUser 
                      ? { value: selectedUser, label: users.find(u => u.id === selectedUser)?.name + ` (${users.find(u => u.id === selectedUser)?.email})` }
                      : { value: "", label: "-- Choose User --" }
                  }
                  onChange={(option: any) => setSelectedUser(option?.value || "")}
                  placeholder="Select a user..."
                />
              </div>
              <div className="space-y-2">
                <Label>Select Department (Domain)</Label>
                <SelectDropdown
                  options={[
                    { value: "", label: "-- Choose Domain --" },
                    ...domains.map(d => ({ value: d.id, label: d.domain_name }))
                  ]}
                  value={
                    selectedDomain
                      ? { value: selectedDomain, label: domains.find(d => d.id === selectedDomain)?.domain_name || "" }
                      : { value: "", label: "-- Choose Domain --" }
                  }
                  onChange={(option: any) => setSelectedDomain(option?.value || "")}
                  placeholder="Select a department..."
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-slate-900">
                {submitting ? "Assigning..." : <><Plus className="h-4 w-4 mr-2" /> Assign Head</>}
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Department</TableHead>
                    <TableHead>Head Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        <RefreshCcw className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : domainHeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32 text-slate-500">
                        No domain heads assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    domainHeads.map((dh) => (
                      <TableRow key={dh.id}>
                        <TableCell className="font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            {dh.domain_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">{dh.user_name}</TableCell>
                        <TableCell className="text-slate-500">{dh.user_email}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(dh.id)} className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
