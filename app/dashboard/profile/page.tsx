"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Save, X } from "lucide-react"
import { api_url } from "@/app/api/api"
import { Badge } from "@/components/ui/badge"

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courseResources, setCourseResources] = useState<any[]>([])
  const [resourceTitle, setResourceTitle] = useState("")
  const [resourceUrl, setResourceUrl] = useState("")
  const [resourceType, setResourceType] = useState("")
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceError, setResourceError] = useState<string | null>(null)
  const [resourceSuccess, setResourceSuccess] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [userCourses, setUserCourses] = useState<any[]>([])
  const [resourceFile, setResourceFile] = useState<File | null>(null)
  const [resourceFileName, setResourceFileName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    const fetchProfileData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.debug("[DEBUG] Iniciando fetch de perfil", `${api_url}/api/users/profile`)
        const res = await fetch(`${api_url}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.debug("[DEBUG] Respuesta HTTP status:", res.status)
        if (!res.ok) {
          const text = await res.text();
          console.error("[DEBUG] Respuesta no OK:", text)
          throw new Error("No se pudo cargar el perfil")
        }
        const data = await res.json()
        console.debug("[DEBUG] Datos recibidos:", data)
        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "/placeholder.svg",
          phone: data.phone || "",
        })
        console.log("[DEBUG] Perfil cargado correctamente ", profileData)
      } catch (err: any) {
        console.error("[DEBUG] Error en fetchProfileData:", err)
        setError(err.message || "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev: any) => ({ ...prev, [name]: value }))
  }

  // Especialidades como lista separada por comas
  const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: any) => ({
      ...prev,
      specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      await fetch(`${api_url}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          bio: profileData.bio,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url,
        }),
      })
      setIsEditing(false)
    } catch (err) {
      console.error("Error saving profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Obtener cursos del usuario si es teacher/admin
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userType = localStorage.getItem("userType")
    if (!token || (userType !== "teacher" && userType !== "admin")) return

    const fetchCourses = async () => {
      try {
        const res = await fetch(`${api_url}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setUserCourses(data)
        if (data.length > 0) setSelectedCourseId(data[0].id.toString())
      } catch {}
    }
    fetchCourses()
  }, [])

  // Obtener recursos del curso seleccionado
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token || !selectedCourseId) return

    const fetchResources = async () => {
      setResourceLoading(true)
      setResourceError(null)
      try {
        const res = await fetch(`${api_url}/api/courseResource/course/${selectedCourseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("No se pudieron cargar los recursos")
        const data = await res.json()
        setCourseResources(data)
      } catch (err: any) {
        setResourceError(err.message || "Error al cargar recursos")
      } finally {
        setResourceLoading(false)
      }
    }
    fetchResources()
  }, [selectedCourseId])

  // Manejar selección de archivo
  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Validar tipo y tamaño (ejemplo: 10MB)
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ]
    if (!validTypes.includes(file.type)) {
      setResourceError("Solo se permiten archivos PDF, DOCX o PPTX")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setResourceError("El archivo no debe superar 10MB")
      return
    }
    setResourceFile(file)
    setResourceFileName(file.name)
    setResourceError(null)
    setResourceUrl("") // Limpiar URL manual si se sube archivo
    setResourceType(file.type)
  }

  // Agregar recurso (archivo o enlace)
  const handleAddResource = async () => {
    setResourceLoading(true)
    setResourceError(null)
    setResourceSuccess(null)
    try {
      const token = localStorage.getItem("authToken")
      if (!token || !selectedCourseId) return

      let url = resourceUrl
      let file_type = resourceType
      let title = resourceTitle

      // Si hay archivo, subir como base64
      if (resourceFile) {
        const reader = new FileReader()
        await new Promise<void>((resolve, reject) => {
          reader.onload = async (ev) => {
            const base64 = (ev.target?.result as string).split(",")[1]
            url = base64
            file_type = resourceFile.type
            resolve()
          }
          reader.onerror = reject
          reader.readAsDataURL(resourceFile)
        })
      }

      const res = await fetch(`${api_url}/api/courseResource`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: Number(selectedCourseId),
          title,
          url,
          file_type,
        }),
      })
      if (!res.ok) throw new Error("No se pudo agregar el recurso")
      setResourceTitle("")
      setResourceUrl("")
      setResourceType("")
      setResourceFile(null)
      setResourceFileName("")
      setResourceSuccess("Recurso agregado correctamente")
      // Refrescar lista
      const updated = await fetch(`${api_url}/api/courseResource/course/${selectedCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourseResources(await updated.json())
    } catch (err: any) {
      setResourceError(err.message || "Error al agregar recurso")
    } finally {
      setResourceLoading(false)
    }
  }

  // Eliminar recurso
  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("¿Eliminar este recurso?")) return
    setResourceLoading(true)
    setResourceError(null)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      const res = await fetch(`${api_url}/api/courseResource/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("No se pudo eliminar el recurso")
      setCourseResources((prev) => prev.filter((r) => r.id !== Number(id)))
    } catch (err: any) {
      setResourceError(err.message || "Error al eliminar recurso")
    } finally {
      setResourceLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <span className="text-white">Cargando perfil...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <span className="text-red-400">{error}</span>
      </div>
    )
  }

  if (!profileData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 border-0 mb-6 overflow-hidden">
          <div className="p-8 flex items-end gap-6">
            <div className="relative">
              <img
                src={profileData.avatar_url || "/placeholder.svg"}
                alt={`${profileData.first_name} ${profileData.last_name}`}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              {/* No upload button, just show avatar */}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white">
                {profileData.first_name} {profileData.last_name}
              </h1>
              <p className="text-blue-100 mt-1">{profileData.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-blue-400 text-blue-900 px-3 py-1">Verificado</Badge>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-red-600 hover:bg-red-700" : "bg-white text-blue-600 hover:bg-blue-50"}
            >
              {isEditing ? (
                <>
                  <X size={18} className="mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit2 size={18} className="mr-2" />
                  Editar Perfil
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-1 bg-slate-800">
            <TabsTrigger
              value="about"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Acerca
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6 space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Información Personal</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm">Nombre</label>
                    <Input
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 bg-slate-100 text-slate-900 border-slate-400 focus:bg-white focus:text-black disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm">Apellido</label>
                    <Input
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 bg-slate-100 text-slate-900 border-slate-400 focus:bg-white focus:text-black disabled:opacity-60"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Correo electrónico</label>
                  <Input
                    name="email"
                    value={profileData.email}
                    disabled
                    className="mt-1 bg-slate-200 text-slate-700 border-slate-400 opacity-80"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full mt-1 bg-slate-100 text-slate-900 border border-slate-400 rounded-lg p-3 focus:bg-white focus:text-black disabled:opacity-60"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Avatar (URL)</label>
                  <Input
                    name="avatar_url"
                    value={profileData.avatar_url}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 bg-slate-100 text-slate-900 border-slate-400 focus:bg-white focus:text-black disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Teléfono</label>
                  <Input
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 bg-slate-100 text-slate-900 border-slate-400 focus:bg-white focus:text-black disabled:opacity-60"
                  />
                </div>
                {isEditing && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    <Save size={18} className="mr-2" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                )}
              </div>
            </Card>

           </TabsContent>


          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-4">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-4">Configuración de Privacidad</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-slate-300">Mostrar mi perfil públicamente</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-slate-300">Recibir notificaciones por email</span>
                </label>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
