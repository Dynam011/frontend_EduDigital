"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, MoreVertical } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { api_url } from "@/app/api/api"

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    const fetchCourses = async () => {
      setLoading(true)
      try {
        
        const res = await fetch(`${api_url}/api/courses?teacher=true`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const coursesData = await res.json()
        const teacherId = localStorage.getItem("userId")
        const myCourses = coursesData.filter((course: any) => course.teacher_id == teacherId)
        setCourses(myCourses)
      } catch (err) {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course) => course.title?.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Cursos</h1>
            <p className="text-muted-foreground">Gestiona y crea tus cursos educativos</p>
          </div>
          <Link href="/dashboard/teacher/courses/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Curso
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-card/50">
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
            <TabsTrigger value="archived">Archivados</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Cargando cursos...</div>
            ) : (
              filteredCourses
                .filter((c) => c.published && !c.archived)
                .map((course) => (
                  <Card key={course.id} className="border-0 bg-card/50 backdrop-blur hover:shadow-md transition">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{course.title}</h3>
                            <Badge variant="secondary">Activo</Badge>
                            <Badge variant="outline">Año {course.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {course.students_count || 0} estudiantes • {course.lessons_count || 0} lecciones • ⭐{" "}
                            {course.rating || "N/A"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/dashboard/teacher/courses/${course.id}`}>Ver Curso</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/teacher/courses/${course.id}/edit`}>Editar</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Estadísticas</DropdownMenuItem>
                            <DropdownMenuItem>Estudiantes</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (
                                  confirm(
                                    `¿Estás seguro de que deseas eliminar "${course.title}"? Esta acción no se puede deshacer.`
                                  )
                                ) {
                                  // Verificar si hay estudiantes inscritos antes de eliminar
                                  try {
                                    const token = localStorage.getItem("authToken")
                                    if (!token) {
                                      alert("No autenticado")
                                      return
                                    }
                                    setLoading(true)
                                    // Consultar enrollments para este curso
                                    const enrollRes = await fetch(`${api_url}/api/enrollments?course_id=${course.id}`, {
                                      headers: { Authorization: `Bearer ${token}` },
                                    })
                                    const enrollments = await enrollRes.json()
                                    if (Array.isArray(enrollments) && enrollments.length > 0) {
                                      alert(`No se puede eliminar el curso porque hay ${enrollments.length} estudiante(s) inscrito(s). Elimina primero las inscripciones.`)
                                      setLoading(false)
                                      return
                                    }
                                    // Si no hay inscritos, proceder a eliminar
                                    const res = await fetch(`${api_url}/api/courses/${course.id}`, {
                                      method: "DELETE",
                                      headers: { Authorization: `Bearer ${token}` },
                                    })
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({ message: res.statusText }))
                                      alert(`No se pudo eliminar el curso: ${err.message || res.statusText}`)
                                      setLoading(false)
                                      return
                                    }
                                    setCourses((prev) => prev.filter((c) => c.id !== course.id))
                                    alert("Curso eliminado correctamente")
                                  } catch (error) {
                                    console.error("Delete course error:", error)
                                    alert("Error al eliminar el curso")
                                  } finally {
                                    setLoading(false)
                                  }
                                }
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Cargando cursos...</div>
            ) : (
              filteredCourses
                .filter((c) => !c.published && !c.archived)
                .map((course) => (
                  <Card key={course.id} className="border-0 bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{course.title}</h3>
                            <Badge variant="outline">Borrador</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{course.lessons_count || 0} lecciones</p>
                        </div>
                        <Link href={`/dashboard/teacher/courses/${course.id}/edit`}>
                          <Button variant="outline">Continuar Editando</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="archived" className="text-center py-8">
            {loading ? (
              <div className="text-center py-8">Cargando cursos...</div>
            ) : (
              filteredCourses
                .filter((c) => c.archived)
                .map((course) => (
                  <Card key={course.id} className="border-0 bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{course.title}</h3>
                            <Badge variant="outline">Archivado</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{course.lessons_count || 0} lecciones</p>
                        </div>
                        <Button variant="outline">Restaurar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
            {!filteredCourses.some((c) => c.archived) && (
              <p className="text-muted-foreground">No hay cursos archivados</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
