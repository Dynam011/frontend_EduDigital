"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "lucide-react"
import { api_url } from '../../api/api'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") as "student" | "teacher" | null

  const [userType, setUserType] = useState<"student" | "teacher">(roleParam || "student")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validaciones en tiempo real
  const [studentErrors, setStudentErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const [teacherErrors, setTeacherErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    institution: "",
    password: "",
  })

  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const [teacherData, setTeacherData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    institution: "",
    password: "",
  })

  // Validaciones individuales
  const validateStudentField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value ? "" : "Este campo es obligatorio."
      case "email":
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? "" : "Email inválido."
      case "password":
        return value.length >= 6 ? "" : "Mínimo 6 caracteres."
      default:
        return ""
    }
  }

  const validateTeacherField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value ? "" : "Este campo es obligatorio."
      case "email":
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? "" : "Email inválido."
      case "phone":
        if (!value) return "Este campo es obligatorio."
        if (!/^\d+$/.test(value)) return "Solo números."
        if (!/^(0424|0412|0416|0426)/.test(value)) return "Debe iniciar con 0424, 0412, 0416 o 0426."
        if (value.length !== 11) return "Debe tener 11 dígitos."
        return ""
      case "institution":
        return value ? "" : "Este campo es obligatorio."
      case "password":
        return value.length >= 6 ? "" : "Mínimo 6 caracteres."
      default:
        return ""
    }
  }

  // Validación global
  const isStudentValid = Object.values(studentErrors).every((err) => !err) &&
    Object.values(studentData).every((val) => !!val)

  const isTeacherValid = Object.values(teacherErrors).every((err) => !err) &&
    Object.values(teacherData).every((val) => !!val)

  // Handlers con validación en tiempo real
  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setStudentData((prev) => ({ ...prev, [name]: value }))
    setStudentErrors((prev) => ({ ...prev, [name]: validateStudentField(name, value) }))
  }

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTeacherData((prev) => ({ ...prev, [name]: value }))
    setTeacherErrors((prev) => ({ ...prev, [name]: validateTeacherField(name, value) }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (userType === "student" && !isStudentValid) return
    if (userType === "teacher" && !isTeacherValid) return

    setIsLoading(true)
    try {
      const payload =
        userType === "student" ? { ...studentData, userType: "student" } : { ...teacherData, userType: "teacher" }

      const response = await fetch(api_url + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al registrar usuario.")
        return
      }
      setError(data.message)
      // Si hay token, redirige
      if (data.token) {
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("userType", userType)
        router.push(userType === "student" ? "/dashboard/student" : "/dashboard/teacher")
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
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate en EduDigital</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={userType} onValueChange={(val) => setUserType(val as "student" | "teacher")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Soy Estudiante</TabsTrigger>
            <TabsTrigger value="teacher">Soy Docente</TabsTrigger>
          </TabsList>

          {/* Student Registration */}
          <TabsContent value="student" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="student-firstName">Nombre</Label>
                  <Input
                    id="student-firstName"
                    name="firstName"
                    placeholder="Juan"
                    value={studentData.firstName}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                  />
                  {studentErrors.firstName && (
                    <div className="text-red-500 text-xs">{studentErrors.firstName}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-lastName">Apellido</Label>
                  <Input
                    id="student-lastName"
                    name="lastName"
                    placeholder="Pérez"
                    value={studentData.lastName}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                  />
                  {studentErrors.lastName && (
                    <div className="text-red-500 text-xs">{studentErrors.lastName}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-email">Correo electrónico</Label>
                <Input
                  id="student-email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={studentData.email}
                  onChange={handleStudentChange}
                  disabled={isLoading}
                />
                {studentErrors.email && (
                  <div className="text-red-500 text-xs">{studentErrors.email}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-password">Contraseña</Label>
                <Input
                  id="student-password"
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={studentData.password}
                  onChange={handleStudentChange}
                  disabled={isLoading}
                />
                {studentErrors.password && (
                  <div className="text-red-500 text-xs">{studentErrors.password}</div>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !isStudentValid}>
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>

          {/* Teacher Registration */}
          <TabsContent value="teacher" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="teacher-firstName">Nombre</Label>
                  <Input
                    id="teacher-firstName"
                    name="firstName"
                    placeholder="María"
                    value={teacherData.firstName}
                    onChange={handleTeacherChange}
                    disabled={isLoading}
                  />
                  {teacherErrors.firstName && (
                    <div className="text-red-500 text-xs">{teacherErrors.firstName}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-lastName">Apellido</Label>
                  <Input
                    id="teacher-lastName"
                    name="lastName"
                    placeholder="García"
                    value={teacherData.lastName}
                    onChange={handleTeacherChange}
                    disabled={isLoading}
                  />
                  {teacherErrors.lastName && (
                    <div className="text-red-500 text-xs">{teacherErrors.lastName}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-email">Correo electrónico</Label>
                <Input
                  id="teacher-email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={teacherData.email}
                  onChange={handleTeacherChange}
                  disabled={isLoading}
                />
                {teacherErrors.email && (
                  <div className="text-red-500 text-xs">{teacherErrors.email}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-phone">Teléfono</Label>
                <Input
                  id="teacher-phone"
                  name="phone"
                  type="tel"
                  placeholder="04241234567"
                  maxLength={11}
                  value={teacherData.phone}
                  onChange={handleTeacherChange}
                  disabled={isLoading}
                />
                {teacherErrors.phone && (
                  <div className="text-red-500 text-xs">{teacherErrors.phone}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-institution">Institución Educativa</Label>
                <Input
                  id="teacher-institution"
                  name="institution"
                  placeholder="Universidad / Escuela"
                  value={teacherData.institution}
                  onChange={handleTeacherChange}
                  disabled={isLoading}
                />
                {teacherErrors.institution && (
                  <div className="text-red-500 text-xs">{teacherErrors.institution}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-password">Contraseña</Label>
                <Input
                  id="teacher-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={teacherData.password}
                  onChange={handleTeacherChange}
                  disabled={isLoading}
                />
                {teacherErrors.password && (
                  <div className="text-red-500 text-xs">{teacherErrors.password}</div>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !isTeacherValid}>
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground text-center mb-3">¿Ya tienes cuenta?</p>
          <Link href="/login">
            <Button variant="outline" className="w-full bg-transparent">
              Inicia Sesión
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
