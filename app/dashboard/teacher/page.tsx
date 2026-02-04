"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, TrendingUp, Users, BookOpen, AlertCircle, MessageSquare, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { api_url } from "../../api/api"
import { useAuth } from "@/lib/auth-context"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function TeacherDashboard() {
  const { toast } = useToast();
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [courses, setCourses] = useState<any[]>([])
  const [studentsCount, setStudentsCount] = useState(0)
  const [coursePerformanceData, setCoursePerformanceData] = useState<any[]>([])
  const [studentProgressData, setStudentProgressData] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherName, setTeacherName] = useState<string>("")

  // Nuevo estado para el diálogo de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        const teacherId = localStorage.getItem("userId")
        const token = localStorage.getItem("authToken")
        // 0. Obtener nombre del docente
        if (teacherId && token) {
          try {
            const userRes = await fetch(`${api_url}/api/users/${teacherId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const userData = await userRes.json()
            const resolvedName = userData?.name || `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() || "Profesor"
            setTeacherName(resolvedName)
          } catch {
            setTeacherName("Profesor")
          }
        }

        const coursesRes = await fetch(`${api_url}/api/courses/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const coursesData = await coursesRes.json()
        setCourses(coursesData)

        // 2. Obtener estudiantes totales y tasa de finalización
        let totalStudents = 0
        let totalCompletion = 0
        const perfData: any[] = []
        for (const course of coursesData) {
          const enrollRes = await fetch(`${api_url}/api/enrollments/course/${course.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const enrollments = await enrollRes.json()
          totalStudents += enrollments.length
          const completed = enrollments.filter((e: any) => e.completed).length
          const completion = enrollments.length ? Math.round((completed / enrollments.length) * 100) : 0
          totalCompletion += completion
          perfData.push({
            course: course.title,
            completion,
            students: enrollments.length,
          })
        }
        setStudentsCount(totalStudents)
        setCoursePerformanceData(perfData)

        // 3. Simulación de crecimiento de estudiantes (puedes ajustar según tu backend)
        setStudentProgressData([
          {
            week: "Semana 1",
            activeStudents: Math.floor(totalStudents * 0.6),
            newStudents: Math.floor(totalStudents * 0.1),
          },
          {
            week: "Semana 2",
            activeStudents: Math.floor(totalStudents * 0.7),
            newStudents: Math.floor(totalStudents * 0.15),
          },
          {
            week: "Semana 3",
            activeStudents: Math.floor(totalStudents * 0.8),
            newStudents: Math.floor(totalStudents * 0.12),
          },
          { week: "Semana 4", activeStudents: totalStudents, newStudents: Math.floor(totalStudents * 0.13) },
        ])

        // 4. Notificaciones
        const notifRes = await fetch(`${api_url}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const notifData = await notifRes.json()
        setNotifications(
          notifData.map((n: any) => ({
            id: n.id,
            type: n.notification_type,
            message: n.title,
            time: n.created_at,
            icon:
              n.notification_type === "student"
                ? Users
                : n.notification_type === "comment"
                  ? MessageSquare
                  : AlertCircle,
          })),
        )
      } catch (err) {
        setCourses([])
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const { logout } = useAuth()
  const handleLogout = () => {
    logout()
  }

  // Handlers para acciones de los cursos
  const handleEdit = (courseId: string) => {
    router.push(`/dashboard/teacher/courses/${courseId}/edit`)
  }

  const handleDuplicate = async (courseId: string) => {
    const token = localStorage.getItem("authToken")
    try {
      await fetch(`${api_url}/api/courses/${courseId}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      toast({
        title: "Curso duplicado",
        description: "El curso fue duplicado correctamente.",
        variant: "default",
      })
      // Opcional: recargar cursos
      window.location.reload()
    } catch (err) {
      toast({
        title: "Error al duplicar el curso",
        description: "No se pudo duplicar el curso.",
        variant: "destructive",
      })
    }
  }

  const handleStatistics = (courseId: string) => {
    router.push(`/dashboard/teacher/courses/${courseId}/statistics`)
  }

  const handleArchive = async (courseId: string) => {
    const token = localStorage.getItem("authToken")
    try {
      await fetch(`${api_url}/api/courses/archive/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      toast({
        title: "Curso archivado",
        description: "El curso fue archivado correctamente.",
        variant: "default",
      })
      // Opcional: recargar cursos
      window.location.reload()
    } catch (err) {
      toast({
        title: "Error al archivar el curso",
        description: "No se pudo archivar el curso.",
        variant: "destructive",
      })
    }
  }

  const handleDesarchive = async (courseId: string) => {
    const token = localStorage.getItem("authToken")
    try {
      await fetch(`${api_url}/api/courses/desarchive/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses((prev: any[]) =>
        prev.map((c) => (c.id === courseId ? { ...c, is_archived: false } : c))
      )
      toast({
        title: "Curso desarchivado",
        description: "El curso fue desarchivado correctamente.",
        variant: "default",
      })
    } catch (err) {
      toast({
        title: "Error al desarchivar el curso",
        description: "No se pudo desarchivar el curso.",
        variant: "destructive",
      })
    }
  }

  // Modifica handleDeleteCourse para no usar window.confirm
  const handleDeleteCourse = async (courseId: string) => {
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  // Nueva función para confirmar la eliminación
  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    const token = localStorage.getItem("authToken");
    try {
      const enrollRes = await fetch(`${api_url}/api/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allEnrollments = await enrollRes.json();
      const courseEnrollments = Array.isArray(allEnrollments)
        ? allEnrollments.filter((e) => String(e.course_id) === String(courseToDelete))
        : [];
      if (courseEnrollments.length > 0) {
        toast({
          title: "No se puede eliminar el curso",
          description: `Hay ${courseEnrollments.length} estudiante(s) inscrito(s). Elimina primero las inscripciones.`,
          variant: "destructive",
        });
        setDeleteError(`No se puede eliminar el curso. Hay ${courseEnrollments.length} estudiante(s) inscrito(s). Elimina primero las inscripciones.`);
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
        return;
      }
      // Si no hay inscritos, proceder a eliminar
      const res = await fetch(`${api_url}/api/courses/${courseToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        toast({
          title: "No se pudo eliminar el curso",
          description: err.message || res.statusText,
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
        return;
      }
      setCourses((prev: any[]) => prev.filter((c) => c.id !== courseToDelete));
      toast({
        title: "Curso eliminado",
        description: "El curso fue eliminado correctamente.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error al eliminar el curso",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro que quieres eliminar este curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El curso y todo su contenido serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteCourse}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!deleteError} onOpenChange={(open) => { if (!open) setDeleteError(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">No se puede eliminar el curso</DialogTitle>
            <DialogDescription>{deleteError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setDeleteError(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Panel del docente {teacherName ? teacherName : "Cargando..."}</h1>
          </div>
          <Link href="/dashboard/teacher/courses/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Crear Curso
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-md transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estudiantes Totales</p>
                  <p className="text-4xl font-bold text-primary">{studentsCount}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                   
                  </p>
                </div>
                <Users className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 hover:shadow-md transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cursos Activos</p>
                  <p className="text-4xl font-bold text-blue-600">{courses.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {courses.filter((c) => c.published).length} publicados
                  </p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50">
            <TabsTrigger value="overview">Descripción General</TabsTrigger>
            <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
            <TabsTrigger value="archived">Archivados</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Growth Chart */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Crecimiento de Estudiantes</CardTitle>
                  <CardDescription>Últimas 4 semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="activeStudents"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Course Performance Chart */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Rendimiento por Curso</CardTitle>
                  <CardDescription>Tasa de completación</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={coursePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completion" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimos eventos en tus cursos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notif) => {
                    const Icon = notif.icon
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-4 p-3 rounded-lg bg-background/50 hover:bg-background transition"
                      >
                        <div className="mt-1">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">{notif.time}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mis Cursos Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter((course) => course.published && !course.is_archived)
                .map((course) => (
                  <Card
                    key={course.id}
                    className="border-0 bg-card/50 backdrop-blur overflow-hidden hover:shadow-lg transition group flex flex-col"
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
                      <Badge className="absolute top-3 right-3 bg-green-600">
                        Activo
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                      <CardDescription className="text-xs">{course.updated_at}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-semibold">
                            {coursePerformanceData.find((c: any) => c.course === course.title)?.completion || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                coursePerformanceData.find((c: any) => c.course === course.title)?.completion || 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.students_count || 0} estudiantes</span>
                      </div>
                      <div className="flex gap-2 pt-2 flex-wrap">
                        <Link href={`/dashboard/teacher/courses/${course.id}`}>
                          <Button size="sm" variant="outline" className="w-full sm:w-auto">
                            Ver info
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => handleEdit(course.id)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => handleDeleteCourse(course.id)}>
                          Eliminar curso
                        </Button>
                        <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => handleArchive(course.id)}>
                          Archivar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Create New Course Card */}
              <Card className="border-2 border-dashed border-border bg-card/30 hover:bg-card/50 hover:border-primary transition cursor-pointer group">
                <CardContent className="h-full flex items-center justify-center">
                  <Link
                    href="/dashboard/teacher/courses/create"
                    className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center"
                  >
                    <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition" />
                    <div>
                      <p className="font-semibold mb-1">Crear Nuevo Curso</p>
                      <p className="text-sm text-muted-foreground">Comparte tu conocimiento</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Archivados Tab */}
          <TabsContent value="archived" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter((course) => course.is_archived).length === 0 ? (
                <Card className="border-2 border-dashed border-border bg-card/30 p-8 text-center">
                  <p className="text-muted-foreground">No tienes cursos archivados.</p>
                </Card>
              ) : (
                courses
                  .filter((course) => course.is_archived)
                  .map((course) => (
                    <Card
                      key={course.id}
                      className="border-0 bg-muted/40 backdrop-blur overflow-hidden hover:shadow-lg transition group flex flex-col"
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
                          className="w-full h-full object-cover group-hover:scale-105 transition grayscale"
                        />
                        <Badge className="absolute top-3 right-3 bg-gray-600">
                          Archivado
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                        <CardDescription className="text-xs">{course.updated_at}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-semibold">
                              {coursePerformanceData.find((c: any) => c.course === course.title)?.completion || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  coursePerformanceData.find((c: any) => c.course === course.title)?.completion || 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{course.students_count || 0} estudiantes</span>
                        </div>
                        <div className="flex gap-2 pt-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleDesarchive(course.id)}
                          >
                            Desarchivar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Centro de Notificaciones</CardTitle>
                <CardDescription>Todas tus notificaciones y alertas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notif) => {
                    const Icon = notif.icon
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-background/50 hover:bg-background transition border border-border/50 hover:border-border"
                      >
                        <div className="mt-1">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">{notif.time}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  )
}
