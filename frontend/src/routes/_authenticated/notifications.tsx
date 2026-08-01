import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, Notification } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, ExternalLink, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated on your complaints and assignments.</p>
        </div>
        <Button variant="outline" onClick={fetchNotifications}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <RefreshCcw className="h-8 w-8 animate-spin mb-2" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell className="h-12 w-12 text-slate-300 mb-4" />
            You're all caught up! No notifications yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 transition-colors ${n.is_read ? 'bg-white/40' : 'bg-slate-50/60'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-2 w-2 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-blue-500'}`} />
                  <div>
                    <h3 className={`text-base ${n.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 sm:pl-0">
                  {n.complaint_id && (
                    <Link to={`/complaints/${n.complaint_id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <ExternalLink className="h-3 w-3 mr-2" /> View Ticket
                      </Button>
                    </Link>
                  )}
                  {!n.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)} className="h-8 text-blue-600">
                      <CheckCircle className="h-3 w-3 mr-2" /> Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
