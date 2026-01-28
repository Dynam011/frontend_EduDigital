"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit2, Trash2, MoreVertical, CheckCircle, Clock, Users } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function EvaluationsPage() {
  const [activeTab, setActiveTab] = useState("quizzes")

  const quizzes = [
    {
      id: 1,
      title: "Quiz Módulo 1: Conceptos Básicos",
      questions: 10,
      attempts: 3,
      timeLimit: 30,
      students: 45,
      avgScore: 78,
      status: "published",
    },
    {
      id: 2,
      title: "Quiz Módulo 2: Sintaxis",
      questions: 8,
      attempts: 2,
      timeLimit: 25,
      students: 38,
      avgScore: 82,
      status: "published",
    },
    {
      id: 3,
      title: "Examen Final",
      questions: 20,
      attempts: 1,
      timeLimit: 60,
      students: 0,
      avgScore: 0,
      status: "draft",
    },
  ]

  const assignments = [
    {
      id: 1,
      title: "Proyecto: Programa de Calculadora",
      dueDate: "2024-04-15",
      submissions: 38,
      graded: 28,
      status: "active",
    },
    {
      id: 2,
      title: "Tarea: Resolver 5 Ejercicios de Bucles",
      dueDate: "2024-04-08",
      submissions: 42,
      graded: 42,
      status: "closed",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/teacher/courses/1">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Curso
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Evaluaciones del Curso</h1>
            <p className="text-muted-foreground">Gestiona quizzes y asignaciones para tus estudiantes</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50">
            <TabsTrigger value="quizzes">Quiz</TabsTrigger>
            <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
            <TabsTrigger value="bank">Banco de Preguntas</TabsTrigger>
          </TabsList>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <Link href="/dashboard/teacher/courses/1/evaluations/quiz/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Crear Nuevo Quiz
              </Button>
            </Link>

            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="border-0 bg-card/50 backdrop-blur hover:shadow-md transition">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{quiz.title}</h3>
                          <Badge variant={quiz.status === "published" ? "default" : "outline"}>
                            {quiz.status === "published" ? "Publicado" : "Borrador"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {quiz.questions} preguntas
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.timeLimit} minutos
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {quiz.students} estudiantes
                          </span>
                          <span>Intentos: {quiz.attempts}</span>
                          {quiz.students > 0 && <span>Promedio: {quiz.avgScore}%</span>}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>Ver Resultados</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive gap-2">
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Link href="/dashboard/teacher/courses/1/evaluations/assignment/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Crear Asignación
              </Button>
            </Link>

            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="border-0 bg-card/50 backdrop-blur hover:shadow-md transition">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <Badge variant={assignment.status === "active" ? "default" : "outline"}>
                            {assignment.status === "active" ? "Activa" : "Cerrada"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Vencimiento: {assignment.dueDate}</span>
                          <span>{assignment.submissions} entregas</span>
                          <span>{assignment.graded} calificadas</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Entregas</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive gap-2">
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Question Bank */}
          <TabsContent value="bank" className="space-y-6">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Agregar Pregunta al Banco
            </Button>

            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Banco de Preguntas Reutilizables</CardTitle>
                <CardDescription>Preguntas que puedes usar en múltiples quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-background/50 rounded border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">
                        ¿Cuál es la sintaxis correcta para crear una lista en Python?
                      </span>
                      <Badge variant="outline">Múltiple opción</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Usado en: 2 quizzes</p>
                  </div>

                  <div className="p-3 bg-background/50 rounded border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">Explica qué es un bucle while</span>
                      <Badge variant="outline">Respuesta corta</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Usado en: 1 quiz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
