'use client'

import { signOut } from 'next-auth/react'

import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  Factory,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'

export type ActiveView = 'dashboard' | 'projects' | 'quotes' | 'products' | 'clients' | 'settings'

const navItems = [
  { id: 'dashboard' as ActiveView, label: 'Panel', icon: LayoutDashboard },
  { id: 'projects' as ActiveView, label: 'Obras', icon: FileText },
  { id: 'quotes' as ActiveView, label: 'Presupuestos', icon: FileText },
  { id: 'products' as ActiveView, label: 'Productos', icon: Package },
  { id: 'clients' as ActiveView, label: 'Clientes', icon: Users },
  { id: 'settings' as ActiveView, label: 'Configuración', icon: Settings },
]

interface AppSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Factory className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wide text-sidebar-foreground">ALUMVI PRO</span>
            <span className="text-[10px] text-sidebar-foreground/60">Sistema de Gestión</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => onViewChange(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: '/login' })}
              tooltip="Cerrar Sesión"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2 mt-2">
          <p className="text-[10px] text-sidebar-foreground/50">
            © 2025 ALUMVI · Gestión Interna
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
