"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "worker" | "admin" | "client"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers: (User & { password: string })[] = [
  { id: "1", name: "John Worker", email: "worker@cloudchaser.com", password: "worker123", role: "worker" },
  { id: "2", name: "Jane Admin", email: "admin@cloudchaser.com", password: "admin123", role: "admin" },
  { id: "3", name: "Bob Client", email: "client@cloudchaser.com", password: "client123", role: "client" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("cloudchaser_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (!foundUser) {
      throw new Error("Invalid credentials")
    }

    const { password: _, ...userWithoutPassword } = foundUser
    setUser(userWithoutPassword)
    localStorage.setItem("cloudchaser_user", JSON.stringify(userWithoutPassword))

    if (foundUser.role === "worker") {
      router.push("/dashboard")
    } else if (foundUser.role === "admin") {
      router.push("/admin")
    } else if (foundUser.role === "client") {
      router.push("/client")
    }
  }

  const register = async (name: string, email: string, password: string, role: UserRole = "client") => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (mockUsers.find((u) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      role,
    }

    mockUsers.push({ ...newUser, password })
    setUser(newUser)
    localStorage.setItem("cloudchaser_user", JSON.stringify(newUser))

    if (role === "worker") {
      router.push("/dashboard")
    } else if (role === "admin") {
      router.push("/admin")
    } else if (role === "client") {
      router.push("/client")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cloudchaser_user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
