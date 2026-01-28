"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface AuthUser {
  email: string
  userType: "student" | "teacher" | "admin"
  id: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      try {
        // Decodificar token
        const decoded = Buffer.from(token, "base64").toString("utf-8")
        const [email, userType] = decoded.split(":")

        if (email && userType) {
          setUser({
            email,
            userType: userType as "student" | "teacher" | "admin",
            id: email.split("@")[0], // ID simple basado en email
          })
        }
      } catch (error) {
        localStorage.removeItem("authToken")
      }
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}
