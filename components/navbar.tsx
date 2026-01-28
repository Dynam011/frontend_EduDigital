"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, X, LogOut, Settings, User, Bell, Search } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggleButton } from "@/components/theme-toggle-button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/auth") || pathname === "/"
  const isStudentDashboard = pathname.startsWith("/dashboard/student")
  const isTeacherDashboard = pathname.startsWith("/dashboard/teacher")
  const isAdminDashboard = pathname.startsWith("/dashboard/admin")
  const isAdminOverviewPage = pathname === "/dashboard/admin/overview"
  const isProfilePage = pathname.startsWith("/dashboard/profile")
  const isNotificationsPage = pathname.startsWith("/dashboard/notifications")

  const { logout } = useAuth()
  const handleLogout = () => {
    logout()
  }

  // Si está en landing page, mostrar navbar especial
  if (isAuthPage && pathname === "/") {
    return null // El navbar ya está en la landing page
  }

  // Si está en auth (login/register), no mostrar navbar
  if (pathname.includes("/login") || pathname.includes("/register")) {
    return null
  }

  return (
    <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          <div className="flex items-center gap-2 mb-0">
            <img
              src="/logo.png"
              alt="Logo de la Institución"
              className="h-8 w-auto object-contain sm:h-10"
              style={{ maxWidth: '32vw' }}
            />
            <Link
              href={
                (typeof window !== "undefined" && localStorage.getItem("userType") === "student")
                  ? "/dashboard/student"
                  : (typeof window !== "undefined" && localStorage.getItem("userType") === "teacher")
                  ? "/dashboard/teacher"
                  : (typeof window !== "undefined" && localStorage.getItem("userType") === "admin")
                  ? "/dashboard/admin"
                  : "/"
              }
              className="text-base sm:text-xl font-bold text-primary truncate max-w-[32vw]"
              style={{ lineHeight: 1.1 }}
            >
              EduDigital
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isStudentDashboard && (
              <>
                <Link
                  href="/dashboard/student"
                  className={`text-sm transition ${
                    pathname === "/dashboard/student"
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/dashboard/student/explore"
                  className={`text-sm transition ${
                    pathname.includes("/explore")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Explorar Cursos
                </Link>
              </>
            )}

            {isTeacherDashboard && (
              <>
                <Link
                  href="/dashboard/teacher"
                  className={`text-sm transition ${
                    pathname === "/dashboard/teacher"
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Panel de control
                </Link>
                <Link
                  href="/dashboard/teacher/courses"
                  className={`text-sm transition ${
                    pathname.includes("/courses")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Gestión de cursos
                </Link>
              
              </>
            )}

            {isAdminDashboard && (
              <>
                <Link
                  href="/dashboard/admin"
                  className={`text-sm transition ${
                    pathname === "/dashboard/admin" && !isAdminOverviewPage
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Panel de control
                </Link>
  
                <Link
                  href="/dashboard/admin/users"
                  className={`text-sm transition ${
                    pathname.includes("/users")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Usuarios
                </Link>

              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <ThemeToggleButton />
            {/* Search (solo en dashboards) */}
            {(isStudentDashboard || isTeacherDashboard) && (
              <button className="text-muted-foreground hover:text-foreground transition hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Notifications */}
            <Link
              href="/dashboard/notifications"
              className="text-muted-foreground hover:text-foreground transition relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    E
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border pt-4">
            {isStudentDashboard && (
              <>
                <Link
                  href="/dashboard/student"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Inicio
                </Link>
                <Link
                  href="/dashboard/student/explore"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Explorar Cursos
                </Link>
                <Link
                  href="/dashboard/student/course"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Mis Cursos
                </Link>
              </>
            )}

            {isTeacherDashboard && (
              <>
                <Link
                  href="/dashboard/teacher"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Panel de control
                </Link>
                <Link
                  href="/dashboard/teacher/courses"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Gestión de cursos
                </Link>
                <Link
                  href="/dashboard/teacher/students"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Estudiantes
                </Link>
              </>
            )}

            {isAdminDashboard && (
              <>
                <Link
                  href="/dashboard/admin"
                  className={`block px-3 py-2 text-sm transition ${
                    pathname === "/dashboard/admin" && !isAdminOverviewPage
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                  }`}
                >
                  Panel de control
                </Link>
                
                <Link
                  href="/dashboard/admin/users"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition"
                >
                  Usuarios
                </Link>
              </>
            )}

            <div className="px-3 py-2 mt-4 pt-4 border-t border-border">
              <Link
                href="/dashboard/profile"
                className="block px-0 py-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                Mi Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-0 py-2 text-sm text-red-600 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
