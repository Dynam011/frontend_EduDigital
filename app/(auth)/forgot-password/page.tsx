"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "lucide-react"
import { api_url } from '../../api/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)


  // Paso 1: Verificar email y nombre
  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !firstName) {
      setError("Por favor, rellena los campos.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { email, firstName };
      const response = await fetch(api_url + "/api/auth/forgot-password?action=verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "No se encontró usuario con esos datos.");
        return;
      }
      setIsModalOpen(true);
    } catch (err) {
      setError("No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Cambiar contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError("Por favor, rellena ambos campos de contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe contener mínimo 6 dígitos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { email, newPassword };
      const response = await fetch(api_url + "/api/auth/forgot-password?action=reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error cambiando contraseña.");
        return;
      }
      setSuccess("Contraseña restablecida correctamente. Ahora puede iniciar sesión con su nueva contraseña.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      setIsModalOpen(false);
    } catch (err) {
      setError("No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Introduce tu correo electrónico y nombre para verificar tu identidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleVerifyUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isModalOpen}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Primer Nombre</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading || isModalOpen}
              />
            </div>
            {error && !isModalOpen && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            {success && !isModalOpen && (
              <div className="text-green-500 text-sm text-center">{success}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || isModalOpen}>
              {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verificar usuario
            </Button>
          </form>
          <div className="border-t border-border pt-4">
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                Volver al login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coloca tu nueva contraseña</DialogTitle>
            <DialogDescription>
              Ingresa y confirma tu nueva contraseña. Debe tener al menos 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-500 text-sm text-center">{success}</div>
            )}
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cambiar Contraseña
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
