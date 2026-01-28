"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api_url } from "../../api/api"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("courses")
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [courses, setCourses] = useState([])
  const [tasks, setTasks] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [badges, setBadges] = useState([])
  const [error, setError] = useState<string | null>(null)

  const [averageProgress, setAverageProgress] = useState(0)
  const [hoursLearned, setHoursLearned] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
      return
    } else if (localStorage.getItem("userType") == "teacher") {
      console.log("teacher")
      router.push("/dashboard/teacher")
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const id = localStorage.getItem("userId")
                    const token = localStorage.getItem("authToken")
                    if (!id) return
        // 1. Perfil del estudiante
        const userRes = await   fetch(`${api_url}/api/users/${id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
       
        const userData = await userRes.json()
        setStudent(userData)

        // 2. Obtener todos los cursos
        const allCoursesRes = await fetch(`${api_url}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const allCourses = await allCoursesRes.json()

        // 3. Obtener enrollments del usuario
        const enrollRes = await fetch(`${api_url}/api/enrollments/student/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const enrollments = await enrollRes.json()
        // IDs de cursos en los que está inscrito el estudiante
        const enrolledCourseIds = enrollments
          .filter((e: any) => !e.completed)
          .map((e: any) => String(e.course_id))

        // Cursos activos del estudiante
        const activeCourses = allCourses.filter((course: any) =>
          enrolledCourseIds.includes(String(course.id))
        )
        setCourses(activeCourses)

        const totalProgress = activeCourses.reduce(
          (sum: number, course: any) => sum + (course.progress_percentage || 0),
          0,
        )
        const avgProgress = activeCourses.length > 0 ? Math.round(totalProgress / activeCourses.length) : 0
        setAverageProgress(avgProgress)

        const totalHours = activeCourses.reduce((sum: number, course: any) => sum + (course.duration_hours || 0), 0)
        setHoursLearned(totalHours)

        // 4. Tareas próximas
        const assignRes = await fetch(`${api_url}/api/assignments/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setTasks(await assignRes.json())

        // 5. Cursos completados
        const completedCourseIds = enrollments
          .filter((e: any) => e.completed)
          .map((e: any) => String(e.course_id))
        setCompletedCourses(
          allCourses.filter((course: any) => completedCourseIds.includes(String(course.id)))
        )

        // 6. Badges/logros (certificados)
        const badgeRes = await fetch(`${api_url}/api/certificates?studentId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const badgeData = await badgeRes.json()
        setBadges(Array.isArray(badgeData) ? badgeData : badgeData.certificates || [])
      } catch (err) {
        setError("No se pudieron cargar los datos.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/")
  }

  const handleLeaveCourse = async (courseId: string) => {
    const token = localStorage.getItem("authToken")
    const userId = localStorage.getItem("userId")
    if (!token || !userId) return

    const confirmed = window.confirm("¿Seguro que quieres abandonar este curso?")
    if (!confirmed) return

    try {
      await fetch(`${api_url}/api/enrollments/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, courseId }),
      })
      // Elimina el curso del estado local
      setCourses((prev) => prev.filter((c: any) => c.id !== courseId))
    } catch (err) {
      alert("No se pudo abandonar el curso.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Cargando...</span>
      </div>
    )
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {student && (
              <>
                <img src={student.avatar_url || "/placeholder.svg"} alt="Avatar" className="w-10 h-10 rounded-full" />
                <span className="font-semibold">
                  {student.first_name} {student.last_name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Portal del estudiante {student ? `${student.first_name} ${student.last_name}` : ""}</h1>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Cursos Activos</div>
              <div className="text-3xl">{courses.length}</div>
            </div>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-green-500/5 to-green-600/5 hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Tareas Pendientes</div>
              <div className="text-3xl">{tasks.length}</div>
            </div>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Progreso Promedio</div>
              <div className="text-3xl">{averageProgress}%</div>
            </div>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Horas Aprendidas</div>
              <div className="text-3xl">{hoursLearned}</div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-slate-800">
            <TabsTrigger value="courses">Cursos</TabsTrigger>
  
          </TabsList>

          <TabsContent value="courses">
            {courses.length === 0 ? (
              <div>No tienes cursos activos.</div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course: any) => (
                  <li key={course.id}>
                    <Card className="p-4 flex flex-col gap-3 hover:shadow-lg transition">
                      <div className="flex flex-col gap-2">
                        <img
                          src={
                            course.image_url
                              ? course.image_url.startsWith("data:image")
                                ? course.image_url
                                : `data:image/jpeg;base64,${course.image_url}`
                              : "/classroom-01.png"
                          }
                          alt={course.title}
                          className="w-full h-40 object-cover rounded-lg border mb-2"
                        />
                        <div className="font-bold text-lg mb-1">{course.title || "Sin título"}</div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {course.description || "Sin descripción."}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-1">
                          {course.category && <span className="mr-2">Categoría: {course.category}</span>}
                          {course.level && <span>Nivel: {course.level}</span>}
                          {course.instructor && <span>Docente: {course.instructor}</span>}
                          {course.duration_hours && <span>Duración: {course.duration_hours}h</span>}
                        </div>
                        <div className="w-full bg-slate-200 rounded h-2 mt-2 mb-1">
                          <div
                            className="bg-blue-500 h-2 rounded"
                            style={{ width: `${course.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mb-2">
                          Progreso: <span className="font-semibold">{course.progress_percentage || 0}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <button
                          className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 w-full sm:w-auto"
                          onClick={() => router.push(`/dashboard/student/course/${course.id}`)}
                        >
                          Ver información
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 w-full sm:w-auto"
                          onClick={() => handleLeaveCourse(course.id)}
                        >
                          Abandonar
                        </button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="tasks">
            {tasks.length === 0 ? (
              <div>No tienes tareas próximas.</div>
            ) : (
              <ul>
                {tasks.map((task: any) => (
                  <li key={task.id} className="mb-4">
                    <Card className="p-4">
                      <div className="font-bold">{task.title}</div>
                      <div className="text-sm">{task.course}</div>
                      <div className="text-xs">Fecha límite: {task.dueDate}</div>
                      <div className="text-xs">Prioridad: {task.priority}</div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="badges">
            {badges.length === 0 ? (
              <div>No tienes logros aún.</div>
            ) : (
              <ul className="grid grid-cols-2 gap-4">
                {badges.map((badge: any, idx: number) => (
                  <li key={idx} className="p-4 border rounded flex flex-col items-center">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="font-bold">{badge.title}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
