"use client"

import { SettingsIcon } from "lucide-react"

export default function SettingsTab() {
  return (
    <div className="glass p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={28} className="text-primary" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Theme Settings */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
          <h3 className="font-semibold text-lg">Display</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm">Theme</label>
            <span className="text-sm text-muted-foreground">Dark (Fixed)</span>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm">Email Recommendations</label>
            <input type="checkbox" className="w-4 h-4 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Weekly Digest</label>
            <input type="checkbox" className="w-4 h-4 cursor-pointer" />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
          <h3 className="font-semibold text-lg">Privacy</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm">Save Mood History</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Allow Analytics</label>
            <input type="checkbox" defaultChecked className="w-4 h-4 cursor-pointer" />
          </div>
        </div>

        {/* API Settings */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
          <h3 className="font-semibold text-lg">API</h3>
          <p className="text-sm text-muted-foreground">Backend: deltaworld-moodflix-backend.hf.space</p>
        </div>
      </div>
    </div>
  )
}
