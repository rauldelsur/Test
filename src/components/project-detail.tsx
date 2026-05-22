'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, MoreHorizontal, Eye, Pencil, Trash2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { QuoteForm } from './quote-form'
import { QuoteDetail } from './quote-detail'

interface ProjectDetailProps {
  projectId: string
  onBack: () => void
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

type ViewMode = 'list' | 'create_quote' | 'edit_quote' | 'detail_quote'

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [editingQuote, setEditingQuote] = useState<any>(null)

  // Delete Quote
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteNumber, setDeleteNumber] = useState(0)

  // Status Quote
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusQuoteId, setStatusQuoteId] = useState('')
  const [newStatus, setNewStatus] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [projRes, setRes, catRes, cliRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch('/api/settings'),
        fetch('/api/categories'),
        fetch('/api/clients'),
      ])
      setProject(await projRes.json())
      setSettings(await setRes.json())
      setCategories(await catRes.json())
      setClients(await cliRes.json())
    } catch (error) {
      console.error('Error fetching project data:', error)
      toast({ title: 'Error', description: 'No se pudo cargar la obra', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [projectId, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculateQuoteTotal = (quote: any) => {
    const subtotal = quote.items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    const marginAmount = subtotal * (quote.margin / 100)
    return subtotal + marginAmount + quote.lacado
  }

  const handleCreateQuote = async (data: any) => {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: 'Presupuesto creado' })
      setViewMode('list')
      fetchData()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleUpdateQuote = async (data: any) => {
    if (!editingQuote) return
    try {
      const res = await fetch(`/api/quotes/${editingQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: 'Presupuesto actualizado' })
      setViewMode('list')
      setEditingQuote(null)
      fetchData()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleDeleteQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: 'Presupuesto eliminado' })
      fetchData()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
    setDeleteDialogOpen(false)
  }

  const handleStatusChange = async () => {
    try {
      const res = await fetch(`/api/quotes/${statusQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: 'Estado actualizado' })
      fetchData()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
    setStatusDialogOpen(false)
  }

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando detalles de la obra...</div>
      </div>
    )
  }

  if (viewMode === 'create_quote') {
    return (
      <QuoteForm
        key="create"
        categories={categories}
        clients={clients}
        onSave={handleCreateQuote}
        onCancel={() => setViewMode('list')}
        defaultMargin={settings?.defaultMargin || 35}
        defaultValidity={settings?.defaultValidity || 15}
        prefillProjectId={project.id}
      />
    )
  }

  if (viewMode === 'edit_quote' && editingQuote) {
    return (
      <QuoteForm
        key={`edit-${editingQuote.id}`}
        categories={categories}
        clients={clients}
        editingQuote={editingQuote}
        onSave={handleUpdateQuote}
        onCancel={() => { setViewMode('list'); setEditingQuote(null) }}
        defaultMargin={settings?.defaultMargin || 35}
        defaultValidity={settings?.defaultValidity || 15}
        prefillProjectId={project.id}
      />
    )
  }

  if (viewMode === 'detail_quote' && selectedQuote && settings) {
    return (
      <QuoteDetail
        quote={selectedQuote}
        settings={settings}
        onBack={() => { setViewMode('list'); setSelectedQuote(null) }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.client?.name || 'Sin cliente asignado'}
          </p>
        </div>
      </div>

      {project.description && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Quotes Header */}
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-bold">Presupuestos de la Obra</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setViewMode('create_quote')}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Presupuesto
        </Button>
      </div>

      {/* Quotes List */}
      {project.quotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay presupuestos en esta obra todavía. Crea el primero.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {project.quotes.map((quote: any) => {
            const total = calculateQuoteTotal(quote)
            return (
              <div
                key={quote.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => { setSelectedQuote(quote); setViewMode('detail_quote') }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Presupuesto #{quote.number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quote.clientName} · {new Date(quote.createdAt).toLocaleDateString('es-ES')} · {quote.items.length} líneas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold font-mono">
                    {total.toFixed(2)}€
                  </span>
                  <Badge variant={statusVariants[quote.status] || 'secondary'}>
                    {statusLabels[quote.status] || quote.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedQuote(quote); setViewMode('detail_quote') }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingQuote(quote); setViewMode('edit_quote') }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setStatusQuoteId(quote.id)
                        setNewStatus('borrador')
                        setStatusDialogOpen(true)
                      }}>
                        Marcar como Borrador
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setStatusQuoteId(quote.id)
                        setNewStatus('enviado')
                        setStatusDialogOpen(true)
                      }}>
                        Marcar como Enviado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setStatusQuoteId(quote.id)
                        setNewStatus('aprobado')
                        setStatusDialogOpen(true)
                      }}>
                        Marcar como Aprobado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setStatusQuoteId(quote.id)
                        setNewStatus('rechazado')
                        setStatusDialogOpen(true)
                      }}>
                        Marcar como Rechazado
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(quote.id)
                          setDeleteNumber(quote.number)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el presupuesto #{deleteNumber}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuote} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar Estado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Cambiar el estado del presupuesto a "{statusLabels[newStatus]}"?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleStatusChange}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
