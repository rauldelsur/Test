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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Briefcase, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ActiveView } from './app-sidebar'
import { ProjectDetail } from './project-detail'

export interface Project {
  id: string
  name: string
  description: string | null
  clientId: string | null
  client: { name: string } | null
  quotes: Array<{
    id: string
    number: number
    status: string
    createdAt: string
    items: Array<{ subtotal: number }>
  }>
  createdAt: string
}

interface Client {
  id: string
  name: string
}

interface ProjectsViewProps {
  onNavigate: (view: ActiveView) => void
}

export function ProjectsView({ onNavigate }: ProjectsViewProps) {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Dialog for create/edit
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formClientId, setFormClientId] = useState<string>('none')

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      const json = await res.json()
      setProjects(json)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      const json = await res.json()
      setClients(json)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [fetchProjects, fetchClients])

  const handleSave = async () => {
    if (!formName) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' })
      return
    }

    try {
      const data = {
        name: formName,
        description: formDescription,
        clientId: formClientId === 'none' ? null : formClientId,
      }

      if (editingProject) {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        toast({ title: 'Obra actualizada' })
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        toast({ title: 'Obra creada' })
      }
      setDialogOpen(false)
      resetForm()
      fetchProjects()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/projects/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: 'Obra eliminada' })
      fetchProjects()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
    setDeleteDialogOpen(false)
  }

  const resetForm = () => {
    setEditingProject(null)
    setFormName('')
    setFormDescription('')
    setFormClientId('none')
  }

  const openEdit = (project: Project) => {
    setEditingProject(project)
    setFormName(project.name)
    setFormDescription(project.description || '')
    setFormClientId(project.clientId || 'none')
    setDialogOpen(true)
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando obras...</div>
      </div>
    )
  }

  if (viewMode === 'detail' && selectedProject) {
    return (
      <ProjectDetail
        projectId={selectedProject.id}
        onBack={() => { setViewMode('list'); setSelectedProject(null); fetchProjects() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Obras</h1>
          <p className="text-muted-foreground">{projects.length} obras registradas</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Obra
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar obra por nombre o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? 'No se encontraron obras' : 'No hay obras todavía. Crea la primera.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedProject(project); setViewMode('detail') }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.client?.name || 'Sin cliente asignado'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setViewMode('detail') }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(project) }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar Obra
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(project.id)
                          setDeleteName(project.name)
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
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">
                    {project.quotes.length} Presupuestos
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {new Date(project.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Editar Obra' : 'Nueva Obra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la obra *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Reforma piso centro"
              />
            </div>
            <div>
              <Label>Cliente</Label>
              <Select value={formClientId} onValueChange={setFormClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente específico</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción / Notas</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Detalles sobre esta obra..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
              {editingProject ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la obra &quot;{deleteName}&quot;? Esta acción no se puede deshacer. Se mantendrán los presupuestos, pero quedarán sin obra asignada (si la base de datos lo permite).
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
