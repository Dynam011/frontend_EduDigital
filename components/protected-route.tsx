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
  return <>{children}</>;
}
