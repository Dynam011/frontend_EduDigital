"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Users, Play } from "lucide-react"
import Link from "next/link"
import { api_url } from "@/app/api/api"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [studentsCount, setStudentsCount] = useState(0)
  const [success, setSuccess] = useState(false)
  const [courseResources, setCourseResources] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token || !courseId) return

    const fetchCourseData = async () => {
      setLoading(true)
      try {
        // 1. Curso
        console.log(courseId)
        const courseRes = await fetch(`${api_url}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const courseData = await courseRes.json()
        setCourse(courseData)

        // 2. Docente
        if (courseData.teacher_id) {
          const teacherRes = await fetch(`${api_url}/api/users/${courseData.teacher_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setTeacher(await teacherRes.json())
        }

        // 3. Módulos y lecciones
        const modulesRes = await fetch(`${api_url}/api/modules/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const modulesData = await modulesRes.json()
        // Cada módulo ya debe traer sus lecciones (según backend sugerido)
        setModules(modulesData)

        // 4. Inscripción
        const enrollRes = await fetch(`${api_url}/api/enrollments?courseId=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const enrollments = await enrollRes.json()
        console.log(enrollments)
        // Filtrar solo inscripciones de este curso (por si el backend retorna más)
        const filteredEnrollments = enrollments.filter((e: any) => String(e.course_id) === String(courseId))
        setIsEnrolled(filteredEnrollments.some((e: any) => String(e.student_id) === String(localStorage.getItem("userId"))))
        console.log(isEnrolled)
        console.log(localStorage.getItem("userId"))
        console.log(courseId)
        setStudentsCount(filteredEnrollments.length)

        // 5. Reviews (simulado, ajusta según tu backend)
        setReviews([
        
      ])
      } catch (err) {
        console.log("Error loading course data", err)
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem("authToken")
      if (isEnrolled && courseId && token) {
        try {
          const res = await fetch(`${api_url}/api/courseResource/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            setCourseResources(data);
          } else {
            console.error("Error fetching course resources:", data.message);
          }
        } catch (error) {
          console.error("Error fetching course resources:", error);
        }
      }
    };

    fetchResources();
  }, [isEnrolled, courseId]);

  const handleEnroll = async () => {
    const token = localStorage.getItem("authToken")
    const userId = localStorage.getItem("userId")
    if (!token) {
      console.log("no token")
      return
    }

    try {
      const res = await fetch(`${api_url}/api/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, courseId }),
      })
      console.log("Course Id "+courseId+" student id "+userId)

      if (res.ok) {
        setIsEnrolled(true)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
        // Redirigir a la primera lección si existe
        if (modules.length > 0 && modules[0].lessons.length > 0) {
          router.push(`/dashboard/student/course/${courseId}/lessons/${modules[0].lessons[0].id}`)
        }
      }
    } catch (err) {
      console.error("Error al inscribirse en el curso", err)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4">
        <div className="text-red-500 font-semibold">No se encontró el curso.</div>
        <Link href="/dashboard/student/explore">
          <Button variant="outline">Volver a Explorar Cursos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 text-center font-semibold transition">
            ¡Curso agregado correctamente!
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <img
                src={
                        course.image_url
                          ? course.image_url.startsWith("data:image")
                            ? course.image_url
                            : `data:image/jpeg;base64,${course.image_url}`
                          : "/classroom-01.png"
                      }
                alt={course.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
              <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-3">
                <Badge>{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-card/50">
                <TabsTrigger value="overview">Descripción</TabsTrigger>
                <TabsTrigger value="modulos">Modulos</TabsTrigger>

                {isEnrolled && <TabsTrigger value="resources">Recursos</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="">
                    <div>
                      <h3 className="font-bold mb-3">Lo que Aprenderás</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex gap-2">
                          <span>✓</span>
                          <span>{course.objectives || "Ver detalles del curso"}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-bold mb-3">Instructor</h3>
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher?.avatar_url || "/placeholder.svg"}
                          alt={teacher?.first_name}
                          className="w-12 h-12 rounded-full bg-primary/20"
                        />
                        <div>
                          <p className="font-semibold">
                            {teacher ? `${teacher.first_name} ${teacher.last_name}` : "Docente"}
                          </p>
                          <p className="text-sm text-muted-foreground">{teacher?.bio || ""}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="modulos">
                <div className="space-y-6">
                  {modules.length === 0 ? (
                    <div>No hay módulos ni lecciones disponibles.</div>
                  ) : (
                    modules.map((module, moduleIdx) => (
                      <Card key={module.id ?? module._id ?? moduleIdx} className="border-0 bg-card/50 backdrop-blur">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">{module.title || "Sin título"}</CardTitle>
                          {module.description && (
                            <p className="text-muted-foreground text-sm">{module.description}</p>
                          )}
                        </CardHeader>
                        <CardContent>
                          {module.lessons && module.lessons.length > 0 ? (
                            <ul className="divide-y divide-border">
                              {module.lessons.map((lesson: any, lessonIdx: number) => (
                                <li key={lesson.id ?? lesson._id ?? lessonIdx} className="py-3 flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{lesson.title || "Lección sin título"}</span>
                                    {lesson.duration_seconds && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        {Math.floor(lesson.duration_seconds / 60)}:{(lesson.duration_seconds % 60).toString().padStart(2, "0")} min
                                      </span>
                                    )}
                                  </div>
                                  {isEnrolled && (
                                    <Link href={`/dashboard/student/course/${courseId}/lessons/${lesson.id}`}>
                                      <Button size="sm" variant="outline">
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">No hay lecciones en este módulo.</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-6">
                      {course.rating
                        ? `${course.rating} estrellas de ${course.reviews_count} reseñas`
                        : "Sin reseñas aún"}
                    </p>
                    <div className="space-y-4">
                      {reviews.map((review, idx) => (
                        <div key={idx} className="pb-4 border-b border-border last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">{review.student}</span>
                            <span className="text-xs text-amber-500">{"★".repeat(review.rating)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {isEnrolled && (
                <TabsContent value="resources">
                  <Card className="border-0 bg-card/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle>Recursos del Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {courseResources.length > 0 ? (
                        <ul className="space-y-3">
                          {courseResources.map((resource) => (
                            <li key={resource.id}>
                              {resource.file_type === "application/pdf" ? (
                                <a
                                  href={api_url+resource.url}
                                  target="_blank"
                                  download
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                                >
                                  <FileIcon className="h-5 w-5 mr-3 text-primary" />
                                  <span className="font-medium">{resource.title} (PDF)</span>
                                </a>
                              ) : (
                                <Link
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                                >
                                  <FileIcon className="h-5 w-5 mr-3 text-primary" />
                                  <span className="font-medium">{resource.title} (URL)</span>
                                </Link>
                              )}
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-3 rounded-lg bg-background hover:bg-muted transition-colors"
                              >
                                <FileIcon className="h-5 w-5 mr-3 text-primary" />
                                <span className="font-medium">{resource.title}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No hay recursos disponibles para este curso.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card/50 backdrop-blur sticky top-20">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600 font-semibold">Gratis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEnrolled ? (
                  <Button size="lg" className="w-full gap-2" onClick={handleEnroll}>
                    <Play className="h-4 w-4" />
                    Agregar Curso
                  </Button>
                ) : (
                  <Button size="lg" className="w-full gap-2" disabled variant="secondary">
                    <Play className="h-4 w-4" />
                    Curso obtenido
                  </Button>
                )}

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {course.duration_hours
                        ? `${course.duration_hours} horas de contenido`
                        : `${modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lecciones`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {modules.length} módulos / {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lecciones
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{studentsCount} estudiantes</span>
                  </div>
                </div>

          
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function FileIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
