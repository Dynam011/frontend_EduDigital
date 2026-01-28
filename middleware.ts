import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedRoutes = [
    "/dashboard",
    "/dashboard/student",
    "/dashboard/teacher",
    "/dashboard/admin",
    "/dashboard/profile",
    "/dashboard/notifications",
  ]

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Obtener token del header o cookies
    const token =
      request.cookies.get("authToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Validar que el token sea válido (formato básico)
    try {
      // Decodificar token base64
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [email, userType] = decoded.split(":")
     
      if (!email || !userType) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Validar rutas por tipo de usuario

      // Token válido, continuar
      const response = NextResponse.next()
      response.headers.set("x-user-type", userType)
      response.headers.set("x-user-email", email)
 
      return response
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Rutas públicas permitidas
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - api (rutas API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public (archivos públicos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
