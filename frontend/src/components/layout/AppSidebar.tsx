import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Kanban,
  CheckSquare,
  Shield,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { canManageUsers } from "@/utils/permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Empresas", href: "/app/companies", icon: Building2 },
  { label: "Clientes", href: "/app/customers", icon: Users },
  { label: "Oportunidades", href: "/app/deals/board", icon: Kanban },
  { label: "Tareas", href: "/app/tasks", icon: CheckSquare },
];

const bottomNav: NavItem[] = [
  { label: "Usuarios", href: "/app/users", icon: Shield, adminOnly: true },
  { label: "Organización", href: "/app/settings/organization", icon: Settings, adminOnly: true },
  { label: "Mi perfil", href: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const user = useAuthStore((s) => s.user);
  const role = user?.roleName ?? "VIEWER";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "4rem" : "15rem",
    );
  }, [collapsed]);

  function isActive(href: string) {
    if (href === "/app/dashboard") {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  }

  function NavItemLink({ item }: { item: NavItem }) {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <a
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </a>
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        {!collapsed && (
          <a href="/app/dashboard" className="text-lg font-bold tracking-tight">
            GurkCRM
          </a>
        )}
        {collapsed && (
          <a href="/app/dashboard" className="mx-auto text-lg font-bold tracking-tight">
            G
          </a>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {mainNav.map((item) => (
          <NavItemLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom nav (admin + profile) */}
      <div className="border-t p-3">
        <div className="space-y-1">
          {bottomNav.map((item) => {
            if (item.adminOnly && !canManageUsers(role)) return null;
            return <NavItemLink key={item.href} item={item} />;
          })}
        </div>

        {/* Collapse toggle — desktop only */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(true)}
            className="mt-3 w-full justify-center text-muted-foreground"
          >
            <ChevronLeft className="size-4" />
            <span className="ml-2 text-xs">Colapsar</span>
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="mt-3 w-full text-muted-foreground"
            title="Expandir sidebar"
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-50 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg ring-1 ring-foreground/10 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <a href="/app/dashboard" className="text-lg font-bold tracking-tight">
              GurkCRM
            </a>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavItemLink key={item.href} item={item} />
              ))}
            </nav>
            <div className="mt-4 border-t pt-4">
              <nav className="space-y-1">
                {bottomNav.map((item) => {
                  if (item.adminOnly && !canManageUsers(role)) return null;
                  return <NavItemLink key={item.href} item={item} />;
                })}
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col bg-background ring-1 ring-foreground/10 transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
