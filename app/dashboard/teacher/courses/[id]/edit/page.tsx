"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GripVertical, Plus, Trash2, Edit2, FileDown } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { api_url } from "@/app/api/api"


export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id

  // Materiales
  const [courseResources, setCourseResources] = useState<any[]>([])
  const [materialTitle, setMaterialTitle] = useState("")
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [materialFileName, setMaterialFileName] = useState("")
  const [materialFileType, setMaterialFileType] = useState("")
  const [materialUrl, setMaterialUrl] = useState("")
  const [materialUploading, setMaterialUploading] = useState(false)
  const [materialError, setMaterialError] = useState("")

  const [modules, setModules] = useState<any[]>([])
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [prerequisites, setPrerequisites] = useState("")
  const [objectives, setObjectives] = useState("")
  const [success, setSuccess] = useState(false)

  // --- FUNCIONES DE MATERIALES ---
  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ]
    if (!validTypes.includes(file.type)) {
      setMaterialError("Solo se permiten archivos PDF, DOCX o PPTX")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setMaterialError("El archivo no debe superar 10MB")
      return
    }
    setMaterialFile(file)
    setMaterialFileName(file.name)
    setMaterialFileType(file.type)
    setMaterialError("")
    setMaterialUrl("")
  }

  const handleAddMaterial = () => {
    if (!materialTitle || (!materialFile && !materialUrl)) {
      setMaterialError("Agrega un título y un archivo o enlace")
      return
    }
    (async () => {
      if (materialFile) {
        try {
          const token = localStorage.getItem("authToken")
          if (!token) {
            setMaterialError("No autenticado")
            return
          }
          setMaterialUploading(true)
          const formData = new FormData()
          formData.append("archivo", materialFile)
          formData.append("title", materialTitle)
          const res = await fetch(`${api_url}/api/courseResource/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
          if (!res.ok) {
            const text = await res.text()
            throw new Error(text || "Error al subir el archivo")
          }
          const data = await res.json()
          // Registrar referencia en la base de datos
          await fetch(`${api_url}/api/courseResource`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              course_id: courseId,
              title: materialTitle,
              url: data.url,
              file_type: data.file_type,
            }),
          })
          setMaterialTitle("")
          setMaterialFile(null)
          setMaterialFileName("")
          setMaterialFileType("")
          setMaterialUrl("")
          setMaterialError("")
          // Refrescar lista
          const resourcesRes = await fetch(`${api_url}/api/courseResource/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const resourcesData = resourcesRes.ok ? await resourcesRes.json() : []
          setCourseResources(Array.isArray(resourcesData) ? resourcesData : [])
        } catch (err: any) {
          setMaterialError(err?.message || "Error al subir el archivo")
        } finally {
          setMaterialUploading(false)
        }
      } else {
        // Solo enlace
        try {
          const token = localStorage.getItem("authToken")
          if (!token) return
          await fetch(`${api_url}/api/courseResource`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              course_id: courseId,
              title: materialTitle,
              url: materialUrl,
              file_type: "link",
            }),
          })
          setMaterialTitle("")
          setMaterialFile(null)
          setMaterialFileName("")
          setMaterialFileType("")
          setMaterialUrl("")
          setMaterialError("")
          // Refrescar lista
          const resourcesRes = await fetch(`${api_url}/api/courseResource/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const resourcesData = resourcesRes.ok ? await resourcesRes.json() : []
          setCourseResources(Array.isArray(resourcesData) ? resourcesData : [])
        } catch (err: any) {
          setMaterialError(err?.message || "Error al agregar el enlace")
        }
      }
    })()
  }

  const handleDeleteMaterial = async (resourceId: number) => {
    const token = localStorage.getItem("authToken")
    if (!token) return
    await fetch(`${api_url}/api/courseResource/${resourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    setCourseResources(courseResources.filter((r) => r.id !== resourceId))
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token || !courseId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Obtener datos del curso
        const courseRes = await fetch(`${api_url}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const courseData = await courseRes.json()
        setCourse(courseData)
        setTitle(courseData.title || "")
        setDescription(courseData.description || "")
        setPrerequisites(courseData.prerequisites || "")
        setObjectives(courseData.objectives || "")

        // Obtener módulos del curso
        const modulesRes = await fetch(`${api_url}/api/modules/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const modulesData = await modulesRes.json()
        setModules(modulesData)
      } catch (err) {
        setCourse(null)
        setModules([])
      } finally {
        setLoading(false)
      }
    }

    // Obtener recursos del curso
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token || !courseId) return
        const resourcesRes = await fetch(`${api_url}/api/courseResource/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const resourcesData = resourcesRes.ok ? await resourcesRes.json() : []
        setCourseResources(Array.isArray(resourcesData) ? resourcesData : [])
      } catch {
        setCourseResources([])
      }
    }
    fetchData()
    fetchResources()
  }, [courseId])

  const handleSaveCourse = async () => {
    const token = localStorage.getItem("authToken")
    if (!token || !courseId) return
    await fetch(`${api_url}/api/courses/${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        prerequisites,
        objectives,
      }),
    })
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      router.push("/dashboard/teacher")
    }, 2000)
  }

  const handleAddModule = async () => {
    const token = localStorage.getItem("authToken")
    if (!token || !courseId) return
    const res = await fetch(`${api_url}/api/modules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        course_id: courseId,
        title: "Nuevo módulo",
        description: "",
        order_index: modules.length + 1,
      }),
    })
    const newModule = await res.json()
    setModules([...modules, newModule])
  }

  const handleDeleteModule = async (moduleId: number) => {
    const token = localStorage.getItem("authToken")
    if (!token) return
    await fetch(`${api_url}/api/modules/${moduleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/dashboard/teacher/courses/${courseId}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Curso
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Editar Contenido del Curso</h1>
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 text-center font-semibold transition">
            ¡Curso editado correctamente!
          </div>
        )}

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="bg-card/50">
            <TabsTrigger value="lessons">Lecciones</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Gestión de Lecciones con Drag & Drop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="p-4 bg-background/50 border border-border rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-xs text-muted-foreground">{module.lessons_count || 0} lecciones</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full bg-transparent" onClick={handleAddModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Módulo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Materiales del curso */}
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileDown className="text-blue-400" />
                <CardTitle className="text-lg">Materiales del Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Formulario para agregar material */}
                  <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <Label className="mb-3 block">PDFs y Guías de Estudio</Label>
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => document.getElementById("material-file")?.click()}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          handleMaterialFileChange({ target: { files: [file] } } as any);
                        }
                      }}
                    >
                      <input
                        id="material-file"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        className="hidden"
                        onChange={handleMaterialFileChange}
                      />
                      <span className="font-semibold">Arrastra o haz clic para subir archivo</span>
                      <span className="text-xs text-muted-foreground">PDF, DOCX, PPTX hasta 10MB</span>
                      {materialFileName && (
                        <span className="text-sm text-green-600 mt-2">✓ {materialFileName}</span>
                      )}
                    </div>
                    <div className="my-2 text-center text-slate-400">o</div>
                    <Input
                      placeholder="https://... (enlace externo)"
                      value={materialUrl}
                      onChange={(e) => {
                        setMaterialUrl(e.target.value)
                        setMaterialFile(null)
                        setMaterialFileName("")
                        setMaterialFileType("")
                      }}
                      className="bg-slate-700 border-slate-600"
                    />
                    <Label className="mt-2 block">Título del material</Label>
                    <Input
                      placeholder="Ej: Guía de estudio"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      className="bg-slate-700 border-slate-600 mt-1"
                    />
                    <Button
                      className="mt-3 bg-blue-600 hover:bg-blue-700"
                      onClick={handleAddMaterial}
                      type="button"
                      disabled={materialUploading || !materialTitle || (!materialFile && !materialUrl)}
                    >
                      {materialUploading ? "Subiendo..." : "Agregar Material"}
                    </Button>
                    {materialError && <div className="text-red-400 mt-2">{materialError}</div>}
                  </div>
                  {/* Lista de materiales */}
                  <div>
                    <h4 className="font-semibold mb-2">Materiales agregados</h4>
                    {courseResources.length === 0 ? (
                      <div className="text-slate-400">No hay materiales agregados.</div>
                    ) : (
                      <ul className="space-y-2">
                        {courseResources.map((mat, idx) => (
                          <li key={mat.id} className="flex items-center justify-between bg-slate-700 rounded p-2">
                            <div>
                              <span className="font-semibold text-white">{mat.title}</span>
                              <span className="ml-2 text-slate-400 text-xs">{mat.file_type}</span>
                              {mat.file_type === "link" ? (
                                <a
                                  href={mat.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4 text-blue-400 underline text-xs"
                                >
                                  Ver recurso
                                </a>
                              ) : (
                                <a
                                  href={mat.url.startsWith("/uploads/") ? mat.url : `/uploads/${mat.url.replace(/^.*[\\/]/, "")}`}
                                  download={mat.file_name || mat.title}
                                  className="ml-4 text-blue-400 underline text-xs"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Descargar
                                </a>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMaterial(mat.id)}
                            >
                              Eliminar
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Configuración del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Requisitos Previos</Label>
                  <Textarea
                    rows={3}
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                    placeholder="Qué necesitan saber los estudiantes antes de tomar este curso"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lo que Aprenderán</Label>
                  <Textarea
                    rows={3}
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="Lista de objetivos de aprendizaje"
                  />
                </div>

                <Button onClick={handleSaveCourse}>Guardar Cambios</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
