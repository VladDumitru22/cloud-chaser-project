"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "CLIENT" | "OPERATIVE" | "ADMIN"

export type User = {
  id_user: number
  name: string
  email: string
  role: UserRole
  phone_number?: string | null
  address?: string | null
  created_at: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber?: string,
    address?: string,
    role?: UserRole
  ) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = "http://localhost:8000"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("cloudchaser_token")
    const storedUser = localStorage.getItem("cloudchaser_user")
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Invalid credentials")

      const data = await res.json()
      const token = data.access_token
      localStorage.setItem("cloudchaser_token", token)

      const userRes = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!userRes.ok) throw new Error("Failed to fetch user data")

      const userData: User = await userRes.json()
      setUser(userData)
      localStorage.setItem("cloudchaser_user", JSON.stringify(userData))

      if (userData.role === "OPERATIVE") router.push("/operator")
      else if (userData.role === "ADMIN") router.push("/admin")
      else router.push("/client")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    phoneNumber?: string,
    address?: string,
    role: UserRole = "CLIENT"
  ) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone_number: phoneNumber,
          address,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Registration failed")
      }

      await login(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cloudchaser_token")
    localStorage.removeItem("cloudchaser_user")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
