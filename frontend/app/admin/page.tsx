"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { ClientsTable } from "@/components/clients-table"
import { CampaignsTable } from "@/components/campaigns-table"
import { Cloud, Users, Megaphone, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

type Tab = "clients" | "campaigns"

function AdminContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("clients")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                  <Cloud className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Cloud Chaser</h1>
                  <p className="text-sm text-muted-foreground">{user?.name} - Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab("clients")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === "clients"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Users className="h-4 w-4" />
                Users
              </button>
              <button
                onClick={() => setActiveTab("campaigns")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === "campaigns"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Megaphone className="h-4 w-4" />
                Campaigns
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "clients" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Users Management</h2>
              <p className="mt-2 text-muted-foreground">Manage user information and contact details</p>
            </div>
            <ClientsTable />
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Campaigns Management</h2>
              <p className="mt-2 text-muted-foreground">Track and manage marketing campaigns</p>
            </div>
            <CampaignsTable />
          </div>
        )}
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminContent />
    </ProtectedRoute>
  )
}
