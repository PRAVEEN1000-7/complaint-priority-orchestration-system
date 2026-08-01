import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User as UserIcon,
  MessageSquare,
  ClipboardList,
  ShieldAlert,
  Bell,
  BarChart,
  Users,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  const NavLinks = () => (
    <>
      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Overview
      </div>
      
      {user.role === "user" && (
        <>
          <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink to="/complaints/submit" icon={MessageSquare}>Submit Complaint</NavLink>
          <NavLink to="/complaints" icon={ClipboardList}>My Complaints</NavLink>
        </>
      )}

      {user.role === "domain_head" && (
        <>
          <NavLink to="/domain-head" icon={LayoutDashboard}>Department Dashboard</NavLink>
          <NavLink to="/domain-head/assignments" icon={ClipboardList}>Assignments</NavLink>
        </>
      )}

      {user.role === "admin" && (
        <>
          <NavLink to="/admin" icon={LayoutDashboard}>Admin Dashboard</NavLink>
          <NavLink to="/admin/users" icon={Users}>Users</NavLink>
          <NavLink to="/admin/domains" icon={ShieldAlert}>Domains</NavLink>
          <NavLink to="/reports" icon={BarChart}>Reports</NavLink>
        </>
      )}

      <div className="mt-6 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Account
      </div>
      <NavLink to="/notifications" icon={Bell}>Notifications</NavLink>
      <NavLink to="/profile" icon={UserIcon}>Profile</NavLink>
      <NavLink to="/settings" icon={Settings}>Settings</NavLink>
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-red-50 hover:text-red-600 mt-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  );

  function NavLink({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) {
    let isActive = location.pathname === to;
    
    if (!isActive && to !== "/dashboard" && to !== "/admin" && to !== "/domain-head") {
      if (to === "/complaints" && location.pathname === "/complaints/submit") {
        isActive = false;
      } else if (location.pathname.startsWith(`${to}/`)) {
        isActive = true;
      }
    }

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
          isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row relative">
      {/* Subtle background abstract shapes to make glassmorphism visible */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none z-0" />
      <div className="fixed top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-slate-200/50 blur-3xl pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200/60 bg-white/40 backdrop-blur-xl md:flex relative z-10">
        <div className="flex h-16 items-center border-b border-slate-200/60 px-6">
          <span className="font-display font-bold text-xl text-slate-900">ComplaintOS</span>
        </div>
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="grid gap-1">
            <NavLinks />
          </nav>
        </div>
        <div className="border-t border-slate-200/60 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 leading-none">{user.name}</span>
              <span className="text-xs text-slate-500 mt-1 capitalize">{user.role.replace("_", " ")}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex flex-1 flex-col relative z-10">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white p-0 flex flex-col">
              <div className="flex h-16 items-center border-b border-slate-200 px-6">
                <span className="font-display font-bold text-xl text-slate-900">ComplaintOS</span>
              </div>
              <div className="flex-1 overflow-auto py-6 px-4">
                <nav className="grid gap-1">
                  <NavLinks />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="font-display font-bold text-lg text-slate-900">ComplaintOS</div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
