/**
 * AppLayout — Layout principal com sidebar de navegação.
 * Provê estrutura consistente para todas as páginas.
 */

import { NavLink, Outlet } from "react-router-dom";
import { BedDouble, Users, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/quartos", label: "Quartos", icon: BedDouble },
  { to: "/hospedes", label: "Hóspedes", icon: Users },
  { to: "/reservas", label: "Reservas", icon: CalendarDays },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-lg font-bold tracking-tight text-sidebar-primary">
            🏨 Hotel Manager
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
