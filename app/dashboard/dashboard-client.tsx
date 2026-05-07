"use client"

import { useState } from "react"
import { ChevronRight, Monitor, Settings, Shield, Target, Users, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import CommandCenterSection from "./command-center-section"
import AgentNetworkSection from "./agent-network-section"
import OperationsSection from "./operations-section"
import IntelligenceSection from "./intelligence-section"
import SystemsSection from "./systems-section"

const sections = [
  { id: "overview", icon: Monitor, label: "INTEGRITY OVERVIEW" },
  { id: "agents", icon: Users, label: "ACCOUNTS" },
  { id: "operations", icon: Target, label: "VERIFICATION RUNS" },
  { id: "intelligence", icon: Shield, label: "EVIDENCE SIGNALS" },
  { id: "systems", icon: Settings, label: "PLATFORM HEALTH" },
] as const

export default function TacticalDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const activeSectionLabel = sections.find((section) => section.id === activeSection)?.label ?? "INTEGRITY OVERVIEW"

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-[17.5rem]"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-8 gap-3">
            <div className={`${sidebarCollapsed ? "hidden" : "block"} min-w-0`}>
              <div className="flex items-center gap-3">
                <img
                  src="/icon-light-32x32.png"
                  alt="TrustSignal"
                  width="32"
                  height="32"
                  className="h-8 w-8"
                />
                <span className="text-3xl font-semibold tracking-tight text-white">
                  trustsignal
                </span>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                Evidence Integrity Infrastructure
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs text-white">SIGNING PIPELINE ONLINE</span>
              </div>
              <div className="text-xs text-neutral-500">
                <div>UPTIME: 72:14:33</div>
                <div>RECEIPTS: 847 SIGNED</div>
                <div>REVIEWS: 23 ACTIVE</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              TRUSTSIGNAL / <span className="text-orange-500">{activeSectionLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">LAST UPDATE: 05/06/2025 20:00 UTC</div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === "overview" && <CommandCenterSection />}
          {activeSection === "agents" && <AgentNetworkSection />}
          {activeSection === "operations" && <OperationsSection />}
          {activeSection === "intelligence" && <IntelligenceSection />}
          {activeSection === "systems" && <SystemsSection />}
        </div>
      </div>
    </div>
  )
}
