"use client"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Cloud, Sparkles, TrendingUp, Users, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "OPERATIVE") {
        router.push("/operator")
      } else if (user.role === "ADMIN") {
        router.push("/admin")
      } else if (user.role === "CLIENT") {
        router.push("/client")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <Cloud className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Cloud Chaser</span>
          </div>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Social Media Marketing Excellence
          </div>

          <h1 className="mb-6 max-w-4xl text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Chase Your Dreams in the{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Digital Sky
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Elevate your social media presence with Cloud Chaser's powerful product management platform. Streamline your
            components, products, and packages all in one place.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Product Management</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Track and manage all your products with client relationships, timelines, and detailed insights.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                <CheckCircle2 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Component Inventory</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Organize your components with types, costs, and descriptions for seamless project planning.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Package Tracking</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Bundle products and components together with quantities and notes for complete visibility.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2025 Cloud Chaser. Elevating social media marketing to new heights.</p>
        </div>
      </footer>
    </div>
  )
}
