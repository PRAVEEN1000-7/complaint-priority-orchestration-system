import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Profile</h1>
          <p className="text-sm text-slate-500">Manage your personal information.</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-center">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-slate-800">
            <span className="text-4xl font-bold text-slate-900">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-300 capitalize">{user?.role.replace("_", " ")}</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <User className="h-4 w-4" /> Full Name
              </div>
              <p className="font-medium text-slate-900">{user?.name}</p>
            </div>
            
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Mail className="h-4 w-4" /> Email Address
              </div>
              <p className="font-medium text-slate-900">{user?.email}</p>
            </div>

            <div className="space-y-1 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Shield className="h-4 w-4" /> Access Level
              </div>
              <p className="font-medium text-slate-900 capitalize">{user?.role.replace("_", " ")}</p>
            </div>

            <div className="space-y-1 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Building2 className="h-4 w-4" /> Organization
              </div>
              <p className="font-medium text-slate-900">ComplaintOS Enterprise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
