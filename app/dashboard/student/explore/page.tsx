"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Star, Users } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api_url } from "@/app/api/api"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [wishlist, setWishlist] = useState<number[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    const fetchCourses = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${api_url}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setCourses(data)
      } catch (err) {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const toggleWishlist = (courseId: number) => {
    setWishlist((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Explorar Cursos</h1>
            <Link href="/dashboard/student">
              <Button variant="outline">Volver al Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Busca por nombre, tema..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Programación">Programación</SelectItem>
                <SelectItem value="Diseño">Diseño</SelectItem>
                <SelectItem value="Negocios">Negocios</SelectItem>
                <SelectItem value="Ciencia">Ciencia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">Año 1</SelectItem>
                <SelectItem value="2">Año 2</SelectItem>
                <SelectItem value="3">Año 3</SelectItem>
                <SelectItem value="4">Año 4</SelectItem>
                <SelectItem value="5">Año 5</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery !== "" || selectedCategory !== "all" || selectedLevel !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedLevel("all")
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        <div>
          <p className="text-muted-foreground mb-6">{filteredCourses.length} cursos encontrados</p>
          {loading ? (
            <div className="text-center py-10">Cargando cursos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="border-0 bg-card/50 backdrop-blur overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={
                        course.image_url
                          ? course.image_url.startsWith("data:image")
                            ? course.image_url
                            : `data:image/jpeg;base64,${course.image_url}`
                          : "/classroom-01.png"
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <button
                      onClick={() => toggleWishlist(course.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          wishlist.includes(course.id) ? "fill-destructive text-destructive" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {course.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">{course.title}</CardTitle>
                    <CardDescription className="text-xs">{course.teacher_name || "Docente"}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {course.rating || "N/A"}
                        <span className="text-muted-foreground">({course.reviews || 0})</span>
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {course.students || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-green-600 font-semibold">Gratis</span>
                      <Link href={`/dashboard/student/course/${course.id}`}>
                        <Button size="sm" variant="outline">
                          Ver Curso
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
