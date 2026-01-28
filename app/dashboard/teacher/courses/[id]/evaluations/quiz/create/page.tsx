"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function CreateQuizPage() {
  const [quizTitle, setQuizTitle] = useState("")
  const [timeLimit, setTimeLimit] = useState("30")
  const [attempts, setAttempts] = useState("3")
  const [questions, setQuestions] = useState([
    { id: 1, type: "multiple", text: "", options: ["", "", "", ""], correct: 0, feedback: "" },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, type: "multiple", text: "", options: ["", "", "", ""], correct: 0, feedback: "" },
    ])
  }

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/teacher/courses/1/evaluations">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Evaluaciones
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Crear Nuevo Quiz</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Settings */}
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Configuración del Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título del Quiz</Label>
                  <Input
                    placeholder="Ej: Quiz Módulo 1 - Conceptos Básicos"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tiempo Límite (minutos)</Label>
                    <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Intentos Permitidos</Label>
                    <Input type="number" value={attempts} onChange={(e) => setAttempts(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mostrar Respuestas Correctas Después de</Label>
                  <Select defaultValue="after-submit">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after-submit">Después de enviar</SelectItem>
                      <SelectItem value="after-deadline">Después del vencimiento</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Preguntas</h2>
                <Button onClick={addQuestion} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Pregunta
                </Button>
              </div>

              {questions.map((question, idx) => (
                <Card key={question.id} className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="font-semibold">Pregunta {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo de Pregunta</Label>
                        <Select value={question.type} onValueChange={(val) => updateQuestion(question.id, "type", val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple">Múltiple Opción</SelectItem>
                            <SelectItem value="truefalse">Verdadero/Falso</SelectItem>
                            <SelectItem value="short">Respuesta Corta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Texto de la Pregunta</Label>
                        <Textarea
                          placeholder="Escribe la pregunta..."
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                        />
                      </div>

                      {question.type === "multiple" && (
                        <div className="space-y-3">
                          <Label>Opciones de Respuesta</Label>
                          {question.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <Checkbox
                                checked={question.correct === optIdx}
                                onCheckedChange={() => updateQuestion(question.id, "correct", optIdx)}
                              />
                              <Input
                                placeholder={`Opción ${optIdx + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options]
                                  newOptions[optIdx] = e.target.value
                                  updateQuestion(question.id, "options", newOptions)
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Retroalimentación (Opcional)</Label>
                        <Textarea
                          placeholder="Explicación que verán los estudiantes después de responder"
                          rows={3}
                          value={question.feedback}
                          onChange={(e) => updateQuestion(question.id, "feedback", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card/50 backdrop-blur sticky top-20 space-y-4">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Preguntas</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tiempo Límite</span>
                    <span className="font-semibold">{timeLimit} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intentos</span>
                    <span className="font-semibold">{attempts}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <Button className="w-full">Guardar y Publicar</Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Guardar como Borrador
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
