'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  _count?: { quotes: number }
  createdAt: string
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function ClientsView() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [search, setSearch] = useState('')

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  // View quotes
  const [quotesDialogOpen, setQuotesDialogOpen] = useState(false)
  const [selectedClientQuotes, setSelectedClientQuotes] = useState<Array<{ id: string; number: number; status: string; clientName: string }>>([])

  const { data: clients = [], isLoading: loading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients')
      return res.json() as Promise<Client[]>
    }
  })

  const handleSave = async () => {
    if (!formName) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' })
      return
    }

    try {
      if (editingClient) {
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
            email: formEmail,
            address: formAddress,
            notes: formNotes,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Cliente actualizado' })
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
            email: formEmail,
            address: formAddress,
            notes: formNotes,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Cliente creado' })
      }
      setDialogOpen(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/clients/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Cliente eliminado' })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
    setDeleteDialogOpen(false)
  }

  const handleViewQuotes = async (clientId: string) => {
    try {
      const res = await fetch(`/api/quotes?clientId=${clientId}`)
      const json = await res.json()
      setSelectedClientQuotes(json)
      setQuotesDialogOpen(true)
    } catch (error) {
      console.error('Error fetching client quotes:', error)
    }
  }

  const resetForm = () => {
    setEditingClient(null)
    setFormName('')
    setFormPhone('')
    setFormEmail('')
    setFormAddress('')
    setFormNotes('')
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setFormName(client.name)
    setFormPhone(client.phone || '')
    setFormEmail(client.email || '')
    setFormAddress(client.address || '')
    setFormNotes(client.notes || '')
    setDialogOpen(true)
  }

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">{clients.length} clientes registrados</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? 'No se encontraron clientes' : 'No hay clientes todavía. Crea el primero.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{client.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {client._count?.quotes || 0} presupuestos
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(client)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewQuotes(client.id)}>
                        Ver Presupuestos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setDeleteId(client.id)
                          setDeleteName(client.name)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
                {client.notes && (
                  <p className="text-xs mt-2 italic">{client.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="600 000 000"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
              {editingClient ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Quotes Dialog */}
      <Dialog open={quotesDialogOpen} onOpenChange={setQuotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Presupuestos del Cliente</DialogTitle>
          </DialogHeader>
          {selectedClientQuotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Este cliente no tiene presupuestos
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedClientQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Presupuesto #{q.number}</p>
                    <p className="text-xs text-muted-foreground">{q.clientName}</p>
                  </div>
                  <Badge variant={statusVariants[q.status] || 'secondary'}>
                    {statusLabels[q.status] || q.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el cliente &quot;{deleteName}&quot;? Sus presupuestos se mantendrán pero se desvincularán del cliente.
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
    </div>
  )
}
