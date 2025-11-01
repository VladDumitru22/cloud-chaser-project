"use client"

import type React from "react"

import { useAuth, type UserRole } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (!allowedRoles.includes(user.role)) {
        if (user.role === "OPERATIVE") {
          router.push("/operator")
        } else if (user.role === "ADMIN") {
          router.push("/admin")
        } else if (user.role === "CLIENT") {
          router.push("/client")
        }
      }
    }
  }, [user, isLoading, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
