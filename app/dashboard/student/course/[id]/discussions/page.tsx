"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, ThumbsUp, Pin } from "lucide-react"

export default function CourseDiscussions() {
  const [activeTab, setActiveTab] = useState("discussions")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedThread, setSelectedThread] = useState(null)

  const discussions = [
    {
      id: 1,
      title: "¿Cuál es la mejor forma de estructurar componentes React?",
      author: "María García",
      avatar: "/woman-avatar-1.png",
      replies: 12,
      views: 234,
      likes: 45,
      isPinned: true,
      isAnswered: true,
      timestamp: "Hace 2 horas",
      excerpt: "Estoy trabajando en un proyecto grande y necesito consejos sobre arquitectura...",
    },
    {
      id: 2,
      title: "Duda sobre el módulo 3 - Hooks avanzados",
      author: "Juan Pérez",
      avatar: "/man-avatar-1.jpg",
      replies: 8,
      views: 156,
      likes: 23,
      isPinned: false,
      isAnswered: true,
      timestamp: "Hace 4 horas",
      excerpt: "No entiendo bien cómo funciona useCallback en este contexto...",
    },
    {
      id: 3,
      title: "Proyecto final - Ideas y sugerencias",
      author: "Sofia López",
      avatar: "/woman-avatar-2.png",
      replies: 24,
      views: 489,
      likes: 67,
      isPinned: false,
      isAnswered: false,
      timestamp: "Hace 1 día",
      excerpt: "Vamos a compartir ideas para nuestros proyectos finales. ¿Qué harán ustedes?",
    },
    {
      id: 4,
      title: "Recursos recomendados fuera del curso",
      author: "Carlos Ruiz",
      avatar: "/man.jpg",
      replies: 15,
      views: 312,
      likes: 56,
      isPinned: false,
      isAnswered: false,
      timestamp: "Hace 2 días",
      excerpt: "Aquí pueden compartir blogs, libros y tutoriales que les han servido...",
    },
  ]

  const qna = [
    {
      id: 1,
      question: "¿Cómo puedo optimizar el rendimiento de mi aplicación?",
      author: "Ana Martínez",
      avatar: "/woman-avatar-1.png",
      answers: 5,
      votes: 23,
      verified: true,
      timestamp: "Hace 3 horas",
    },
    {
      id: 2,
      question: "¿Cuál es la diferencia entre useState y useReducer?",
      author: "Pedro González",
      avatar: "/man.jpg",
      answers: 3,
      votes: 18,
      verified: true,
      timestamp: "Hace 6 horas",
    },
    {
      id: 3,
      question: "¿Dónde descargo los materiales del módulo 5?",
      author: "Laura Sánchez",
      avatar: "/diverse-woman-portrait.png",
      answers: 2,
      votes: 8,
      verified: false,
      timestamp: "Hace 1 día",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Foro y Comunicación</h1>
          <p className="text-slate-400">Conecta con otros estudiantes y obtén respuestas del docente</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <Input
              placeholder="Buscar discusiones, preguntas..."
              className="pl-12 bg-slate-800 border-slate-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800">
            <TabsTrigger
              value="discussions"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Discusiones
            </TabsTrigger>
            <TabsTrigger
              value="qna"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Preguntas
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Mensajes
            </TabsTrigger>
          </TabsList>

          {/* Discusiones Tab */}
          <TabsContent value="discussions" className="space-y-4 mt-6">
            <Button className="mb-4 bg-blue-600 hover:bg-blue-700 text-white">Iniciar Nueva Discusión</Button>

            <div className="space-y-3">
              {discussions.map((discussion) => (
                <Card
                  key={discussion.id}
                  className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-all p-4 group"
                  onClick={() => setSelectedThread(discussion)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <img
                      src={discussion.avatar || "/placeholder.svg"}
                      alt={discussion.author}
                      className="w-10 h-10 rounded-full"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {discussion.isPinned && <Pin size={16} className="text-yellow-500" />}
                        {discussion.isAnswered && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Respondido</span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                        {discussion.title}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1 truncate">{discussion.excerpt}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Por {discussion.author} • {discussion.timestamp}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-slate-400 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={16} />
                        {discussion.replies}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={16} />
                        {discussion.likes}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qna" className="space-y-4 mt-6">
            <Button className="mb-4 bg-blue-600 hover:bg-blue-700 text-white">Hacer una Pregunta</Button>

            <div className="space-y-3">
              {qna.map((item) => (
                <Card
                  key={item.id}
                  className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-all p-4 group"
                >
                  <div className="flex items-start gap-4">
                    <img src={item.avatar || "/placeholder.svg"} alt={item.author} className="w-10 h-10 rounded-full" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.verified && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Verificada</span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                        {item.question}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">
                        Por {item.author} • {item.timestamp}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-slate-400 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={16} />
                        {item.answers}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={16} />
                        {item.votes}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mensajes Tab */}
          <TabsContent value="messages" className="mt-6">
            <div className="grid grid-cols-12 gap-4 h-[600px]">
              {/* Chat List */}
              <Card className="col-span-4 bg-slate-800 border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-white font-semibold">Mensajes</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 p-2">
                  {[
                    { name: "Profesor García", message: "Hola, ¿cómo va tu proyecto?", unread: 2 },
                    { name: "María López", message: "Sí, me pareció muy útil", unread: 0 },
                    { name: "Grupo Estudio", message: "Alguien libre para estudiar?", unread: 5 },
                  ].map((chat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-white font-medium text-sm">{chat.name}</p>
                        {chat.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs truncate mt-1">{chat.message}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Chat Window */}
              <Card className="col-span-8 bg-slate-800 border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-white font-semibold">Profesor García</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {[
                    { sender: "other", text: "Hola, ¿cómo va tu proyecto?", time: "10:30 AM" },
                    { sender: "me", text: "Bien, casi lo termino. Tengo una duda en el módulo 3", time: "10:35 AM" },
                    { sender: "other", text: "Perfecto, cuéntame qué es lo que no entiendes", time: "10:36 AM" },
                    { sender: "me", text: "Es sobre useCallback...", time: "10:37 AM" },
                  ].map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs ${msg.sender === "me" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"} rounded-lg p-3`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-700 flex gap-2">
                  <Input placeholder="Escribe tu mensaje..." className="bg-slate-700 border-slate-600 text-white" />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Enviar</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
