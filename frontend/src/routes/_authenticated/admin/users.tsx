import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminUsers, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, Users, RefreshCcw, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { toast } from "sonner";
import { createAdminUser } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
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

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setCreating(true);
    try {
      await createAdminUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      });
      toast.success("User created successfully!");
      setIsDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", confirmPassword: "", role: "user" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">View all registered users across the system.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900">Create User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    required 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    required 
                    autoComplete="off"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      minLength={6}
                      autoComplete="new-password"
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Retype Password</Label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      minLength={6} 
                      autoComplete="new-password"
                      value={newUser.confirmPassword} 
                      onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <SelectDropdown
                    options={[
                      { value: "user", label: "User" },
                      { value: "domain_head", label: "Domain Head" },
                      { value: "admin", label: "Admin" },
                    ]}
                    value={{ value: newUser.role, label: newUser.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) }}
                    onChange={(opt: any) => setNewUser({...newUser, role: opt.value})}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200/60 bg-white/40">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <RefreshCcw className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-slate-500">{u.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                        u.role === 'domain_head' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {u.role.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
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
