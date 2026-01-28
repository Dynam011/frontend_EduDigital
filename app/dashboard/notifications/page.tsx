"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, CheckCircle, AlertCircle, Award, Trash2, Archive, ArrowLeft } from "lucide-react"
import { api_url } from "@/app/api/api"

export default function NotificationsCenter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${api_url}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setNotifications(data || [])
      } catch (err) {
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "submission":
      case "enrollment":
        return CheckCircle
      case "comment":
      case "course":
        return MessageSquare
      case "achievement":
        return Award
      case "deadline":
        return AlertCircle
      default:
        return Bell
    }
  }

  // Acciones locales para archivar y eliminar
  const handleArchive = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    )
  }
  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Volver */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => localStorage.getItem("userType") === "student" ? router.push("/dashboard/student") : router.push("/dashboard/teacher")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Centro de Notificaciones</h1>
              <p className="text-slate-400">
                {unreadCount} notificación{unreadCount !== 1 ? "es" : ""} sin leer
              </p>
            </div>
            <Bell size={40} className="text-blue-400" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800">
            <TabsTrigger
              value="all"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Sin leer ({unreadCount})
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700"
            >
              Archivadas
            </TabsTrigger>
          </TabsList>

          {/* Todas */}
          <TabsContent value="all" className="space-y-3 mt-6">
            {loading ? (
              <div className="text-center py-8 text-slate-400">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No hay notificaciones</div>
            ) : (
              notifications
                .filter((n) => !n.archived)
                .map((notification) => {
                  const Icon = getNotificationIcon(notification.notification_type)
                  return (
                    <Card
                      key={notification.id}
                      className={`border-slate-700 p-4 cursor-pointer transition-all hover:border-blue-500 ${
                        !notification.read ? "bg-slate-700/50 border-blue-500/30" : "bg-slate-800"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Icon size={24} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold">{notification.title}</h3>
                          <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                          <p className="text-slate-500 text-xs mt-2">{notification.created_at}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200"
                            onClick={() => handleArchive(notification.id)}>
                            <Archive size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400"
                            onClick={() => handleDelete(notification.id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
            )}
          </TabsContent>

          {/* Sin leer */}
          <TabsContent value="unread" className="space-y-3 mt-6">
            {notifications
              .filter((n) => !n.read && !n.archived)
              .map((notification) => {
                const Icon = getNotificationIcon(notification.notification_type)
                return (
                  <Card
                    key={notification.id}
                    className="bg-slate-700/50 border-blue-500/30 p-4 cursor-pointer transition-all hover:border-blue-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Icon size={24} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold">{notification.title}</h3>
                        <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                        <p className="text-slate-500 text-xs mt-2">{notification.created_at}</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                )
              })}
          </TabsContent>

          {/* Archivadas */}
          <TabsContent value="archived" className="space-y-3 mt-6">
            {notifications.filter((n) => n.archived).length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <Archive size={40} className="text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No hay notificaciones archivadas</p>
              </Card>
            ) : (
              notifications
                .filter((n) => n.archived)
                .map((notification) => {
                  const Icon = getNotificationIcon(notification.notification_type)
                  return (
                    <Card
                      key={notification.id}
                      className="bg-slate-800 border-slate-700 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Icon size={24} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold">{notification.title}</h3>
                          <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                          <p className="text-slate-500 text-xs mt-2">{notification.created_at}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400"
                          onClick={() => handleDelete(notification.id)}>
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </Card>
                  )
                })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
