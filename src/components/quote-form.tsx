'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price: number
  unit: string
  categoryId: string
  category: { id: string; name: string }
}

interface Client {
  id: string
  name: string
}

interface QuoteFormItem {
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface QuoteFormProps {
  categories: Category[]
  clients: Client[]
  editingQuote?: {
    id: string
    clientId: string | null
    clientName: string
    status: string
    lacado: number
    margin: number
    validityDays: number
    notes: string | null
    items: Array<{
      productId: string | null
      product: { name: string; price: number; unit: string } | null
      customName: string | null
      quantity: number
      unitPrice: number
      subtotal: number
    }>
  } | null
  onSave: (data: {
    projectId?: string | null
    clientId: string | null
    clientName: string
    lacado: number
    margin: number
    validityDays: number
    notes: string | null
    items: Array<{ productId?: string | null; customName?: string | null; quantity: number; unitPrice: number; subtotal: number }>
  }) => void
  onCancel: () => void
  defaultMargin: number
  defaultValidity: number
  prefillProjectId?: string
}

export function QuoteForm({
  categories,
  clients,
  editingQuote,
  onSave,
  onCancel,
  defaultMargin,
  defaultValidity,
  prefillProjectId,
}: QuoteFormProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Form state - initialize from editingQuote if available
  const [clientId, setClientId] = useState<string>(editingQuote?.clientId || 'none')
  const [clientName, setClientName] = useState(editingQuote?.clientName || 'Cliente General')
  const [lacado, setLacado] = useState(String(editingQuote?.lacado ?? 0))
  const [margin, setMargin] = useState(String(editingQuote?.margin ?? defaultMargin))
  const [validityDays, setValidityDays] = useState(String(editingQuote?.validityDays ?? defaultValidity))
  const [notes, setNotes] = useState(editingQuote?.notes || '')
  const [items, setItems] = useState<QuoteFormItem[]>(
    editingQuote?.items.map((item) => ({
      productId: item.productId,
      productName: item.product?.name || item.customName || 'Artículo sin nombre',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })) || []
  )

  // Add product state
  const [selectedProductId, setSelectedProductId] = useState('')
  const [addQuantity, setAddQuantity] = useState('1')
  
  // Custom item state
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customQuantity, setCustomQuantity] = useState('1')

  // Form resets via key prop from parent when switching between create/edit

