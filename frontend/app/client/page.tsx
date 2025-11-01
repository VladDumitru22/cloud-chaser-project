"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { ProductsBrowser } from "@/components/products-browser"
import { MyCampaigns } from "@/components/my-campaigns"
import { Cloud, ShoppingBag, Megaphone, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

type Tab = "products" | "campaigns"

function ClientContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("products")

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
                  <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
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
                onClick={() => setActiveTab("products")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === "products"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Products
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
                My Campaigns
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "products" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Available Products</h2>
              <p className="mt-2 text-muted-foreground">Browse and purchase marketing products for your business</p>
            </div>
            <ProductsBrowser />
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">My Campaigns</h2>
              <p className="mt-2 text-muted-foreground">Create and manage your marketing campaigns</p>
            </div>
            <MyCampaigns />
          </div>
        )}
      </main>
    </div>
  )
}

export default function ClientPage() {
  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <ClientContent />
    </ProtectedRoute>
  )
}
