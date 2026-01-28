"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "lucide-react"
import { api_url } from '../../api/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validaciones en tiempo real
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  })

  // Validaciones individuales
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? "" : "Email inválido."
      case "password":
        return value.length >= 6 ? "" : "Mínimo 6 caracteres."
      default:
        return ""
    }
  }

  // Validación global
  const isFormValid = Object.values(fieldErrors).every((err) => !err) && email && password

  // Handlers con validación en tiempo real
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setFieldErrors((prev) => ({ ...prev, email: validateField("email", value) }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setFieldErrors((prev) => ({ ...prev, password: validateField("password", value) }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isFormValid) return

    setIsLoading(true)
    try {
      const response = await fetch(`${api_url}/api/auth/login`, {
  method: 'POST',
  credentials: 'include', // ¡Esto es clave!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Error al iniciar sesión.")
        return
      }
      

      const data = await response.json()
     

      if ( !data.user_type) {
        setError("Credenciales inválidas.")
        return
      }


     localStorage.setItem("authToken", data.token)
      localStorage.setItem("userType", data.user_type)
      localStorage.setItem("userId", data.id)

      // Actualizar lastLogin en el backen

      if (data.user_type == "student") {
        console.log("student")
        router.push("/dashboard/student")
      } else if (data.user_type == "teacher") {
        console.log("teacher")
        router.push("/dashboard/teacher")
      }else if (data.user_type == "admin") {
        console.log("usando perfil admin")
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">EduDigital</CardTitle>
        <CardDescription>Inicia sesión en tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              autoComplete="username"
            />
            {fieldErrors.email && (
              <div className="text-red-500 text-xs">{fieldErrors.email}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <div className="text-red-500 text-xs">{fieldErrors.password}</div>
            )}
            <div className="text-right">
              <Link href="/forgot-password">
                <span className="text-sm text-blue-500 hover:underline">Forgot Password?</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Iniciar Sesión
          </Button>
        </form>

        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground text-center mb-3">¿No tienes cuenta?</p>
          <Link href="/register">
            <Button variant="outline" className="w-full bg-transparent">
              Crear Cuenta
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
