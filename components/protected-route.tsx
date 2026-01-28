"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "student" | "teacher" | "admin"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  // Mientras no esté autenticado, no renderizar nada (evita parpadeos)
  if (!isAuthenticated) {
    return null;
  }
  if (requiredRole && user?.userType !== requiredRole) {
    return null;
  }
  return <>{children}</>;
}
