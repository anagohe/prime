'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  HomeIcon, MapIcon, GlobeAltIcon, GlobeEuropeAfricaIcon, Cog6ToothIcon, UsersIcon, FolderIcon, ArrowPathIcon, CircleStackIcon,
  MagnifyingGlassIcon, FunnelIcon, BellIcon, UserCircleIcon, Bars3Icon, XMarkIcon
} from '@heroicons/react/24/outline'
import { NotificationProvider } from '@/components/Notification'

// Navegación Sidebar
const navigation = [
  { name: 'Listas', href: '/dashboard/lists', icon: GlobeEuropeAfricaIcon },
  { name: 'Directorios De Rutas', href: '/dashboard/itinerary-directories', icon: FolderIcon },
  { name: 'Itinerarios', href: '/dashboard/operations', icon: MapIcon },
  { name: 'Envío Itinerarios', href: '/dashboard/itinerary-sendouts', icon: ArrowPathIcon },
  { name: 'Filtros', href: '/dashboard/filters', icon: FunnelIcon },
  { name: 'Configuración', href: '#', icon: Cog6ToothIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">

        {/* --- SIDEBAR COMPACTO --- */}
        <aside 
          className={`fixed inset-y-0 left-0 flex flex-col bg-[#1e4079] text-white shadow-xl z-50 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-5 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-400 rounded-lg shadow-md shrink-0">
              <CircleStackIcon className="w-6 h-6 text-white" />
            </div>
            <div className={`flex flex-col overflow-hidden transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-lg font-bold leading-none tracking-tight truncate">PrimeTeam</h1>
              <span className="text-[10px] text-blue-200 font-light mt-0.5 truncate">Sistema de Gestión</span>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive ? 'bg-amber-400 text-white shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'}`} />
                  <span className={`truncate transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                      {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
          <div className={`p-3 mt-auto shrink-0 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-[#152e5a] rounded-xl p-3 shadow-inner border border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Estado</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-white">Conectado</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className={`flex flex-col flex-1 h-full min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          
          {/* --- TOP BAR --- */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-16 bg-white border-b border-gray-100 px-6 shadow-sm shrink-0 gap-4">
              
              {/* IZQUIERDA: Botón Toggle + Buscador */}
              <div className="flex flex-1 max-w-3xl items-center gap-4">
                {/* BOTÓN MAESTRO (Sandwich / X) */}
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-[#1e4079] hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center"
                  title={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                >
                  {isSidebarOpen ? (
                    <XMarkIcon className="w-7 h-7" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Bars3Icon className="w-7 h-7" />
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Menú</span>
                    </div>
                  )}
                </button>


                <div className="relative w-full max-w-xl">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Buscar tablas, campos, relaciones..." 
                      className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-400 sm:text-sm sm:leading-6 bg-white shadow-sm transition-all"
                  />
                </div>

                {/* Botón Filtro */}
                <button className="p-2.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
                  <FunnelIcon className="w-5 h-5" />
                </button>
              </div>


              {/* DERECHA: Notificaciones y Perfil */}
              <div className="flex items-center gap-4">
                
                {/* Notificaciones */}
                <button className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white"></span>
                </button>

                {/* Separador Vertical */}
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* Perfil de Usuario */}
                <div 
                  onClick={handleLogout}
                  className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors group"
                  title="Cerrar Sesión"
                >
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Usuario Admin</p>
                      <p className="text-xs text-rose-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Salir</p>
                    </div>
                    {/* Avatar Azul como en la imagen */}
                    <div className="w-9 h-9 bg-[#1e4079] rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-white">
                      <UserCircleIcon className="w-6 h-6" />
                    </div>
                </div>

              </div>
          </header>
          
          <main className="flex-1 p-6 bg-gray-50 overflow-x-hidden overflow-y-auto">
              <div className="min-h-full w-full">
                  {children}
              </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}