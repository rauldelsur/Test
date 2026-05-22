'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Package,
  Users,
  Plus,
  TrendingUp,
  Briefcase
} from 'lucide-react'
import type { ActiveView } from './app-sidebar'

interface DashboardData {
  totalProjects: number
  totalQuotes: number
  totalProducts: number
  totalClients: number
  recentQuotes: Array<{
    id: string
    number: number
    clientName: string
    status: string
    margin: number
    lacado: number
    calculatedTotal: number
    createdAt: string
    client: { name: string } | null
  }>
  quotesByStatus: Record<string, number>
  settings: {
    companyName: string
    tagline: string
  } | null
}

const statusLabels: Record<string, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  borrador: 'secondary',
  enviado: 'outline',
  aprobado: 'default',
  rechazado: 'destructive',
}

interface DashboardViewProps {
  onNavigate: (view: ActiveView) => void
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-50 dark:border-t-transparent" />
          <p className="text-[13px] tracking-tight">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (!data) return null
  if ('error' in data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100 max-w-sm">
          <p className="font-medium mb-1">Error de conexión</p>
          <p className="text-[13px] opacity-80">{(data as any).error || 'No se pudieron cargar los datos.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Resumen General
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            {data.settings?.companyName || 'ALUMVI'} — {data.settings?.tagline || 'Gestión Integral'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => onNavigate('quotes')} className="h-9 px-4 text-[13px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <FileText className="mr-2 h-3.5 w-3.5" />
            Presupuesto
          </Button>
          <Button size="sm" onClick={() => onNavigate('projects')} className="h-9 px-4 text-[13px] bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 transition-colors shadow-sm">
            <Plus className="mr-2 h-3.5 w-3.5" />
            Nueva Obra
          </Button>
        </div>
      </div>

      {/* Bento Box Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="p-6 flex flex-col justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onNavigate('projects')}
        >
          <div className="flex items-center gap-3 text-zinc-500 mb-4">
            <Briefcase className="h-4 w-4" />
            <h3 className="text-[13px] font-medium">Obras Activas</h3>
          </div>
          <div>
            <div className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">{data.totalProjects}</div>
            <p className="text-[13px] text-zinc-500 mt-1">Ver proyectos</p>
          </div>
        </Card>

        <Card 
          className="p-6 flex flex-col justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onNavigate('clients')}
        >
          <div className="flex items-center gap-3 text-zinc-500 mb-4">
            <Users className="h-4 w-4" />
            <h3 className="text-[13px] font-medium">Cartera de Clientes</h3>
          </div>
          <div>
            <div className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">{data.totalClients}</div>
            <p className="text-[13px] text-zinc-500 mt-1">Ver clientes</p>
          </div>
        </Card>

        <Card 
          className="p-6 flex flex-col justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onNavigate('quotes')}
        >
          <div className="flex items-center gap-3 text-zinc-500 mb-4">
            <FileText className="h-4 w-4" />
            <h3 className="text-[13px] font-medium">Presupuestos</h3>
          </div>
          <div>
            <div className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">{data.totalQuotes}</div>
            <p className="text-[13px] text-zinc-500 mt-1">Ver presupuestos</p>
          </div>
        </Card>

        <Card 
          className="p-6 flex flex-col justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onNavigate('products')}
        >
          <div className="flex items-center gap-3 text-zinc-500 mb-4">
            <Package className="h-4 w-4" />
            <h3 className="text-[13px] font-medium">Catálogo</h3>
          </div>
          <div>
            <div className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">{data.totalProducts}</div>
            <p className="text-[13px] text-zinc-500 mt-1">Ver productos</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Quotes */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Presupuestos Recientes</CardTitle>
                <CardDescription>Los últimos movimientos comerciales.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('quotes')} className="text-zinc-500 text-[13px]">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {data.recentQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1">Sin presupuestos</h3>
                <p className="text-[13px] text-zinc-500 max-w-[250px] mb-4">
                  Aún no has generado ningún presupuesto en el sistema.
                </p>
                <Button onClick={() => onNavigate('quotes')} size="sm" className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 h-8 text-[13px]">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Crear el primero
                </Button>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.recentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="group flex items-center justify-between p-3 px-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer"
                    onClick={() => onNavigate('quotes')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 group-hover:shadow-md transition-shadow">
                        <FileText className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-zinc-900 dark:text-zinc-50">
                          {quote.client?.name || quote.clientName}
                        </p>
                        <p className="text-[13px] text-zinc-500">
                          #{quote.number.toString().padStart(4, '0')} · {new Date(quote.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                        {quote.calculatedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                      </span>
                      <Badge variant={statusVariants[quote.status] || 'secondary'} className="font-medium shadow-none">
                        {statusLabels[quote.status] || quote.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Catalog & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-50">Productos Activos</p>
                    <p className="text-[13px] text-zinc-500">Listos para usar</p>
                  </div>
                </div>
                <div className="text-xl font-medium tracking-tight tabular-nums">
                  {data.totalProducts}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariants[key]} className="shadow-none">{label}</Badge>
                    </div>
                    <span className="text-[14px] font-medium tabular-nums text-zinc-500">
                      {data.quotesByStatus?.[key] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
