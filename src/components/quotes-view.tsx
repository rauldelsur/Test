'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { QuoteForm } from './quote-form'
import { QuoteDetail } from './quote-detail'

interface Category {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
}

interface Quote {
  id: string
  number: number
  clientId: string | null
  clientName: string
  status: string
  lacado: number
  margin: number
  validityDays: number
  notes: string | null
  createdAt: string
  client: { name: string; phone: string | null; email: string | null; address: string | null } | null
  items: Array<{
    id: string
    productId: string
    quantity: number
    unitPrice: number
    subtotal: number
    product: { name: string; price: number; unit: string; category: { name: string } }
  }>
}

interface CompanySettings {
  companyName: string
  tagline: string
  phone: string | null
  email: string | null
  address: string | null
  defaultMargin: number
  defaultValidity: number
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

type ViewMode = 'list' | 'create' | 'edit' | 'detail'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function QuotesView() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteNumber, setDeleteNumber] = useState(0)

  // Status change
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusQuoteId, setStatusQuoteId] = useState('')
  const [newStatus, setNewStatus] = useState('')

  const { data: quotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ['quotes', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/quotes?${params.toString()}`)
      return res.json() as Promise<Quote[]>
    }
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      return res.json() as Promise<Category[]>
    }
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients')
      return res.json() as Promise<Client[]>
    }
  })

  const { data: settings = null } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      return res.json() as Promise<CompanySettings>
    }
  })

  const loading = loadingQuotes

  const calculateQuoteTotal = (quote: Quote) => {
    const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0)
    const marginAmount = subtotal * (quote.margin / 100)
    return subtotal + marginAmount + quote.lacado
  }

  const handleCreateQuote = async (data: {
    clientId: string | null
    clientName: string
    lacado: number
    margin: number
    validityDays: number
    notes: string | null
    items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>
  }) => {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      const quote = await res.json()
      toast({ title: 'Presupuesto creado', description: `Presupuesto #${quote.number} creado correctamente` })
      setViewMode('list')
      setSelectedQuote(quote)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleUpdateQuote = async (data: {
    clientId: string | null
    clientName: string
    lacado: number
    margin: number
    validityDays: number
    notes: string | null
    items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>
  }) => {
    if (!editingQuote) return

    try {
      const res = await fetch(`/api/quotes/${editingQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Presupuesto actualizado' })
      setViewMode('list')
      setEditingQuote(null)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/quotes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Presupuesto eliminado' })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
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
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Estado actualizado' })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
    setStatusDialogOpen(false)
  }

  const handleViewDetail = async (quoteId: string) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`)
      const json = await res.json()
      setSelectedQuote(json)
      setViewMode('detail')
    } catch (error) {
      console.error('Error fetching quote:', error)
    }
  }

  const filteredQuotes = quotes.filter((q) =>
    q.clientName.toLowerCase().includes(search.toLowerCase()) ||
    String(q.number).includes(search)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando presupuestos...</div>
      </div>
    )
  }

  if (viewMode === 'create') {
    return (
      <QuoteForm
        key="create"
        categories={categories}
        clients={clients}
        onSave={handleCreateQuote}
        onCancel={() => setViewMode('list')}
        defaultMargin={settings?.defaultMargin || 35}
        defaultValidity={settings?.defaultValidity || 15}
      />
    )
  }

  if (viewMode === 'edit' && editingQuote) {
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
      />
    )
  }

  if (viewMode === 'detail' && selectedQuote && settings) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground">{quotes.length} presupuestos</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setViewMode('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="aprobado">Aprobado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'No se encontraron presupuestos con esos filtros'
              : 'No hay presupuestos todavía. Crea el primero.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => {
            const total = calculateQuoteTotal(quote)
            return (
              <div
                key={quote.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetail(quote.id)}
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
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetail(quote.id) }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingQuote(quote); setViewMode('edit') }}>
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
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
            ¿Cambiar el estado del presupuesto a &quot;{statusLabels[newStatus]}&quot;?
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
