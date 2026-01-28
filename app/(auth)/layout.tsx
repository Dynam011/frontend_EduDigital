import type { ReactNode } from "react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/"
          className="mb-1 inline-block p-1 rounded hover:bg-primary/5 transition"
          aria-label="Volver al login">
          {/* Flecha minimalista */}
          <span className="text-2xl">&larr;</span>
        </Link>
        {children}
      </div>
    </div>
  )
}
