import { createFileRoute } from "@tanstack/react-router";
import { Settings, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Configure your application preferences.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-slate-100 text-slate-900 font-medium">
            <Settings className="mr-2 h-4 w-4" /> General
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
            <Shield className="mr-2 h-4 w-4" /> Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
            <Palette className="mr-2 h-4 w-4" /> Appearance
          </Button>
        </div>

        <div className="md:col-span-3">
          <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">General Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="font-medium text-slate-900">Email Alerts</h3>
                  <p className="text-sm text-slate-500">Receive email notifications for important updates.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-900 relative cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white absolute top-1 right-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="font-medium text-slate-900">AI Routing Confirmations</h3>
                  <p className="text-sm text-slate-500">Show AI explanation when assigning tickets automatically.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-900 relative cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white absolute top-1 right-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="font-medium text-slate-900">Language</h3>
                  <p className="text-sm text-slate-500">Select your preferred language.</p>
                </div>
                <SelectDropdown 
                  options={[
                    { value: "en-US", label: "English (US)" },
                    { value: "es", label: "Spanish" },
                    { value: "fr", label: "French" }
                  ]}
                  defaultValue={{ value: "en-US", label: "English (US)" }}
                  className="w-48"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button className="bg-slate-900">Save Preferences</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