  // Fetch products with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        if (productCategoryFilter !== 'all') params.set('categoryId', productCategoryFilter)
        if (productSearch) params.set('search', productSearch)
        const res = await fetch(`/api/products?${params.toString()}`)
        const json = await res.json()
        setProducts(json)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [productCategoryFilter, productSearch])

  const handleClientChange = (value: string) => {
    setClientId(value)
    if (value === 'none') {
      setClientName('Cliente General')
    } else {
      const client = clients.find((c) => c.id === value)
      if (client) setClientName(client.name)
    }
  }

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast({ title: 'Error', description: 'Selecciona un producto', variant: 'destructive' })
      return
    }
    const quantity = parseFloat(addQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Error', description: 'La cantidad debe ser mayor que 0', variant: 'destructive' })
      return
    }

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    // Check if product already added
    const existingIndex = items.findIndex((i) => i.productId === selectedProductId)
    if (existingIndex >= 0) {
      const newItems = [...items]
      const newQty = newItems[existingIndex].quantity + quantity
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newQty,
        subtotal: newQty * newItems[existingIndex].unitPrice,
      }
      setItems(newItems)
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          subtotal: quantity * product.price,
        },
      ])
    }

    setSelectedProductId('')
    setProductSearch('')
    setAddQuantity('1')
  }

  const handleAddCustomItem = () => {
    if (!customName.trim()) {
      toast({ title: 'Error', description: 'Introduce un nombre para el artículo', variant: 'destructive' })
      return
    }
    const quantity = parseFloat(customQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Error', description: 'La cantidad debe ser mayor que 0', variant: 'destructive' })
      return
    }
    const price = parseFloat(customPrice)
    if (isNaN(price) || price < 0) {
      toast({ title: 'Error', description: 'El precio debe ser un número válido', variant: 'destructive' })
      return
    }

    setItems([
      ...items,
      {
        productId: null,
        productName: customName,
        quantity,
        unitPrice: price,
        subtotal: quantity * price,
      },
    ])

    setCustomName('')
    setCustomPrice('')
    setCustomQuantity('1')
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemQuantityChange = (index: number, newQuantity: string) => {
    const qty = parseFloat(newQuantity)
    if (isNaN(qty)) return
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      quantity: qty,
      subtotal: qty * newItems[index].unitPrice,
    }
    setItems(newItems)
  }

  const handleItemPriceChange = (index: number, newPrice: string) => {
    const price = parseFloat(newPrice)
    if (isNaN(price)) return
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      unitPrice: price,
      subtotal: newItems[index].quantity * price,
    }
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const marginPercent = parseFloat(margin) || 0
  const marginAmount = subtotal * (marginPercent / 100)
  const lacadoAmount = parseFloat(lacado) || 0
  const total = subtotal + marginAmount + lacadoAmount

  const handleSave = () => {
    if (items.length === 0) {
      toast({ title: 'Error', description: 'Añade al menos un producto', variant: 'destructive' })
      return
    }

    onSave({
      projectId: prefillProjectId,
      clientId: clientId === 'none' ? null : clientId,
      clientName,
      lacado: parseFloat(lacado) || 0,
      margin: parseFloat(margin) || 0,
      validityDays: parseInt(validityDays) || 15,
      notes: notes || null,
      items: items.map((item) => ({
        productId: item.productId,
        customName: item.productId ? null : item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {editingQuote ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        </h1>
        <p className="text-muted-foreground">
          {editingQuote ? 'Modifica los datos del presupuesto' : 'Completa los datos para crear un presupuesto'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Client & Options */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Seleccionar cliente</Label>
                <Select value={clientId} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Cliente General</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nombre para el presupuesto</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Opciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Margen / Beneficio (%)</Label>
                <Input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <Label>Lacado / Tratamiento (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={lacado}
                  onChange={(e) => setLacado(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <Label>Validez (días)</Label>
                <Input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-mono">{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Beneficio ({marginPercent}%)</span>
                <span className="font-mono">{marginAmount.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Lacado</span>
                <span className="font-mono">{lacadoAmount.toFixed(2)}€</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>TOTAL</span>
                <span className="font-mono text-emerald-700">{total.toFixed(2)}€</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Products & Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Añadir Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Escribe para buscar un producto (autocompletado)..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value)
                      if (selectedProductId) setSelectedProductId('')
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="pl-9 bg-white"
                  />
                  {isSearchFocused && products.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="px-3 py-2 cursor-pointer hover:bg-zinc-50 flex flex-col gap-1 border-b border-zinc-50 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault() // Previene que el input pierda el foco antes del click
                            setSelectedProductId(product.id)
                            setProductSearch(product.name)
                            setIsSearchFocused(false)
                          }}
                        >
                          <span className="text-sm font-medium text-zinc-900">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 shadow-none bg-zinc-100 text-zinc-600 font-normal">
                              Categoría: {product.category.name}
                            </Badge>
                            <span className="text-[12px] text-zinc-500 tabular-nums">
                              {product.price.toFixed(2)}€/{product.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                  <SelectTrigger className="w-44 bg-white">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedProductId} onValueChange={(val) => {
                  setSelectedProductId(val)
                  const p = products.find(prod => prod.id === val)
                  if (p) setProductSearch(p.name)
                }}>
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue placeholder="Seleccionar producto del catálogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {product.category.name}
                          </Badge>
                          {product.name} — {product.price.toFixed(2)}€/{product.unit}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(e.target.value)}
                  className="w-24 bg-white"
                  min="0.01"
                  step="0.01"
                  placeholder="Cant."
                />
                <Button 
                  className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm" 
                  onClick={handleAddProduct}
                  disabled={!selectedProductId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Catálogo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Custom Item */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Añadir Artículo Libre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Nombre o descripción del artículo..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 bg-white"
                />
                <Input
                  type="number"
                  placeholder="Precio/ud"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-24 bg-white"
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Cant."
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  className="w-20 bg-white"
                  min="0.01"
                  step="0.01"
                />
                <Button 
                  variant="outline"
                  className="shadow-sm border-zinc-200" 
                  onClick={handleAddCustomItem}
                  disabled={!customName.trim() || !customPrice}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Libre
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Líneas del Presupuesto ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Añade productos al presupuesto usando el buscador de arriba
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right w-24">Cantidad</TableHead>
                        <TableHead className="text-right w-28">Precio (€)</TableHead>
                        <TableHead className="text-right w-28">Subtotal</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-sm">
                            {item.productName}
                            {!item.productId && (
                              <Badge variant="outline" className="ml-2 text-[10px] text-zinc-500 border-zinc-200">
                                Libre
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                              className="h-8 text-right"
                              min="0.01"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemPriceChange(index, e.target.value)}
                              className="h-8 text-right"
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.subtotal.toFixed(2)}€
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
              {editingQuote ? 'Guardar Cambios' : 'Crear Presupuesto'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
