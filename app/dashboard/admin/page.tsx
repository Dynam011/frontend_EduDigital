"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, BookOpen, FileText, MessageCircle, Layers, ListChecks, ClipboardList } from "lucide-react";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [statsRes, coursesRes, modulesRes, lessonsRes, enrollmentsRes, quizzesRes, assignmentsRes, discussionsRes, resourcesRes] = await Promise.all([
          fetch('https://backend-edudigital.onrender.com/api/admin/stats'),
          fetch('https://backend-edudigital.onrender.com/api/courses'),
          fetch('https://backend-edudigital.onrender.com/api/modules'),
          fetch('https://backend-edudigital.onrender.com/api/lessons'),
          fetch('https://backend-edudigital.onrender.com/api/enrollments'),
          fetch('https://backend-edudigital.onrender.com/api/quizzes'),
          fetch('https://backend-edudigital.onrender.com/api/assignments'),
          fetch('https://backend-edudigital.onrender.com/api/discussions?all=1'),
          fetch('https://backend-edudigital.onrender.com/api/courseResource'),
        ]);
        setStats(await statsRes.json());
        setCourses(await coursesRes.json());
        setModules(await modulesRes.json());
        console.log(modules);
        setLessons(await lessonsRes.json());
        setEnrollments(await enrollmentsRes.json());
        setQuizzes(await quizzesRes.json());
        setAssignments(await assignmentsRes.json());
        setDiscussions(await discussionsRes.json());
        setResources(await resourcesRes.json());
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return <div className="w-full flex justify-center items-center min-h-[40vh] text-lg font-semibold animate-pulse">Cargando panel administrativo...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Cards resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md border-0 bg-gradient-to-br from-blue-100 to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-green-100 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses ?? courses.length}</div>
            <p className="text-xs text-muted-foreground">Cursos publicados</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-yellow-100 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursos Adquiridos</CardTitle>
            <BookOpen className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEnrollments ?? enrollments.length}</div>
            <p className="text-xs text-muted-foreground">Total de Cursos Adquiridos</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-purple-100 to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recursos</CardTitle>
            <FileText className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">Recursos educativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tablas y detalles */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow border-0">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-indigo-500" />Módulos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-40 overflow-y-auto text-sm">
              {modules.slice(0, 8).map((m: any) => (
                <li key={m.id} className="py-1 border-b last:border-b-0">{m.title}</li>
              ))}
              {modules.length === 0 && <li>No hay módulos.</li>}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow border-0">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4 text-pink-500" />Lecciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-40 overflow-y-auto text-sm">
              {lessons.slice(0, 8).map((l: any) => (
                <li key={l.id} className="py-1 border-b last:border-b-0">{l.title}</li>
              ))}
              {lessons.length === 0 && <li>No hay lecciones.</li>}
            </ul>
          </CardContent>
        </Card>
 
        <Card className="shadow border-0">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-500" />Asignaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-40 overflow-y-auto text-sm">
              {assignments.slice(0, 8).map((a: any) => (
                <li key={a.id} className="py-1 border-b last:border-b-0">{a.title}</li>
              ))}
              {assignments.length === 0 && <li>No hay asignaciones.</li>}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}