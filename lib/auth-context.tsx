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

  // Función para cargar usuario desde el token
  const loadUserFromToken = () => {
    const token = localStorage.getItem("authToken")
    if (token) {
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8")
        const [email, userType] = decoded.split(":")
        if (email && userType) {
          setUser({
            email,
            userType: userType as "student" | "teacher" | "admin",
            id: email.split("@")[0],
          })
          return
        }
      } catch (error) {
        localStorage.removeItem("authToken")
      }
    }
    setUser(null)
  }

  // Efecto: cargar usuario al montar y cuando cambia el token
  useEffect(() => {
    setIsLoading(true)
    loadUserFromToken()
    setIsLoading(false)
    // Escuchar cambios de storage (logout/login en otras pestañas)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "authToken") {
        setIsLoading(true)
        loadUserFromToken()
        setIsLoading(false)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Efecto: recargar usuario si cambia el token en esta pestaña
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserFromToken()
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("userId")
    // Limpiar cookie para el middleware
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUser(null)
    window.location.replace("/login")
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
