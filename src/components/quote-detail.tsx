'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Printer } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface QuoteDetailProps {
  quote: {
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
  settings: {
    companyName: string
    tagline: string
    phone: string | null
    email: string | null
    address: string | null
  }
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

export function QuoteDetail({ quote, settings, onBack }: QuoteDetailProps) {
  const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0)
  const marginAmount = subtotal * (quote.margin / 100)
  const total = subtotal + marginAmount + quote.lacado

  const createdDate = parseISO(quote.createdAt)
  const validityDate = addDays(createdDate, quote.validityDays)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden on print */}
      <div className="print:hidden flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Presupuesto #{quote.number}
            </h1>
            <p className="text-muted-foreground">
              {quote.clientName} · {format(createdDate, "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[quote.status] || 'secondary'}>
            {statusLabels[quote.status] || quote.status}
          </Badge>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Printable Quote */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-6 sm:p-8">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-emerald-700">{settings.companyName}</h2>
              <p className="text-sm text-muted-foreground">{settings.tagline}</p>
              {(settings.phone || settings.email || settings.address) && (
                <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                  {settings.phone && <p>Tel: {settings.phone}</p>}
                  {settings.email && <p>Email: {settings.email}</p>}
                  {settings.address && <p>Dirección: {settings.address}</p>}
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold">PRESUPUESTO</h3>
              <p className="text-2xl font-bold text-emerald-700">#{quote.number}</p>
              <p className="text-sm text-muted-foreground">
                Fecha: {format(createdDate, 'dd/MM/yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                Validez: {format(validityDate, 'dd/MM/yyyy')} ({quote.validityDays} días)
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="border rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1">CLIENTE</p>
            <p className="font-semibold">{quote.clientName}</p>
            {quote.client?.phone && <p className="text-sm text-muted-foreground">Tel: {quote.client.phone}</p>}
            {quote.client?.email && <p className="text-sm text-muted-foreground">Email: {quote.client.email}</p>}
            {quote.client?.address && <p className="text-sm text-muted-foreground">Dir: {quote.client.address}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">{item.product.category.name}</div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity} {item.product.unit}</TableCell>
                    <TableCell className="text-right font-mono">{item.unitPrice.toFixed(2)}€</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{item.subtotal.toFixed(2)}€</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-mono">{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Beneficio ({quote.margin}%)</span>
                <span className="font-mono">{marginAmount.toFixed(2)}€</span>
              </div>
              {quote.lacado > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Lacado / Tratamiento</span>
                  <span className="font-mono">{quote.lacado.toFixed(2)}€</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span className="font-mono text-emerald-700">{total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground mb-1">OBSERVACIONES</p>
              <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 border-t pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Presupuesto válido hasta el {format(validityDate, "d 'de' MMMM 'de' yyyy", { locale: es })}.
              IVA no incluido. Precios sujetos a disponibilidad de stock.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
