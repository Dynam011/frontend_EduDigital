"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, ImageIcon, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { api_url } from "@/app/api/api"

export default function CreateCoursePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "1",
    duration_hours: "",
    coverImage: null as File | null,
    coverImageBase64: "", // Nuevo campo para base64
    videoPromo: "",
    published: true,
    modules: [] as { title: string; description: string }[],
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    description: "",
    category: "",
    duration_hours: "",
  })
  // Materiales
  const [materials, setMaterials] = useState<{ title: string; file: File | null; fileName: string; fileType: string; url: string }[]>([])
  const [materialTitle, setMaterialTitle] = useState("")
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [materialFileName, setMaterialFileName] = useState("")
  const [materialFileType, setMaterialFileType] = useState("")
  const [materialError, setMaterialError] = useState("")
  const [materialUrl, setMaterialUrl] = useState("")
  const [materialUploading, setMaterialUploading] = useState(false)

  // Módulos dinámicos
  const handleAddModule = () => {
    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", description: "" }],
    }))
  }
  const handleModuleChange = (idx: number, field: string, value: string) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    }))
  }
  const handleRemoveModule = (idx: number) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== idx),
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCourseData((prev) => ({ ...prev, [name]: value }))

    // Validar campo individual
    if (name === "title") {
      if (!value.trim()) {
        setFieldErrors((prev) => ({ ...prev, title: "El título es requerido" }))
      } else if (value.length < 5) {
        setFieldErrors((prev) => ({ ...prev, title: "Mínimo 5 caracteres" }))
      } else if (value.length > 100) {
        setFieldErrors((prev) => ({ ...prev, title: "Máximo 100 caracteres" }))
      } else {
        setFieldErrors((prev) => ({ ...prev, title: "" }))
      }
    }

    if (name === "description") {
      if (!value.trim()) {
        setFieldErrors((prev) => ({ ...prev, description: "La descripción es requerida" }))
      } else if (value.length < 20) {
        setFieldErrors((prev) => ({ ...prev, description: "Mínimo 20 caracteres" }))
      } else if (value.length > 1000) {
        setFieldErrors((prev) => ({ ...prev, description: "Máximo 1000 caracteres" }))
      } else {
        setFieldErrors((prev) => ({ ...prev, description: "" }))
      }
    }

    if (name === "duration_hours") {
      if (value) {
        const hours = Number(value)
        if (isNaN(hours) || hours <= 0) {
          setFieldErrors((prev) => ({ ...prev, duration_hours: "Debe ser mayor a 0" }))
        } else if (hours > 500) {
          setFieldErrors((prev) => ({ ...prev, duration_hours: "Máximo 500 horas" }))
        } else {
          setFieldErrors((prev) => ({ ...prev, duration_hours: "" }))
        }
      } else {
        setFieldErrors((prev) => ({ ...prev, duration_hours: "" }))
      }
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setCourseData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPG o PNG")
      return
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB")
      return
    }

    setError("") // Limpiar error previo

    const img = new window.Image()
    const reader = new FileReader()
    reader.onload = (ev) => {
      img.src = ev.target?.result as string
      img.onload = () => {
        // Crear canvas y ajustar tamaño (ejemplo: max 800px)
        const canvas = document.createElement("canvas")
        const maxSize = 800
        let width = img.width
        let height = img.height
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height *= maxSize / width))
            width = maxSize
          } else {
            width = Math.round((width *= maxSize / height))
            height = maxSize
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        // Comprimir a calidad 0.7 (ajusta según lo que necesites)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7)
        const base64 = compressedDataUrl.split(",")[1]
        setCourseData((prev) => ({ ...prev, coverImage: file, coverImageBase64: base64 }))
      }
    }
    reader.readAsDataURL(file)
  }

  const validateFields = () => {
    const errors = {
      title: "",
      description: "",
      category: "",
      duration_hours: "",
    }

    // Validar título
    if (!courseData.title.trim()) {
      errors.title = "El título es requerido"
    } else if (courseData.title.length < 5) {
      errors.title = "El título debe tener al menos 5 caracteres"
    } else if (courseData.title.length > 100) {
      errors.title = "El título no debe exceder 100 caracteres"
    }

    // Validar descripción
    if (!courseData.description.trim()) {
      errors.description = "La descripción es requerida"
    } else if (courseData.description.length < 20) {
      errors.description = "La descripción debe tener al menos 20 caracteres"
    } else if (courseData.description.length > 1000) {
      errors.description = "La descripción no debe exceder 1000 caracteres"
    }

    // Validar categoría
    if (!courseData.category) {
      errors.category = "Selecciona una categoría"
    }

    // Validar duración
    if (courseData.duration_hours) {
      const hours = Number(courseData.duration_hours)
      if (isNaN(hours) || hours <= 0) {
        errors.duration_hours = "La duración debe ser un número mayor a 0"
      } else if (hours > 500) {
        errors.duration_hours = "La duración no debe exceder 500 horas"
      }
    }

    setFieldErrors(errors)
    return Object.values(errors).every((e) => !e)
  }

  const validateStep = () => {
    if (step === 1) {
      return validateFields()
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setSuccess("")
      setError("")
      setStep(step + 1)
    }
  }

  const handleCreateCourse = async () => {
    setError("")
    setSuccess("")
    setIsPublishing(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setError("No autenticado")
        setIsPublishing(false)
        return
      }

      // Validar campos antes de enviar
      if (!validateFields()) {
        setIsPublishing(false)
        setError("Completa todos los campos obligatorios correctamente.")
        return
      }

      // Usar base64 si existe
      let imageBase64 = courseData.coverImageBase64 || ""

      // Crear curso
      const courseRes = await fetch(`${api_url}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          duration_hours: courseData.duration_hours ? Number(courseData.duration_hours) : null,
          image_url: imageBase64,
          published: courseData.published,
        }),
      })
      const course = await courseRes.json()
      if (!course.id) throw new Error("No se pudo crear el curso")

      // Crear módulos
      for (const [idx, mod] of courseData.modules.entries()) {
        if (!mod.title.trim()) continue
        await fetch(`${api_url}/api/modules`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: Number(course.id),
            title: mod.title,
            description: mod.description,
            order_index: Number(idx + 1),
          }),
        })
      }

      // Subir materiales
      for (const mat of materials) {
        let url = mat.url
        let file_type = mat.fileType
        if (mat.file) {
          // Convertir archivo a base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (ev) => resolve((ev.target?.result as string).split(",")[1])
            reader.onerror = reject
            reader.readAsDataURL(mat.file as File)
          })
          url = base64
        }
        await fetch(`${api_url}/api/courseResource`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: Number(course.id),
            title: mat.title,
            url,
            file_type,
          }),
        })
      }

      setSuccess("¡Curso creado exitosamente! Redirigiendo...")
      setTimeout(() => {
        router.push(`/dashboard/teacher/courses/${course.id}`)
      }, 2000)
    } catch (err: any) {
      setError("Error al crear el curso. Intenta de nuevo.")
    } finally {
      setIsPublishing(false)
    }
  }

  // Manejar selección de archivo para materiales
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

  // Agregar material a la lista local
  const handleAddMaterial = () => {
    if (!materialTitle || (!materialFile && !materialUrl)) {
      setMaterialError("Agrega un título y un archivo o enlace")
      return
    }

    const addMaterialToList = (payload: { title: string; file: File | null; fileName: string; fileType: string; url: string }) => {
      setMaterials((prev) => [...prev, payload])
      setMaterialTitle("")
      setMaterialFile(null)
      setMaterialFileName("")
      setMaterialFileType("")
      setMaterialUrl("")
      setMaterialError("")
    }

    ;(async () => {
      // Si hay un archivo, intentar subirlo al backend usando FormData
      if (materialFile) {
        try {
          const token = localStorage.getItem("authToken")
          if (!token) {
            setMaterialError("No autenticado")
            return
          }
          setMaterialUploading(true)
          const formData = new FormData()
          // 'archivo' es el nombre de campo que el backend debería esperar
          formData.append("archivo", materialFile)
          formData.append("title", materialTitle)

          const res = await fetch(`${api_url}/api/courseResource`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          if (!res.ok) {
            const text = await res.text()
            throw new Error(text || "Error al subir el archivo")
          }

          const data = await res.json()
          // Esperamos que el backend retorne al menos { url, file_type, file_name }
          const url = data.url || data.file_url || ""
          const file_type = data.file_type || materialFile.type
          const file_name = data.file_name || data.fileName || materialFileName

          addMaterialToList({ title: materialTitle, file: null, fileName: file_name, fileType: file_type, url })
        } catch (err: any) {
          setMaterialError(err?.message || "Error al subir el archivo")
        } finally {
          setMaterialUploading(false)
        }
      } else {
        // Si es solo enlace
        addMaterialToList({ title: materialTitle, file: null, fileName: materialFileName, fileType: "link", url: materialUrl })
      }
    })()
  }

  // Eliminar material local
  const handleRemoveMaterial = (idx: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard/teacher/courses">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Cursos
            </Button>
          </Link>
          <div className="flex gap-2">
            <Badge variant={step >= 1 ? "default" : "outline"}>1. Básico</Badge>
            <Badge variant={step >= 2 ? "default" : "outline"}>2. Contenido</Badge>
            <Badge variant={step >= 3 ? "default" : "outline"}>3. Revisar</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Información Básica del Curso</CardTitle>
              <CardDescription>Proporciona los detalles fundamentales de tu curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Curso *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Introducción a Matematicas Basicas"
                  value={courseData.title}
                  onChange={handleInputChange}
                  required
                  className={
                    fieldErrors.title
                      ? "border-red-500"
                      : courseData.title && !fieldErrors.title
                        ? "border-green-500"
                        : ""
                  }
                />
                <div className="flex justify-between items-center">
                  {fieldErrors.title && <span className="text-xs text-red-500">{fieldErrors.title}</span>}
                  <span
                    className={`text-xs ml-auto ${courseData.title.length > 100 ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    {courseData.title.length}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe qué aprenderán los estudiantes en este curso"
                  rows={5}
                  value={courseData.description}
                  onChange={handleInputChange}
                  required
                  className={
                    fieldErrors.description
                      ? "border-red-500"
                      : courseData.description && !fieldErrors.description
                        ? "border-green-500"
                        : ""
                  }
                />
                <div className="flex justify-between items-center">
                  {fieldErrors.description && <span className="text-xs text-red-500">{fieldErrors.description}</span>}
                  <span
                    className={`text-xs ml-auto ${courseData.description.length > 1000 ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    {courseData.description.length}/1000
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={courseData.category}
                    onValueChange={(val) => {
                      handleSelectChange("category", val)
                      setFieldErrors((prev) => ({ ...prev, category: "" }))
                    }}
                  >
                    <SelectTrigger
                      id="category"
                      className={
                        fieldErrors.category ? "border-red-500" : courseData.category ? "border-green-500" : ""
                      }
                    >
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnology">Tecnologia</SelectItem>
                      <SelectItem value="math">Matematicas</SelectItem>
                      <SelectItem value="business">Lenguaje</SelectItem>
                      <SelectItem value="science">Ciencia</SelectItem>
                      <SelectItem value="languages">Idiomas</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.category && <span className="text-xs text-red-500">{fieldErrors.category}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nivel de Dificultad</Label>
                  <Select value={courseData.level} onValueChange={(val) => handleSelectChange("level", val)}>
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Año 1</SelectItem>
                      <SelectItem value="2">Año 2</SelectItem>
                      <SelectItem value="3">Año 3</SelectItem>
                      <SelectItem value="4">Año 4</SelectItem>
                      <SelectItem value="5">Año 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duración Estimada (en horas)</Label>
                  <Input
                    id="duration_hours"
                    name="duration_hours"
                    type="number"
                    placeholder="Ej: 40"
                    min="1"
                    max="500"
                    value={courseData.duration_hours}
                    onChange={handleInputChange}
                    className={
                      fieldErrors.duration_hours
                        ? "border-red-500"
                        : courseData.duration_hours && !fieldErrors.duration_hours
                          ? "border-green-500"
                          : ""
                    }
                  />
                  {fieldErrors.duration_hours && (
                    <span className="text-xs text-red-500">{fieldErrors.duration_hours}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Imagen de Portada</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                  <input id="cover" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="cover" className="cursor-pointer flex flex-col items-center gap-2">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <span className="font-semibold">Sube una imagen de portada</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</span>
                    {courseData.coverImage && (
                      <span className="text-sm text-green-600 mt-2">✓ {courseData.coverImage.name}</span>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/dashboard/teacher/courses">
                  <Button variant="outline">Cancelar</Button>
                </Link>
                <Button onClick={handleNext}>Siguiente: Contenido</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Course Content */}
        {step === 2 && (
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Estructura del Curso</CardTitle>
              <CardDescription>Organiza las lecciones y módulos de tu curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="bg-card/50">
                  <TabsTrigger value="modules">Módulos</TabsTrigger>
                  <TabsTrigger value="materials">Materiales</TabsTrigger>
                </TabsList>

                {/* Modules Tab */}
                <TabsContent value="modules" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    {courseData.modules.map((mod, idx) => (
                      <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-primary">{idx + 1}</div>
                          <div className="flex-1">
                            <Input
                              placeholder="Nombre del módulo"
                              className="mb-2"
                              value={mod.title}
                              onChange={(e) => handleModuleChange(idx, "title", e.target.value)}
                            />
                            <Textarea
                              placeholder="Descripción del módulo"
                              rows={2}
                              value={mod.description}
                              onChange={(e) => handleModuleChange(idx, "description", e.target.value)}
                            />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveModule(idx)}>
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full bg-transparent" onClick={handleAddModule}>
                    + Agregar Módulo
                  </Button>
                </TabsContent>

                {/* Multimedia Content */}
                <TabsContent value="content" className="space-y-4 mt-6">
                  {/* Aquí puedes implementar la subida de videos y otros recursos con peticiones reales si tienes endpoints */}
                  <div className="space-y-4">

                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                      <Label className="mb-3 block">Enlace de Video (YouTube/Vimeo)</Label>
                      <Input placeholder="https://www.youtube.com/watch?v=..." disabled />
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                      <Label className="mb-3 block">Transcripción / Subtítulos</Label>
                      <Textarea placeholder="Ingresa la transcripción o subtítulos en SRT" rows={4} disabled />
                    </div>
                  </div>
                </TabsContent>

                {/* Materials */}
                <TabsContent value="materials" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                      <Label className="mb-3 block">PDFs y Guías de Estudio</Label>
                      {/* Área drag & drop y clic para subir archivo */}
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
                    <div>
                      <h4 className="font-semibold mb-2">Materiales agregados</h4>
                      {materials.length === 0 ? (
                        <div className="text-slate-400">No hay materiales agregados.</div>
                      ) : (
                        <ul className="space-y-2">
                          {materials.map((mat, idx) => (
                            <li key={idx} className="flex items-center justify-between bg-slate-700 rounded p-2">
                              <div>
                                <span className="font-semibold text-white">{mat.title}</span>
                                <span className="ml-2 text-slate-400 text-xs">{mat.fileType}</span>
                                {mat.file ? (
                                  <span className="ml-4 text-green-400 text-xs">{mat.fileName}</span>
                                ) : (
                                  <a
                                    href={mat.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4 text-blue-400 underline text-xs"
                                  >
                                    Ver enlace
                                  </a>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveMaterial(idx)}
                              >
                                Eliminar
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between gap-3 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button onClick={handleNext}>Siguiente: Revisar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Revisar Curso</CardTitle>
              <CardDescription>Verifica todos los detalles antes de publicar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Course Preview */}
                <div className="md:col-span-2 space-y-4">
                  <div className="rounded-lg overflow-hidden bg-muted h-48">
                    {courseData.coverImage ? (
                      <img
                        src={URL.createObjectURL(courseData.coverImage) || "/placeholder.svg"}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{courseData.title || "Sin título"}</h3>
                    <p className="text-muted-foreground mb-4">{courseData.description || "Sin descripción"}</p>
                    <div className="flex gap-2 flex-wrap">
                      {courseData.category && <Badge>{courseData.category}</Badge>}
                      {courseData.level && <Badge variant="outline">{courseData.level}</Badge>}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <Card className="border-0 bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duración:</span>
                        <span className="font-semibold">{courseData.duration_hours || "No especificada"} horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Módulos:</span>
                        <span className="font-semibold">{courseData.modules.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button size="lg" onClick={handleCreateCourse} disabled={isPublishing}>
                  {isPublishing ? "Publicando..." : "Publicar Curso"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
