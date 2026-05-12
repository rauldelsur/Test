'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FolderPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  _count?: { products: number }
}

interface Product {
  id: string
  name: string
  price: number
  unit: string
  categoryId: string
  category: { id: string; name: string }
  createdAt: string
}

export function ProductsView() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Product dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productUnit, setProductUnit] = useState('ml')
  const [productCategoryId, setProductCategoryId] = useState('')

  // Category dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'product' | 'category'>('product')
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('categoryId', filterCategory)
      if (search) params.set('search', search)
      const res = await fetch(`/api/products?${params.toString()}`)
      const json = await res.json()
      setProducts(json)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }, [filterCategory, search])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const json = await res.json()
      setCategories(json)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false))
  }, [fetchProducts, fetchCategories])

  const handleSaveProduct = async () => {
    if (!productName || !productPrice || !productCategoryId) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'destructive' })
      return
    }

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productName,
            price: parseFloat(productPrice),
            unit: productUnit,
            categoryId: productCategoryId,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Producto actualizado' })
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productName,
            price: parseFloat(productPrice),
            unit: productUnit,
            categoryId: productCategoryId,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Producto creado' })
      }
      setProductDialogOpen(false)
      resetProductForm()
      fetchProducts()
      fetchCategories()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryName) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' })
      return
    }

    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Categoría actualizada' })
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryName }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Categoría creada' })
      }
      setCategoryDialogOpen(false)
      resetCategoryForm()
      fetchCategories()
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      if (deleteType === 'product') {
        const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Producto eliminado' })
        fetchProducts()
      } else {
        const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error)
        }
        toast({ title: 'Categoría eliminada' })
        fetchCategories()
      }
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    }
    setDeleteDialogOpen(false)
  }

  const resetProductForm = () => {
    setEditingProduct(null)
    setProductName('')
    setProductPrice('')
    setProductUnit('ml')
    setProductCategoryId('')
  }

  const resetCategoryForm = () => {
    setEditingCategory(null)
    setCategoryName('')
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductName(product.name)
    setProductPrice(String(product.price))
    setProductUnit(product.unit)
    setProductCategoryId(product.categoryId)
    setProductDialogOpen(true)
  }

  const openDeleteConfirm = (type: 'product' | 'category', id: string, name: string) => {
    setDeleteType(type)
    setDeleteId(id)
    setDeleteName(name)
    setDeleteDialogOpen(true)
  }

  const categoryColorMap: Record<string, string> = {
    'Inoxidable': 'bg-slate-100 text-slate-800',
    'Hierro': 'bg-orange-100 text-orange-800',
    'Inoxidable 316': 'bg-emerald-100 text-emerald-800',
    'Galvanizado': 'bg-zinc-100 text-zinc-800',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">{products.length} productos en catálogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { resetCategoryForm(); setCategoryDialogOpen(true) }}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Categoría
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { resetProductForm(); setProductDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className={categoryColorMap[cat.name] || 'bg-muted'}
                >
                  {cat.name} ({cat._count?.products || 0})
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => {
                    setEditingCategory(cat)
                    setCategoryName(cat.name)
                    setCategoryDialogOpen(true)
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive"
                  onClick={() => openDeleteConfirm('category', cat.id, cat.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio (€/ml)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={categoryColorMap[product.category.name] || 'bg-muted'}
                        >
                          {product.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {product.price.toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditProduct(product)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteConfirm('product', product.id, product.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="TUBO 40 X 40"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Select value={productUnit} onValueChange={setProductUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml (metro lineal)</SelectItem>
                    <SelectItem value="ud">ud (unidad)</SelectItem>
                    <SelectItem value="m2">m² (metro cuadrado)</SelectItem>
                    <SelectItem value="kg">kg (kilogramo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveProduct}>
              {editingProduct ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nombre</Label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveCategory}>
              {editingCategory ? 'Guardar' : 'Crear'}
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
              ¿Estás seguro de que quieres eliminar &quot;{deleteName}&quot;? Esta acción no se puede deshacer.
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
