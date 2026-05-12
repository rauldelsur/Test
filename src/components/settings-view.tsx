'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface CompanySettings {
  id: string
  companyName: string
  tagline: string
  phone: string | null
  email: string | null
  address: string | null
  defaultMargin: number
  defaultValidity: number
  nextQuoteNumber: number
}

export function SettingsView() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [tagline, setTagline] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [defaultMargin, setDefaultMargin] = useState('35')
  const [defaultValidity, setDefaultValidity] = useState('15')
  const [nextQuoteNumber, setNextQuoteNumber] = useState('1001')

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const json = await res.json()
      setSettings(json)
      setCompanyName(json.companyName)
      setTagline(json.tagline)
      setPhone(json.phone || '')
      setEmail(json.email || '')
      setAddress(json.address || '')
      setDefaultMargin(String(json.defaultMargin))
      setDefaultValidity(String(json.defaultValidity))
      setNextQuoteNumber(String(json.nextQuoteNumber))
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          tagline,
          phone,
          email,
          address,
          defaultMargin: parseFloat(defaultMargin),
          defaultValidity: parseInt(defaultValidity),
          nextQuoteNumber: parseInt(nextQuoteNumber),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      const json = await res.json()
      setSettings(json)
      toast({ title: 'Configuración guardada' })
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Ajustes de la empresa y del sistema</p>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nombre de la Empresa</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ALUMVI"
              />
            </div>
            <div>
              <Label>Eslogan</Label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Fabricación de Estructuras, Inoxidable y Cerramientos"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Teléfono</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="600 000 000"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@alumvi.com"
              />
            </div>
          </div>
          <div>
            <Label>Dirección</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle Principal 123, Ciudad"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Valores por Defecto de Presupuestos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Margen por defecto (%)</Label>
              <Input
                type="number"
                value={defaultMargin}
                onChange={(e) => setDefaultMargin(e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label>Validez por defecto (días)</Label>
              <Input
                type="number"
                value={defaultValidity}
                onChange={(e) => setDefaultValidity(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label>Próximo nº de presupuesto</Label>
              <Input
                type="number"
                value={nextQuoteNumber}
                onChange={(e) => setNextQuoteNumber(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            El número de presupuesto se incrementa automáticamente al crear cada nuevo presupuesto.
            Solo modifica este valor si necesitas corregir la numeración.
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-2">
            <h2 className="text-xl font-bold">{companyName || 'ALUMVI'}</h2>
            <p className="text-sm text-muted-foreground">{tagline}</p>
            {(phone || email || address) && (
              <div className="text-xs text-muted-foreground space-y-0.5 pt-2">
                {phone && <p>Tel: {phone}</p>}
                {email && <p>Email: {email}</p>}
                {address && <p>Dir: {address}</p>}
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Margen: {defaultMargin}% · Validez: {defaultValidity} días · Próx. Nº: {nextQuoteNumber}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 min-w-32"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}
