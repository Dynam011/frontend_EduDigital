"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle } from "lucide-react"

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes in seconds
  const [submitted, setSubmitted] = useState(false)

  const questions = [
    {
      id: 1,
      type: "multiple",
      text: "¿Cuál es la sintaxis correcta para crear una lista en Python?",
      options: ["lista = []", "lista = {}", "lista = ()", "lista = <>"],
      correct: 0,
    },
    {
      id: 2,
      type: "multiple",
      text: "¿Qué función se usa para obtener la longitud de una lista?",
      options: ["length()", "size()", "len()", "count()"],
      correct: 2,
    },
    {
      id: 3,
      type: "multiple",
      text: "¿Cuál es la forma correcta de crear un diccionario vacío?",
      options: ["dict = {}", "dict = []", "dict = dict()", "dict = dictionary()"],
      correct: 0,
    },
  ]

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value })
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="text-6xl font-bold text-primary">85%</div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Excelente Trabajo</h2>
                <p className="text-muted-foreground">Respondiste 3 de 3 preguntas correctamente</p>
              </div>
              <Button size="lg">Volver al Curso</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quiz: Conceptos Básicos</h1>
          <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-lg border border-border">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Tienes {questions.length} preguntas. Solo puedes enviar una vez.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>
                    Pregunta {currentQuestion + 1} de {questions.length}
                  </CardTitle>
                </div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <p className="text-lg font-semibold mb-6">{questions[currentQuestion].text}</p>

                  {questions[currentQuestion].type === "multiple" && (
                    <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswer}>
                      <div className="space-y-3">
                        {questions[currentQuestion].options.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition cursor-pointer"
                          >
                            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                            <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    disabled={currentQuestion === 0}
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  >
                    Anterior
                  </Button>

                  {currentQuestion === questions.length - 1 ? (
                    <Button onClick={handleSubmit}>Enviar Quiz</Button>
                  ) : (
                    <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>Siguiente</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card/50 backdrop-blur sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">Navegación de Preguntas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-full aspect-square rounded-lg font-semibold transition ${
                        idx === currentQuestion
                          ? "bg-primary text-primary-foreground"
                          : answers[idx]
                            ? "bg-green-600/20 text-green-600 hover:bg-green-600/30"
                            : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
