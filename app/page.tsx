"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, BookOpen, BarChart3, ArrowRight, Star, Play } from "lucide-react"
import Link from "next/link"
import { ThemeToggleButton } from "@/components/theme-toggle-button"

export default function LandingPage() {
  const testimonials = [
    {
      name: "María García",
      role: "Docente de Programación",
      content:
        "Esta plataforma ha transformado cómo enseño. Mis estudiantes están más comprometidos y puedo ver exactamente dónde necesitan ayuda.",
      avatar: "/faces/face2.jpg",
    },
    {
      name: "Juan López",
      role: "Estudiante de Ingeniería",
      content:
        "El reproductor de video y las evaluaciones interactivas hacen que aprender sea mucho más efectivo. Recomiendo esta plataforma 100%.",
      avatar: "/faces/face1.jpg",
    },
    {
      name: "Laura Martínez",
      role: "Directora de Instituto",
      content: "Hemos aumentado la tasa de finalización de cursos en un 40% desde que implementamos esta solución.",
      avatar: "/faces/face6.jpg",
    },
  ]

  const plans = [
    {
      name: "Estudiante",
      price: "Gratis",
      description: "Perfecto para aprender",
      features: ["Acceso a cursos gratuitos", "Certificados básicos", "Comunidad de estudiantes", "Soporte por correo electrónico"],
      cta: "Comenzar ahora",
    },
    {
      name: "Docente",
      price: "$99",
      period: "/mes",
      description: "Para crear y monetizar cursos",
      features: [
        "Crear cursos ilimitados",
        "Herramientas avanzadas de evaluación",
        "Análisis detallados",
        "Soporte prioritario",
        "Certificados personalizados",
      ],
      cta: "Comenzar a enseñar",
      highlighted: true,
    },
    {
      name: "Institución",
      price: "Personalizado",
      description: "Para centros educativos",
      features: [
        "Usuarios ilimitados",
        "Panel administrativo",
        "Integración LMS",
        "Soporte 24/7",
        "Personalización completa",
      ],
      cta: "Contactar ventas",
    },
  ]

  const howItWorks = [
    {
      step: 1,
      title: "Regístrate como Docente o Estudiante",
      description: "Crea tu cuenta en segundos con información básica. Verifica tu email y listo.",
      icon: Users,
    },
    {
      step: 2,
      title: "Explora o Crea Contenido",
      description: "Estudiantes: explora cursos. Docentes: sube videos, materiales y crea evaluaciones.",
      icon: BookOpen,
    },
    {
      step: 3,
      title: "Aprende o Enseña Interactivamente",
      description: "Interactúa con lecciones, descarga recursos y más.",
      icon: Play,
    },
    {
      step: 4,
      title: "Obtén Conocimiento",
      description: "Completa cursos y adquiere conocimiento sin limites.",
      icon: BarChart3,
    },
  ]

  const stats = [
    { label: "50,000+", value: "Estudiantes Activos" },
    { label: "1,200+", value: "Cursos Disponibles" },
    { label: "95%", value: "Tasa de Satisfacción" },
    { label: "150+", value: "Docentes Certificados" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 flex items-center justify-between h-12 sm:h-14">
          <div className="flex items-center gap-2 mb-0">
            {/* Logo de la institución */}
            <img
              src="/logo.png"
              alt="Logo de la Institución"
              className="h-8 w-auto object-contain sm:h-10"
              style={{ maxWidth: '32vw' }}
            />
            <h3 className="font-bold text-sm sm:text-base truncate max-w-[32vw]" style={{ lineHeight: 1.1 }}>
              EduDigital
            </h3>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition">
              Características
            </a>
        
            <a href="#contact" className="text-foreground hover:text-primary transition">
              Iniciar Ya
            </a>
          </nav>
            {/* Theme Toggle Button */}
            
          
          <div className="flex gap-3">
            <ThemeToggleButton />
            <Link href="/login">
              <Button variant="outline">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
                Enseña y Aprende <span className="text-primary">sin Límites</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                La plataforma educativa completa que conecta docentes con estudiantes. Crea cursos interactivos, sube recursos y mas en un solo lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=student">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explorar Cursos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?role=teacher">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Comienza a Enseñar
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl"></div>
              <img
                src="/school.jpg"
                alt="Dashboard de la plataforma"
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, idx) => (
              <Card key={idx} className="border-0 bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{stat.label}</div>
                  <p className="text-sm text-muted-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un proceso simple y efectivo para docentes y estudiantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => {
              const IconComponent = item.icon
              return (
                <div key={item.step} className="relative">
                  <Card className="border-0 bg-background h-full hover:shadow-md transition">
                    <CardContent className="pt-8">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-3xl font-bold text-primary">{item.step}</span>
                        <span className="text-sm text-muted-foreground">paso</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                  {item.step < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 
      <section id="testimonios" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Lo que Dicen Nuestros Usuarios</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Testimonios reales de docentes y estudiantes que han transformado su educación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-0 bg-card hover:shadow-lg transition">
                <CardContent className="pt-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">{testimonial.content}</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
*/}
      {/* Planes y Precios */}
  

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comienza tu Viaje Educativo Hoy</h2>
          <p className="text-lg mb-8 opacity-90">Únete a miles de docentes y estudiantes transformando la educación</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Registrarse Ahora
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Contactar Soporte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-card/50">
    <h3 className="text-sm text-muted-foreground">© 2026 EduDigital. Todos los derechos reservados.</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/liceo.santa.rosalia" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition">
                Instagram
              </a>
          
          <a href="https://www.facebook.com/liceonacional.santarosalia.3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition">
                Facebook
              </a>
            </div>
        

      </footer>
    </div>
  )
}
