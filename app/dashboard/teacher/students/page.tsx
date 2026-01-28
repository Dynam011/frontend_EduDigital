"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, ArrowLeft, Loader } from "lucide-react"
import { api_url } from "@/app/api/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  course_title: string
  enrolled_at: string
  progress_percentage: number
  completed: boolean
}

export default function TeacherStudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userType = localStorage.getItem("userType")

    if (!token || userType !== "teacher") {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const coursesRes = await fetch(`${api_url}/api/teacher/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const coursesData = await coursesRes.json()
        setCourses(Array.isArray(coursesData) ? coursesData : [])

        const url =
          selectedCourse !== "all"
            ? `${api_url}/api/enrollments?courseId=${selectedCourse}`
            : `${api_url}/api/enrollments`

        const studentsRes = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const studentsData = await studentsRes.json()
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch (err) {
        console.error("[v0] Error fetching data:", err)
        setStudents([])
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCourse, router])

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredStudents(filtered)
  }, [searchQuery, students])

  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Curso", "Progreso", "Estado"]
    const rows = filteredStudents.map((s) => [
      `${s.first_name} ${s.last_name}`,
      s.email,
      s.course_title || "N/A",
      `${s.progress_percentage}%`,
      s.completed ? "Completado" : "En Progreso",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "estudiantes.csv"
    a.click()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/teacher">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Mis Estudiantes</h1>
              <p className="text-muted-foreground">Total: {filteredStudents.length} estudiantes</p>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Filtros */}
        <Card className="border-0 bg-card/50 backdrop-blur mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filtro de cursos */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filtrar por curso:</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="all">Todos los cursos</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de estudiantes */}
        <Card className="border-0 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Estudiantes Inscritos</CardTitle>
            <CardDescription>Visualiza el progreso de tus estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay estudiantes</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Inscripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-32">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${student.progress_percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium w-12">{student.progress_percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.completed ? "default" : "secondary"}>
                            {student.completed ? "Completado" : "En Progreso"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(student.enrolled_at).toLocaleDateString("es-ES")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
