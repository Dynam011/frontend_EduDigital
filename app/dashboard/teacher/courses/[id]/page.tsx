"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BookOpen, FileText, Layers, FileDown } from "lucide-react"
import { api_url } from "@/app/api/api"

const backendBaseUrl = "https://backend-edudigital.onrender.com"; // o tu dominio real

const TeacherCoursePage = () => {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string | undefined

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [courseResources, setCourseResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token || !courseId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        // Obtener datos del curso
        const courseRes = await fetch(`${api_url}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!courseRes.ok) {
          setCourse(null)
          setModules([])
          setCourseResources([])
          setLoading(false)
          return
        }
        const courseData = await courseRes.json()
        setCourse(courseData)

        // Obtener módulos y lecciones
        try {
          const modulesRes = await fetch(`${api_url}/api/modules/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const modulesDataRaw = modulesRes.ok ? await modulesRes.json() : []
          let modulesArray: any[] = []
          if (Array.isArray(modulesDataRaw)) {
            modulesArray = modulesDataRaw
          } else if (modulesDataRaw && Array.isArray(modulesDataRaw.modules)) {
            modulesArray = modulesDataRaw.modules
          } else if (modulesDataRaw && Array.isArray(modulesDataRaw.data)) {
            modulesArray = modulesDataRaw.data
          } else if (modulesDataRaw && typeof modulesDataRaw === "object") {
            modulesArray = Object.values(modulesDataRaw)
          }
          modulesArray = modulesArray.map((m: any) => ({ ...m, lessons: Array.isArray(m?.lessons) ? m.lessons : [] }))
          setModules(modulesArray)
        } catch {
          setModules([])
        }

        // Obtener recursos del curso
        try {
          const resourcesRes = await fetch(`${api_url}/api/courseResource/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const resourcesData = resourcesRes.ok ? await resourcesRes.json() : []
          setCourseResources(Array.isArray(resourcesData) ? resourcesData : [])
        } catch {
          setCourseResources([])
        }
      } catch {
        setCourse(null)
        setModules([])
        setCourseResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><span className="text-lg text-blue-700 animate-pulse">Cargando curso...</span></div>
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><span className="text-lg text-red-500">Curso no encontrado.</span></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/dashboard/teacher">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="ml-auto">
            <Link href={`/dashboard/teacher/courses/${courseId}/edit`}>
              <Button variant="outline">Editar Curso</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Hero Card */}
        <Card className="border-0 bg-gradient-to-r from-blue-700/80 to-blue-900/80 shadow-xl text-white mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 p-8">
            <div className="flex-shrink-0">
              <BookOpen className="w-20 h-20 text-blue-200 drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-blue-100 text-lg mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="bg-blue-400/80 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                  Categoría: {course.category}
                </span>
                <span className="bg-blue-400/80 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                  Nivel: {course.level}
                </span>
                {course.duration_hours && (
                  <span className="bg-blue-400/80 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                    Duración: {course.duration_hours}h
                  </span>
                )}
                {course.price && Number(course.price) > 0 && (
                  <span className="bg-green-400/80 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">
                    Precio: ${course.price}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Objetivos y Requisitos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="text-blue-400" />
              <CardTitle className="text-white text-lg">Objetivos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{course.objectives || <span className="italic text-slate-500">No especificados</span>}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader className="flex flex-row items-center gap-2">
              <Layers className="text-blue-400" />
              <CardTitle className="text-white text-lg">Requisitos Previos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{course.prerequisites || <span className="italic text-slate-500">Ninguno</span>}</p>
            </CardContent>
          </Card>
        </div>

        {/* Módulos y Lecciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white text-lg">Módulos</CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-slate-400">Este curso no tiene módulos aún.</p>
              ) : (
                <ul className="divide-y divide-slate-700">
                  {modules.map((module, moduleIdx) => (
                    <li key={module.id ?? module._id ?? module.title ?? moduleIdx} className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-200">{module.title || "Sin título"}</span>
                        <span className="text-xs text-slate-400">
                          {module.lessons?.length ?? 0} lección(es)
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-slate-400 text-xs mt-1">{module.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-white text-lg">Lecciones por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-slate-400">No hay lecciones porque no hay módulos.</p>
              ) : (
                <div className="space-y-6">
                  {modules.map((module, moduleIdx) => (
                    <div key={module.id ?? module._id ?? module.title ?? moduleIdx}>
                      <h4 className="font-semibold text-blue-300 mb-1">
                        {module.title || "Sin título"}
                      </h4>
                      {module.lessons?.length > 0 ? (
                        <ul className="list-disc ml-6 space-y-1">
                          {module.lessons.map((lesson: any, lessonIdx: number) => (
                            <li
                              key={lesson.id ?? lesson._id ?? lessonIdx}
                              className="text-sm text-slate-200"
                            >
                              {lesson.title || "Lección sin título"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No hay lecciones en este módulo.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recursos del Curso */}
        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <FileDown className="text-blue-400" />
            <CardTitle className="text-white text-lg">Materiales del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {courseResources.length === 0 ? (
              <p className="text-slate-400">Este curso no tiene materiales aún.</p>
            ) : (
              <ul className="space-y-2">
                {courseResources.map((r) => (
                  <li key={r.id} className="flex items-center justify-between bg-slate-700 rounded p-2">
                    <div>
                      <span className="font-semibold text-white">{r.title}</span>
                      <span className="ml-2 text-slate-400 text-xs">{r.file_type}</span>
                      {r.file_type === "link" ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 text-blue-400 underline text-xs"
                        >
                          Ver recurso
                        </a>
                      ) : (
                        <a
                          href={(() => {
                            // Si la url ya es absoluta (empieza con http), usarla tal cual
                            if (r.url && (r.url.startsWith("http://") || r.url.startsWith("https://"))) return r.url;
                            // Si ya empieza con /uploads/ usar la URL completa del backend
                            if (r.url && r.url.startsWith("/uploads/")) return `${backendBaseUrl}${r.url}`;
                            // Si el backend retorna solo el nombre de archivo, construir la ruta completa
                            if (r.file_name) return `${backendBaseUrl}/uploads/${r.file_name}`;
                            // Si la url es solo el nombre, también
                            if (r.url && !r.url.includes("/")) return `${backendBaseUrl}/uploads/${r.url}`;
                            // Fallback: extraer nombre de archivo de la url
                            return `${backendBaseUrl}/uploads/${r.url ? r.url.replace(/^.*[\\/]/, "") : ""}`;
                          })()}
                          download={r.file_name || r.title}
                          className="ml-4 text-blue-400 underline text-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Descargar
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default TeacherCoursePage
