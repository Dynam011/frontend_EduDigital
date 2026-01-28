"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Download, BookOpen, FileText, Maximize2, Minimize2, Volume2, Play, Pause } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { api_url } from "@/app/api/api"

export default function LessonPlayerPage() {
  const params = useParams()
  const courseId = params?.id
  const lessonId = params?.lessonId

  const [lesson, setLesson] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(580)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState("1x")
  const [notes, setNotes] = useState("")
  const [currentNote, setCurrentNote] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token || !lessonId || !courseId) return

    const fetchLessonData = async () => {
      setLoading(true)
      try {
        // Fetch lesson details
        const lessonRes = await fetch(`${api_url}/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const lessonData = await lessonRes.json()
        setLesson(lessonData)

        // Fetch lesson resources/attachments
        try {
          const resourcesRes = await fetch(`${api_url}/api/lessons/${lessonId}/resources`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (resourcesRes.ok) {
            const resourcesData = await resourcesRes.json()
            setResources(resourcesData)
          }
        } catch (err) {
          console.log("Resources endpoint not available")
          setResources([])
        }

        if (lessonData.duration_seconds) {
          setDuration(lessonData.duration_seconds)
        }
      } catch (err) {
        console.error("Error fetching lesson data:", err)
        setLesson(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId, courseId])

  const chapters = [
    { time: 0, title: "Introducción" },
    { time: 120, title: "Conceptos Básicos" },
    { time: 280, title: "Ejemplos Prácticos" },
    { time: 420, title: "Conclusión" },
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const addNote = () => {
    if (currentNote.trim()) {
      setNotes((prev) => prev + `\n[${formatTime(currentTime)}] ${currentNote}`)
      setCurrentNote("")
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const newTime = ((e.clientX - rect.left) / rect.width) * duration
    setCurrentTime(newTime)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando lección...</div>
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0" : ""}`}>
      {/* Header */}
      {!isFullscreen && (
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/dashboard/student">
              <Button variant="ghost" className="gap-2">
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`${isFullscreen ? "w-screen h-screen" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        <div className={`grid gap-6 ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
          {/* Video Player */}
          <div className={`${isFullscreen ? "col-span-1" : "lg:col-span-2"} space-y-4`}>
            {/* Video Container */}
            <Card className={`border-0 bg-black overflow-hidden ${isFullscreen ? "h-screen" : "h-96"}`}>
              <div
                className={`relative w-full ${isFullscreen ? "h-full" : "h-96"} bg-black flex items-center justify-center group`}
              >
                <video ref={videoRef} className="w-full h-full" style={{ background: "#000" }} />

                {/* Play Button Overlay */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group-hover:opacity-100 opacity-0"
                >
                  {!isPlaying ? (
                    <Play className="h-16 w-16 text-white fill-white" />
                  ) : (
                    <Pause className="h-16 w-16 text-white fill-white" />
                  )}
                </button>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition">
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div onClick={handleProgressClick} className="flex items-center gap-2 cursor-pointer">
                      <Progress value={(currentTime / duration) * 100} className="h-1 flex-1" />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>

                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Volume2 className="h-4 w-4" />
                        </Button>

                        <span>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(e.target.value)}
                          className="bg-white/20 text-white text-xs rounded px-2 py-1 border-0"
                        >
                          <option value="0.5x">0.5x</option>
                          <option value="1x">1x</option>
                          <option value="1.5x">1.5x</option>
                          <option value="2x">2x</option>
                        </select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="text-white hover:bg-white/20"
                        >
                          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Info */}
            {!isFullscreen && (
              <div>
                <h1 className="text-2xl font-bold mb-2">{lesson?.title || "Lección"}</h1>
                <p className="text-muted-foreground mb-4">
                  {lesson?.description || "En esta lección aprenderás nuevos conceptos."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Lección</Badge>
                  <Badge variant="outline">Principiante</Badge>
                  <Badge variant="outline">{formatTime(duration)}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {!isFullscreen && (
            <div className="lg:col-span-1 space-y-6">
              {/* Course Content */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Contenido del Curso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Cargando contenido del curso...</p>
                  </div>
                </CardContent>
              </Card>

              {/* Chapters */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base">Capítulos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {chapters.map((chapter, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentTime(chapter.time)}
                        className="w-full text-left p-2 rounded hover:bg-accent/50 transition text-sm"
                      >
                        <span className="font-medium">{chapter.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">{formatTime(chapter.time)}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Resources and Notes Tabs */}
        {!isFullscreen && (
          <div className="mt-8">
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="bg-card/50">
                <TabsTrigger value="resources">Recursos</TabsTrigger>
                <TabsTrigger value="notes">Notas Personales</TabsTrigger>
                <TabsTrigger value="transcript">Transcripción</TabsTrigger>
              </TabsList>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4">
                <div className="grid gap-3">
                  {resources.length > 0 ? (
                    resources.map((resource) => (
                      <Card key={resource.id} className="border-0 bg-card/50 backdrop-blur">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-semibold text-sm">{resource.name || resource.title}</p>
                                <p className="text-xs text-muted-foreground">{resource.type || "Recurso"}</p>
                              </div>
                            </div>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Download className="h-4 w-4" />
                                Descargar
                              </Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay recursos disponibles para esta lección.</p>
                  )}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base">Añadir Nueva Nota</CardTitle>
                    <CardDescription>Tiempo actual: {formatTime(currentTime)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Escribe tu nota aquí..."
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={addNote} className="w-full">
                      Guardar Nota
                    </Button>
                  </CardContent>
                </Card>

                {notes && (
                  <Card className="border-0 bg-card/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-base">Mis Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={notes} readOnly rows={8} className="resize-none" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Transcript Tab */}
              <TabsContent value="transcript">
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="bg-background/50 p-4 rounded space-y-3 max-h-96 overflow-y-auto text-sm leading-relaxed">
                      <p className="text-muted-foreground">{lesson?.description || "Transcripción no disponible"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
