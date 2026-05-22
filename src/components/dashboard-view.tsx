'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Package,
  Users,
  Plus,
  TrendingUp,
  Eye,
  Briefcase,
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando panel...</div>
      </div>
    )
  }

  if (!data) return null
  if ('error' in data) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive border rounded-lg m-4">
        <div className="text-center">
          <p className="font-bold text-lg mb-2">Error de conexión</p>
          <p className="text-sm">{(data as any).error || 'No se pudieron cargar los datos.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          {data.settings?.companyName || 'ALUMVI'} — {data.settings?.tagline || 'Sistema de Gestión'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obras</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProjects}</div>
            <p className="text-xs text-muted-foreground">registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              {data.quotesByStatus?.aprobado || 0} aprobados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-muted-foreground">en catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClients}</div>
            <p className="text-xs text-muted-foreground">registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Aprobación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalQuotes > 0
                ? Math.round(((data.quotesByStatus?.aprobado || 0) / data.totalQuotes) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.quotesByStatus?.aprobado || 0} de {data.totalQuotes}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => onNavigate('projects')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Obra
        </Button>
        <Button variant="outline" onClick={() => onNavigate('quotes')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Presupuesto
        </Button>
        <Button variant="outline" onClick={() => onNavigate('products')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
        <Button variant="outline" onClick={() => onNavigate('clients')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentQuotes.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No hay presupuestos todavía. Crea el primero.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Presupuesto #{quote.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quote.client?.name || quote.clientName} ·{' '}
                        {new Date(quote.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {quote.calculatedTotal.toFixed(2)}€
                    </span>
                    <Badge variant={statusVariants[quote.status] || 'secondary'}>
                      {statusLabels[quote.status] || quote.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.totalQuotes > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => onNavigate('quotes')}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver todos los presupuestos
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold">
                  {data.quotesByStatus?.[key] || 0}
                </div>
                <Badge variant={statusVariants[key]} className="mt-1">
                  {label}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
