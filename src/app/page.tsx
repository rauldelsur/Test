'use client'

import { useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar, type ActiveView } from '@/components/app-sidebar'
import { DashboardView } from '@/components/dashboard-view'
import { QuotesView } from '@/components/quotes-view'
import { ProductsView } from '@/components/products-view'
import { ClientsView } from '@/components/clients-view'
import { SettingsView } from '@/components/settings-view'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveView} />
      case 'quotes':
        return <QuotesView />
      case 'products':
        return <ProductsView />
      case 'clients':
        return <ClientsView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView onNavigate={setActiveView} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b px-4 print:hidden">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            {activeView === 'dashboard' && 'Panel'}
            {activeView === 'quotes' && 'Presupuestos'}
            {activeView === 'products' && 'Productos'}
            {activeView === 'clients' && 'Clientes'}
            {activeView === 'settings' && 'Configuración'}
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {renderView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
