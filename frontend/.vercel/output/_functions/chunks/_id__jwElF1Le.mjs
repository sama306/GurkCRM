import { t as __exportAll } from "./compiler_D5GlFh-L.mjs";
import { C as renderComponent, E as renderTemplate, M as createAstro, N as createComponent, T as renderSlot, k as renderHead, w as Fragment$2 } from "./fetch-state_Q5u-_skv.mjs";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import axios from "axios";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, Briefcase, Building2, CheckSquare, ChevronLeft, ChevronRight, CircleCheckIcon, ExternalLink, Globe, InfoIcon, Kanban, LayoutDashboard, Loader2, Loader2Icon, LogOut, Mail, MapPin, Menu, OctagonXIcon, Pencil, Phone, Plus, Settings, Shield, Trash2, TriangleAlertIcon, User, UserPlus, Users, X, XIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import { Dialog, DropdownMenu, Label, Separator, Slot } from "radix-ui";
import { useTheme } from "next-themes";
import { Toaster, toast } from "sonner";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
var apiClient = axios.create({
	baseURL: "http://localhost:4000/api/v1",
	withCredentials: true,
	headers: { "Content-Type": "application/json" }
});
var _accessToken = null;
var _onRefreshFail = null;
function setApiToken(token) {
	_accessToken = token;
}
function onApiRefreshFail(cb) {
	_onRefreshFail = cb;
}
apiClient.interceptors.request.use((config) => {
	if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
	return config;
});
var _isRefreshing = false;
var _failedQueue = [];
function processQueue(error, token) {
	_failedQueue.forEach((item) => {
		if (error) item.reject(error);
		else item.resolve(token);
	});
	_failedQueue = [];
}
async function attemptRefresh() {
	const newToken = (await apiClient.post("/auth/refresh")).data.accessToken;
	setApiToken(newToken);
	return newToken;
}
apiClient.interceptors.response.use((response) => {
	if (response.data && typeof response.data === "object" && "success" in response.data && "data" in response.data) if ("meta" in response.data) response.data = {
		data: response.data.data,
		meta: response.data.meta
	};
	else response.data = response.data.data;
	return response;
});
apiClient.interceptors.response.use((response) => response, async (error) => {
	const originalRequest = error.config;
	if (!originalRequest || error.response?.status !== 401) return Promise.reject(error);
	const url = originalRequest.url || "";
	if (url.includes("/auth/refresh") || url.includes("/auth/login")) return Promise.reject(error);
	if (_isRefreshing) return new Promise((resolve, reject) => {
		_failedQueue.push({
			resolve,
			reject
		});
	}).then((token) => {
		originalRequest.headers.Authorization = `Bearer ${token}`;
		return apiClient(originalRequest);
	}).catch((err) => Promise.reject(err));
	_isRefreshing = true;
	originalRequest._retry = true;
	try {
		const newToken = await attemptRefresh();
		processQueue(null, newToken);
		originalRequest.headers.Authorization = `Bearer ${newToken}`;
		return apiClient(originalRequest);
	} catch (refreshError) {
		processQueue(refreshError, null);
		setApiToken(null);
		_onRefreshFail?.();
		return Promise.reject(refreshError);
	} finally {
		_isRefreshing = false;
	}
});
//#endregion
//#region src/services/auth.service.ts
var authService = {
	register(data) {
		return apiClient.post("/auth/register", data);
	},
	login(data) {
		return apiClient.post("/auth/login", data);
	},
	refresh() {
		return apiClient.post("/auth/refresh");
	},
	logout() {
		return apiClient.post("/auth/logout");
	},
	forgotPassword(data) {
		return apiClient.post("/auth/forgot-password", data);
	},
	resetPassword(data) {
		return apiClient.post("/auth/reset-password", data);
	},
	getMe() {
		return apiClient.get("/auth/me");
	}
};
//#endregion
//#region src/stores/auth.store.ts
var useAuthStore = create((set, get) => {
	onApiRefreshFail(() => {
		set({
			user: null,
			accessToken: null,
			isAuthenticated: false
		});
	});
	return {
		user: null,
		accessToken: null,
		isAuthenticated: false,
		isLoading: true,
		setAuth: (user, accessToken) => {
			setApiToken(accessToken);
			set({
				user,
				accessToken,
				isAuthenticated: true
			});
		},
		clearAuth: () => {
			setApiToken(null);
			set({
				user: null,
				accessToken: null,
				isAuthenticated: false
			});
		},
		initializeAuth: async () => {
			set({ isLoading: true });
			try {
				const accessToken = (await authService.refresh()).data.accessToken;
				setApiToken(accessToken);
				const user = (await authService.getMe()).data;
				set({
					user,
					accessToken,
					isAuthenticated: true,
					isLoading: false
				});
			} catch {
				setApiToken(null);
				set({
					user: null,
					accessToken: null,
					isAuthenticated: false,
					isLoading: false
				});
			}
		}
	};
});
//#endregion
//#region src/components/providers/AppProvider.tsx
function AppProvider({ children }) {
	const initializeAuth = useAuthStore((s) => s.initializeAuth);
	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);
	return /* @__PURE__ */ jsx(Fragment$1, { children });
}
//#endregion
//#region src/components/auth/AuthGuard.tsx
function AuthGuard({ children }) {
	const isLoading = useAuthStore((s) => s.isLoading);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	useEffect(() => {
		if (!isLoading && !isAuthenticated) window.location.href = "/login";
	}, [isLoading, isAuthenticated]);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-dvh items-center justify-center",
		children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin text-muted-foreground" })
	});
	if (!isAuthenticated) return null;
	return /* @__PURE__ */ jsx(Fragment$1, { children });
}
//#endregion
//#region src/utils/permissions.ts
var ROLES = [
	"VIEWER",
	"SALES",
	"ADMIN",
	"OWNER"
];
function roleAtLeast(userRole, minimum) {
	return ROLES.indexOf(userRole) >= ROLES.indexOf(minimum);
}
/**
* Companies / Customers / Contacts / Deals: Sales+ puede crear y editar,
* Admin+ puede eliminar, Viewer solo lectura.
*/
function canCreate(role) {
	return roleAtLeast(role, "SALES");
}
function canEdit(role) {
	return roleAtLeast(role, "SALES");
}
function canDelete(role) {
	return roleAtLeast(role, "ADMIN");
}
function canExport(role) {
	return roleAtLeast(role, "SALES");
}
function canManageUsers(role) {
	return role === "ADMIN" || role === "OWNER";
}
/**
* Hook que expone los permisos del usuario autenticado.
* Reutilizable en cualquier componente de módulo comercial.
*/
function usePermissions() {
	const role = useAuthStore((s) => s.user)?.roleName ?? "VIEWER";
	return {
		role,
		canCreate: canCreate(role),
		canEdit: canEdit(role),
		canDelete: canDelete(role),
		canExport: canExport(role)
	};
}
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/80",
			outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
			ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
			destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
			lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			icon: "size-8",
			"icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
			"icon-lg": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot.Root : "button", {
		"data-slot": "button",
		"data-variant": variant,
		"data-size": size,
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region src/components/layout/AppSidebar.tsx
var mainNav = [
	{
		label: "Dashboard",
		href: "/app/dashboard",
		icon: LayoutDashboard
	},
	{
		label: "Empresas",
		href: "/app/companies",
		icon: Building2
	},
	{
		label: "Clientes",
		href: "/app/customers",
		icon: Users
	},
	{
		label: "Oportunidades",
		href: "/app/deals/board",
		icon: Kanban
	},
	{
		label: "Tareas",
		href: "/app/tasks",
		icon: CheckSquare
	}
];
var bottomNav = [
	{
		label: "Usuarios",
		href: "/app/users",
		icon: Shield,
		adminOnly: true
	},
	{
		label: "Organización",
		href: "/app/settings/organization",
		icon: Settings,
		adminOnly: true
	},
	{
		label: "Mi perfil",
		href: "/app/settings",
		icon: Settings
	}
];
function AppSidebar() {
	const role = useAuthStore((s) => s.user)?.roleName ?? "VIEWER";
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [currentPath, setCurrentPath] = useState("");
	useEffect(() => {
		setCurrentPath(window.location.pathname);
	}, []);
	useEffect(() => {
		document.documentElement.style.setProperty("--sidebar-width", collapsed ? "4rem" : "15rem");
	}, [collapsed]);
	function isActive(href) {
		if (href === "/app/dashboard") return currentPath === href;
		return currentPath.startsWith(href);
	}
	function NavItemLink({ item }) {
		const active = isActive(item.href);
		const Icon = item.icon;
		return /* @__PURE__ */ jsxs("a", {
			href: item.href,
			onClick: () => setMobileOpen(false),
			className: cn("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed && "justify-center px-2 gap-0"),
			title: collapsed ? item.label : void 0,
			children: [/* @__PURE__ */ jsx(Icon, { className: "size-5 shrink-0" }), !collapsed && /* @__PURE__ */ jsx("span", { children: item.label })]
		});
	}
	const sidebarContent = /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-14 items-center gap-2 border-b border-sidebar-border px-4",
				children: [!collapsed && /* @__PURE__ */ jsx("a", {
					href: "/app/dashboard",
					className: "text-lg font-bold tracking-tight text-sidebar-foreground",
					children: "GurkCRM"
				}), collapsed && /* @__PURE__ */ jsx("a", {
					href: "/app/dashboard",
					className: "mx-auto text-lg font-bold tracking-tight text-sidebar-foreground",
					children: "G"
				})]
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "flex-1 space-y-0.5 overflow-y-auto p-2",
				children: mainNav.map((item) => /* @__PURE__ */ jsx(NavItemLink, { item }, item.href))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "border-t border-sidebar-border p-2",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "space-y-0.5",
						children: bottomNav.map((item) => {
							if (item.adminOnly && !canManageUsers(role)) return null;
							return /* @__PURE__ */ jsx(NavItemLink, { item }, item.href);
						})
					}),
					!collapsed && /* @__PURE__ */ jsxs(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setCollapsed(true),
						className: "mt-2 w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground",
						children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
							className: "ml-2 text-xs",
							children: "Colapsar"
						})]
					}),
					collapsed && /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => setCollapsed(false),
						className: "mt-2 w-full text-sidebar-foreground/50 hover:text-sidebar-foreground",
						title: "Expandir sidebar",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })
					})
				]
			})
		]
	});
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("button", {
			onClick: () => setMobileOpen(true),
			className: "fixed left-4 top-3 z-50 flex size-8 items-center justify-center rounded-lg text-foreground/50 hover:bg-muted md:hidden",
			"aria-label": "Abrir menú",
			children: /* @__PURE__ */ jsx(Menu, { className: "size-5" })
		}),
		mobileOpen && /* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 z-40 bg-black/50 md:hidden",
			onClick: () => setMobileOpen(false)
		}),
		/* @__PURE__ */ jsx("aside", {
			className: cn("fixed inset-y-0 left-0 z-50 w-64 bg-sidebar ring-1 ring-sidebar-border transition-transform duration-200 ease-out md:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full"),
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex h-full flex-col",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex h-14 items-center justify-between border-b border-sidebar-border px-4",
					children: [/* @__PURE__ */ jsx("a", {
						href: "/app/dashboard",
						className: "text-lg font-bold tracking-tight text-sidebar-foreground",
						children: "GurkCRM"
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => setMobileOpen(false),
						className: "flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground",
						"aria-label": "Cerrar menú",
						children: /* @__PURE__ */ jsx(X, { className: "size-5" })
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex-1 overflow-y-auto p-2",
					children: [/* @__PURE__ */ jsx("nav", {
						className: "space-y-0.5",
						children: mainNav.map((item) => /* @__PURE__ */ jsx(NavItemLink, { item }, item.href))
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-3 border-t border-sidebar-border pt-3",
						children: /* @__PURE__ */ jsx("nav", {
							className: "space-y-0.5",
							children: bottomNav.map((item) => {
								if (item.adminOnly && !canManageUsers(role)) return null;
								return /* @__PURE__ */ jsx(NavItemLink, { item }, item.href);
							})
						})
					})]
				})]
			})
		}),
		/* @__PURE__ */ jsx("aside", {
			className: cn("fixed inset-y-0 left-0 z-30 hidden flex-col bg-sidebar ring-1 ring-sidebar-border transition-all duration-200 ease-out md:flex", collapsed ? "w-16" : "w-60"),
			children: sidebarContent
		})
	] });
}
//#endregion
//#region src/components/ui/dropdown-menu.tsx
function DropdownMenu$1({ ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenu.Root, {
		"data-slot": "dropdown-menu",
		...props
	});
}
function DropdownMenuTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenu.Trigger, {
		"data-slot": "dropdown-menu-trigger",
		...props
	});
}
function DropdownMenuContent({ className, align = "start", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenu.Portal, { children: /* @__PURE__ */ jsx(DropdownMenu.Content, {
		"data-slot": "dropdown-menu-content",
		sideOffset,
		align,
		className: cn("z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
		...props
	}) });
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenu.Item, {
		"data-slot": "dropdown-menu-item",
		"data-inset": inset,
		"data-variant": variant,
		className: cn("group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive", className),
		...props
	});
}
function DropdownMenuLabel({ className, inset, ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenu.Label, {
		"data-slot": "dropdown-menu-label",
		"data-inset": inset,
		className: cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenu.Separator, {
		"data-slot": "dropdown-menu-separator",
		className: cn("-mx-1 my-1 h-px bg-border", className),
		...props
	});
}
//#endregion
//#region src/components/layout/UserMenu.tsx
function UserMenu() {
	const user = useAuthStore((s) => s.user);
	const clearAuth = useAuthStore((s) => s.clearAuth);
	const handleLogout = useCallback(async () => {
		try {
			await authService.logout();
		} catch {}
		clearAuth();
		window.location.href = "/login";
	}, [clearAuth]);
	return /* @__PURE__ */ jsxs(DropdownMenu$1, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs(Button, {
			variant: "ghost",
			size: "sm",
			className: "gap-2",
			children: [/* @__PURE__ */ jsx(User, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
				className: "max-w-32 truncate text-sm",
				children: user?.fullName ?? "Usuario"
			})]
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-48",
		children: [
			/* @__PURE__ */ jsx(DropdownMenuLabel, {
				className: "font-normal",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-0.5",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-sm font-medium",
						children: user?.fullName
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-muted-foreground",
						children: user?.email
					})]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs("a", {
					href: "/app/settings",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Settings, { className: "size-4" }), "Mi perfil"]
				})
			}),
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				variant: "destructive",
				onClick: handleLogout,
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(LogOut, { className: "size-4" }), "Cerrar sesión"]
			})
		]
	})] });
}
//#endregion
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	const { theme = "system" } = useTheme();
	return /* @__PURE__ */ jsx(Toaster, {
		theme,
		className: "toaster group",
		icons: {
			success: /* @__PURE__ */ jsx(CircleCheckIcon, { className: "size-4" }),
			info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
			warning: /* @__PURE__ */ jsx(TriangleAlertIcon, { className: "size-4" }),
			error: /* @__PURE__ */ jsx(OctagonXIcon, { className: "size-4" }),
			loading: /* @__PURE__ */ jsx(Loader2Icon, { className: "size-4 animate-spin" })
		},
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)",
			"--border-radius": "var(--radius)"
		},
		toastOptions: { classNames: { toast: "cn-toast" } },
		...props
	});
};
//#endregion
//#region src/layouts/AppLayout.astro
var $$AppLayout = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${renderSlot($$result, $$slots["head"])}${renderHead($$result)}</head><body>${renderComponent($$result, "AppProvider", AppProvider, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/providers/AppProvider",
		"client:component-export": "AppProvider"
	})}<!-- Sidebar (mobile + desktop) -->${renderComponent($$result, "AppSidebar", AppSidebar, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/AppSidebar",
		"client:component-export": "AppSidebar"
	})}<!-- Top bar: solo usuario a la derecha; margin reactivo al sidebar --><header class="fixed right-0 top-0 z-20 flex h-14 items-center justify-end border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm transition-[left] duration-200 ease-out md:px-6" style="left: var(--sidebar-width, 15rem)">${renderComponent($$result, "UserMenu", UserMenu, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/layout/UserMenu",
		"client:component-export": "UserMenu"
	})}</header><!-- Main content; margin reactivo al sidebar -->${renderComponent($$result, "AuthGuard", AuthGuard, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "@/components/auth/AuthGuard",
		"client:component-export": "AuthGuard"
	}, { "default": ($$result) => renderTemplate`<main class="min-h-dvh pt-14 transition-[margin-left] duration-200 ease-out" style="margin-left: var(--sidebar-width, 15rem)"><div class="p-6">${renderSlot($$result, $$slots["default"])}</div></main>` })}${renderComponent($$result, "Toaster", Toaster$1, {
		"client:visible": true,
		"client:component-hydration": "visible",
		"client:component-path": "@/components/ui/sonner",
		"client:component-export": "Toaster"
	})}</body></html>`;
}, "D:/Astro/GurkCRM/frontend/src/layouts/AppLayout.astro", void 0);
//#endregion
//#region src/components/ui/card.tsx
function Card({ className, size = "default", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card",
		"data-size": size,
		className: cn("group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-header",
		className: cn("group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-title",
		className: cn("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-content",
		className: cn("px-(--card-spacing)", className),
		...props
	});
}
//#endregion
//#region src/components/ui/badge.tsx
var badgeVariants = cva("group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!", {
	variants: { variant: {
		default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
		secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
		destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
		outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
		ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
		link: "text-primary underline-offset-4 hover:underline"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant = "default", asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot.Root : "span", {
		"data-slot": "badge",
		"data-variant": variant,
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
//#region src/components/ui/separator.tsx
function Separator$1({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ jsx(Separator.Root, {
		"data-slot": "separator",
		decorative,
		orientation,
		className: cn("shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch", className),
		...props
	});
}
//#endregion
//#region src/components/ui/dialog.tsx
function Dialog$1({ ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Root, {
		"data-slot": "dialog",
		...props
	});
}
function DialogPortal({ ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Portal, {
		"data-slot": "dialog-portal",
		...props
	});
}
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Overlay, {
		"data-slot": "dialog-overlay",
		className: cn("fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0", className),
		...props
	});
}
function DialogContent({ className, children, showCloseButton = true, ...props }) {
	return /* @__PURE__ */ jsxs(DialogPortal, { children: [/* @__PURE__ */ jsx(DialogOverlay, {}), /* @__PURE__ */ jsxs(Dialog.Content, {
		"data-slot": "dialog-content",
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ jsx(Dialog.Close, {
			"data-slot": "dialog-close",
			asChild: true,
			children: /* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				className: "absolute top-2 right-2",
				size: "icon-sm",
				children: [/* @__PURE__ */ jsx(XIcon, {}), /* @__PURE__ */ jsx("span", {
					className: "sr-only",
					children: "Close"
				})]
			})
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dialog-header",
		className: cn("flex flex-col gap-2", className),
		...props
	});
}
function DialogFooter({ className, showCloseButton = false, children, ...props }) {
	return /* @__PURE__ */ jsxs("div", {
		"data-slot": "dialog-footer",
		className: cn("-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ jsx(Dialog.Close, {
			asChild: true,
			children: /* @__PURE__ */ jsx(Button, {
				variant: "outline",
				children: "Close"
			})
		})]
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Title, {
		"data-slot": "dialog-title",
		className: cn("font-heading text-base leading-none font-medium", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Description, {
		"data-slot": "dialog-description",
		className: cn("text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className),
		...props
	});
}
//#endregion
//#region src/lib/query-client.ts
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 1e3 * 60 * 5,
	retry: 1,
	refetchOnWindowFocus: false
} } });
//#endregion
//#region src/components/providers/QueryProvider.tsx
function QueryProvider({ children }) {
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children
	});
}
//#endregion
//#region src/services/companies.service.ts
var companiesService = {
	getCompanies(filters) {
		return apiClient.get("/companies", { params: filters }).then((res) => res.data);
	},
	getCompanyById(id) {
		return apiClient.get(`/companies/${id}`).then((res) => res.data);
	},
	createCompany(data) {
		return apiClient.post("/companies", data).then((res) => res.data);
	},
	updateCompany(id, data) {
		return apiClient.patch(`/companies/${id}`, data).then((res) => res.data);
	},
	deleteCompany(id) {
		return apiClient.delete(`/companies/${id}`).then((res) => res.data);
	}
};
//#endregion
//#region src/features/companies/hooks/useCompanies.ts
function useCompany(id) {
	return useQuery({
		queryKey: ["companies", id],
		queryFn: () => companiesService.getCompanyById(id),
		enabled: !!id
	});
}
//#endregion
//#region src/services/contacts.service.ts
var contactsService = {
	getContactsByCompany(companyId) {
		return apiClient.get(`/companies/${companyId}/contacts`).then((res) => res.data);
	},
	createContact(companyId, data) {
		return apiClient.post(`/companies/${companyId}/contacts`, data).then((res) => res.data);
	},
	updateContact(id, data) {
		return apiClient.patch(`/contacts/${id}`, data).then((res) => res.data);
	},
	deleteContact(id) {
		return apiClient.delete(`/contacts/${id}`).then((res) => res.data);
	}
};
//#endregion
//#region src/features/contacts/hooks/useContacts.ts
function getErrorMessage(error) {
	return error.response?.data?.error?.message ?? "Ocurrió un error inesperado";
}
function useContactsByCompany(companyId) {
	return useQuery({
		queryKey: [
			"contacts",
			"byCompany",
			companyId
		],
		queryFn: () => contactsService.getContactsByCompany(companyId),
		enabled: !!companyId
	});
}
function useCreateContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ companyId, data }) => contactsService.createContact(companyId, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: [
				"contacts",
				"byCompany",
				variables.companyId
			] });
			toast.success("Contacto creado correctamente");
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		}
	});
}
function useUpdateContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data, companyId }) => contactsService.updateContact(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: [
				"contacts",
				"byCompany",
				variables.companyId
			] });
			toast.success("Contacto actualizado correctamente");
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		}
	});
}
function useDeleteContact() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, companyId }) => contactsService.deleteContact(id),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: [
				"contacts",
				"byCompany",
				variables.companyId
			] });
			toast.success("Contacto eliminado correctamente");
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		}
	});
}
//#endregion
//#region src/features/contacts/components/ContactsList.tsx
function ContactsList({ companyId, onEdit, onDelete, onAddClick, canEdit, canDelete, canCreate }) {
	const { data: contacts, isLoading, isError } = useContactsByCompany(companyId);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "space-y-3",
		children: [
			1,
			2,
			3
		].map((i) => /* @__PURE__ */ jsx("div", { className: "h-20 animate-pulse rounded-xl bg-muted" }, i))
	});
	if (isError) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-muted-foreground",
		children: "Error al cargar los contactos."
	});
	if (!contacts || contacts.length === 0) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center",
		children: [
			/* @__PURE__ */ jsx(UserPlus, { className: "size-8 text-muted-foreground/40" }),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Esta empresa todavía no tiene contactos registrados"
			}),
			canCreate && /* @__PURE__ */ jsxs(Button, {
				onClick: onAddClick,
				variant: "outline",
				className: "mt-3",
				size: "sm",
				children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), "Agregar contacto"]
			})
		]
	});
	return /* @__PURE__ */ jsx("div", {
		className: "space-y-3",
		children: contacts.map((contact) => /* @__PURE__ */ jsx(Card, {
			className: "shadow-sm",
			children: /* @__PURE__ */ jsxs(CardContent, {
				className: "flex items-center justify-between gap-4 p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 space-y-1.5",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate font-medium",
						children: contact.fullName
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground",
						children: [
							contact.position && /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ jsx(Briefcase, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: contact.position
								})]
							}),
							contact.email && /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ jsx(Mail, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: contact.email
								})]
							}),
							contact.phone && /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ jsx(Phone, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: contact.phone })]
							})
						]
					})]
				}), (canEdit || canDelete) && /* @__PURE__ */ jsxs("div", {
					className: "flex shrink-0 items-center gap-1",
					children: [canEdit && /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => onEdit(contact),
						title: "Editar contacto",
						children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" })
					}), canDelete && /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => onDelete(contact),
						title: "Eliminar contacto",
						children: /* @__PURE__ */ jsx(Trash2, { className: "size-4 text-destructive" })
					})]
				})]
			})
		}, contact.id))
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ jsx("input", {
		type,
		"data-slot": "input",
		className: cn("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Label$1({ className, ...props }) {
	return /* @__PURE__ */ jsx(Label.Root, {
		"data-slot": "label",
		className: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
//#region src/components/ui/field.tsx
function FieldGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "field-group",
		className: cn("group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4", className),
		...props
	});
}
var fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
	variants: { orientation: {
		vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
		horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
		responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
	} },
	defaultVariants: { orientation: "vertical" }
});
function Field({ className, orientation = "vertical", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		role: "group",
		"data-slot": "field",
		"data-orientation": orientation,
		className: cn(fieldVariants({ orientation }), className),
		...props
	});
}
function FieldContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "field-content",
		className: cn("group/field-content flex flex-1 flex-col gap-0.5 leading-snug", className),
		...props
	});
}
function FieldLabel({ className, ...props }) {
	return /* @__PURE__ */ jsx(Label$1, {
		"data-slot": "field-label",
		className: cn("group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col", className),
		...props
	});
}
function FieldError({ className, children, errors, ...props }) {
	const content = useMemo(() => {
		if (children) return children;
		if (!errors?.length) return null;
		const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];
		if (uniqueErrors?.length == 1) return uniqueErrors[0]?.message;
		return /* @__PURE__ */ jsx("ul", {
			className: "ml-4 flex list-disc flex-col gap-1",
			children: uniqueErrors.map((error, index) => error?.message && /* @__PURE__ */ jsx("li", { children: error.message }, index))
		});
	}, [children, errors]);
	if (!content) return null;
	return /* @__PURE__ */ jsx("div", {
		role: "alert",
		"data-slot": "field-error",
		className: cn("text-sm font-normal text-destructive", className),
		...props,
		children: content
	});
}
//#endregion
//#region src/features/contacts/schemas/contact.schema.ts
var createContactSchema = z.object({
	fullName: z.string().min(1, "El nombre completo es requerido").max(200),
	position: z.string().max(200).optional(),
	email: z.string().email("Debe ser un email válido").max(200).optional(),
	phone: z.string().max(50).optional(),
	socialLinks: z.array(z.object({
		platform: z.string().max(50),
		url: z.string().url("Debe ser una URL válida")
	})).optional()
});
var updateContactSchema = z.object({
	fullName: z.string().min(1, "El nombre completo no puede estar vacío").max(200).optional(),
	position: z.string().max(200).optional(),
	email: z.string().email("Debe ser un email válido").max(200).optional(),
	phone: z.string().max(50).optional(),
	socialLinks: z.array(z.object({
		platform: z.string().max(50),
		url: z.string().url("Debe ser una URL válida")
	})).optional()
}).refine((data) => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo para actualizar" });
//#endregion
//#region src/features/contacts/components/ContactFormDialog.tsx
function ContactFormDialog({ open, onClose, companyId, contact }) {
	const isEdit = !!contact;
	const createMutation = useCreateContact();
	const updateMutation = useUpdateContact();
	const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
		resolver: zodResolver(isEdit ? updateContactSchema : createContactSchema),
		defaultValues: {
			fullName: "",
			position: "",
			email: "",
			phone: ""
		}
	});
	useEffect(() => {
		if (open) if (contact) reset({
			fullName: contact.fullName,
			position: contact.position ?? "",
			email: contact.email ?? "",
			phone: contact.phone ?? ""
		});
		else reset({
			fullName: "",
			position: "",
			email: "",
			phone: ""
		});
	}, [
		open,
		contact,
		reset
	]);
	const isLoading = (isEdit ? updateMutation : createMutation).isPending || isSubmitting;
	function cleanPayload(data) {
		const payload = { ...data };
		for (const key of [
			"position",
			"email",
			"phone"
		]) if (!payload[key]) delete payload[key];
		return payload;
	}
	async function onSubmit(data) {
		try {
			const payload = cleanPayload(data);
			if (isEdit && contact) await updateMutation.mutateAsync({
				id: contact.id,
				data: payload,
				companyId
			});
			else await createMutation.mutateAsync({
				companyId,
				data: payload
			});
			onClose();
		} catch {}
	}
	return /* @__PURE__ */ jsx(Dialog$1, {
		open,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: isEdit ? "Editar contacto" : "Nuevo contacto" }), /* @__PURE__ */ jsx(DialogDescription, { children: isEdit ? "Actualizá los datos del contacto." : "Completá los datos para agregar un nuevo contacto." })] }), /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit(onSubmit),
				children: [/* @__PURE__ */ jsxs(FieldGroup, { children: [
					/* @__PURE__ */ jsxs(Field, { children: [/* @__PURE__ */ jsx(FieldLabel, { children: /* @__PURE__ */ jsx(Label$1, {
						htmlFor: "fullName",
						children: "Nombre completo *"
					}) }), /* @__PURE__ */ jsxs(FieldContent, { children: [/* @__PURE__ */ jsx(Input, {
						id: "fullName",
						placeholder: "Nombre y apellido",
						...register("fullName"),
						"aria-invalid": !!errors.fullName
					}), /* @__PURE__ */ jsx(FieldError, { errors: [errors.fullName] })] })] }),
					/* @__PURE__ */ jsxs(Field, { children: [/* @__PURE__ */ jsx(FieldLabel, { children: /* @__PURE__ */ jsx(Label$1, {
						htmlFor: "position",
						children: "Cargo"
					}) }), /* @__PURE__ */ jsxs(FieldContent, { children: [/* @__PURE__ */ jsx(Input, {
						id: "position",
						placeholder: "Ej: CEO, CTO...",
						...register("position"),
						"aria-invalid": !!errors.position
					}), /* @__PURE__ */ jsx(FieldError, { errors: [errors.position] })] })] }),
					/* @__PURE__ */ jsxs(Field, { children: [/* @__PURE__ */ jsx(FieldLabel, { children: /* @__PURE__ */ jsx(Label$1, {
						htmlFor: "email",
						children: "Email"
					}) }), /* @__PURE__ */ jsxs(FieldContent, { children: [/* @__PURE__ */ jsx(Input, {
						id: "email",
						type: "email",
						placeholder: "correo@ejemplo.com",
						...register("email"),
						"aria-invalid": !!errors.email
					}), /* @__PURE__ */ jsx(FieldError, { errors: [errors.email] })] })] }),
					/* @__PURE__ */ jsxs(Field, { children: [/* @__PURE__ */ jsx(FieldLabel, { children: /* @__PURE__ */ jsx(Label$1, {
						htmlFor: "phone",
						children: "Teléfono"
					}) }), /* @__PURE__ */ jsxs(FieldContent, { children: [/* @__PURE__ */ jsx(Input, {
						id: "phone",
						type: "tel",
						placeholder: "+54 11 5555-5555",
						...register("phone"),
						"aria-invalid": !!errors.phone
					}), /* @__PURE__ */ jsx(FieldError, { errors: [errors.phone] })] })] })
				] }), /* @__PURE__ */ jsxs(DialogFooter, {
					className: "mt-6",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "outline",
						onClick: onClose,
						disabled: isLoading,
						children: "Cancelar"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: isLoading,
						children: isLoading ? isEdit ? "Actualizando..." : "Creando..." : isEdit ? "Guardar cambios" : "Crear contacto"
					})]
				})]
			})]
		})
	});
}
//#endregion
//#region src/features/companies/components/CompanyDetail.tsx
function CompanyDetail({ id }) {
	return /* @__PURE__ */ jsx(QueryProvider, { children: /* @__PURE__ */ jsx(CompanyDetailContent, { id }) });
}
var STATUS_BADGE = {
	ACTIVE: {
		variant: "default",
		label: "Activo"
	},
	INACTIVE: {
		variant: "secondary",
		label: "Inactivo"
	}
};
function CompanyDetailContent({ id }) {
	const { data: company, isLoading, isError } = useCompany(id);
	const { canCreate, canEdit, canDelete } = usePermissions();
	const deleteContactMutation = useDeleteContact();
	const [contactDialogOpen, setContactDialogOpen] = useState(false);
	const [editingContact, setEditingContact] = useState();
	const [deletingContact, setDeletingContact] = useState();
	function handleAddContact() {
		setEditingContact(void 0);
		setContactDialogOpen(true);
	}
	function handleEditContact(contact) {
		setEditingContact(contact);
		setContactDialogOpen(true);
	}
	function handleDeleteContactConfirm() {
		if (!deletingContact) return;
		deleteContactMutation.mutate({
			id: deletingContact.id,
			companyId: id
		}, { onSuccess: () => setDeletingContact(void 0) });
	}
	function handleContactDialogClose() {
		setContactDialogOpen(false);
		setEditingContact(void 0);
	}
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 animate-pulse rounded bg-muted" }), /* @__PURE__ */ jsx("div", { className: "h-32 w-full animate-pulse rounded-xl bg-muted" })]
	});
	if (isError || !company) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center py-16 text-center",
		children: [
			/* @__PURE__ */ jsx(Building2, { className: "size-12 text-muted-foreground/40" }),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-4 text-lg font-semibold",
				children: "Empresa no encontrada"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "La empresa que buscás no existe o fue eliminada."
			}),
			/* @__PURE__ */ jsx(Button, {
				asChild: true,
				className: "mt-4",
				children: /* @__PURE__ */ jsx("a", {
					href: "/app/companies",
					children: "Volver a empresas"
				})
			})
		]
	});
	const badge = STATUS_BADGE[company.status] ?? {
		variant: "secondary",
		label: company.status
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				asChild: true,
				className: "-ml-2",
				children: /* @__PURE__ */ jsxs("a", {
					href: "/app/companies",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }), "Volver a empresas"]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-start justify-between",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex size-12 items-center justify-center rounded-xl bg-primary/10",
						children: /* @__PURE__ */ jsx(Building2, { className: "size-6 text-primary" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
						className: "text-2xl font-bold tracking-tight",
						children: company.name
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-1 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Badge, {
							variant: badge.variant,
							children: badge.label
						}), company.industry && /* @__PURE__ */ jsx("span", {
							className: "text-sm text-muted-foreground",
							children: company.industry
						})]
					})] })]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ jsxs(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Información general" }) }), /* @__PURE__ */ jsxs(CardContent, {
						className: "space-y-4",
						children: [
							company.website && /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(Globe, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ jsxs("a", {
									href: company.website,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "inline-flex items-center gap-1 text-sm text-primary hover:underline",
									children: [new URL(company.website).hostname, /* @__PURE__ */ jsx(ExternalLink, { className: "size-3" })]
								})]
							}),
							company.size && /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(Users, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ jsxs("span", {
									className: "text-sm",
									children: [company.size, " empleados"]
								})]
							}),
							company.address && /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(MapPin, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ jsx("span", {
									className: "text-sm",
									children: company.address
								})]
							}),
							!company.website && !company.size && !company.address && /* @__PURE__ */ jsx("p", {
								className: "text-sm text-muted-foreground",
								children: "No hay información adicional."
							})
						]
					})]
				}), /* @__PURE__ */ jsxs(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Detalles" }) }), /* @__PURE__ */ jsxs(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-muted-foreground",
									children: "ID"
								}), /* @__PURE__ */ jsx("span", {
									className: "font-mono text-xs",
									children: company.id
								})]
							}),
							/* @__PURE__ */ jsx(Separator$1, {}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-muted-foreground",
									children: "Creado"
								}), /* @__PURE__ */ jsx("span", { children: new Date(company.createdAt).toLocaleDateString("es-AR", {
									year: "numeric",
									month: "long",
									day: "numeric"
								}) })]
							}),
							/* @__PURE__ */ jsx(Separator$1, {}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-muted-foreground",
									children: "Actualizado"
								}), /* @__PURE__ */ jsx("span", { children: new Date(company.updatedAt).toLocaleDateString("es-AR", {
									year: "numeric",
									month: "long",
									day: "numeric"
								}) })]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(UserPlus, { className: "size-5 text-muted-foreground" }), /* @__PURE__ */ jsx("h2", {
							className: "text-lg font-semibold",
							children: "Contactos"
						})]
					}), canCreate && /* @__PURE__ */ jsxs(Button, {
						onClick: handleAddContact,
						size: "sm",
						children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), "Agregar contacto"]
					})]
				}), /* @__PURE__ */ jsx(ContactsList, {
					companyId: id,
					onEdit: handleEditContact,
					onDelete: setDeletingContact,
					onAddClick: handleAddContact,
					canEdit,
					canDelete,
					canCreate
				})]
			}),
			/* @__PURE__ */ jsx(ContactFormDialog, {
				open: contactDialogOpen,
				onClose: handleContactDialogClose,
				companyId: id,
				contact: editingContact
			}),
			/* @__PURE__ */ jsx(Dialog$1, {
				open: !!deletingContact,
				onOpenChange: (open) => !open && setDeletingContact(void 0),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Eliminar contacto" }), /* @__PURE__ */ jsxs(DialogDescription, { children: [
						"¿Estás seguro de que querés eliminar a",
						" ",
						/* @__PURE__ */ jsx("strong", { children: deletingContact?.fullName }),
						"? Esta acción no se puede deshacer."
					] })] }), /* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "outline",
						onClick: () => setDeletingContact(void 0),
						disabled: deleteContactMutation.isPending,
						children: "Cancelar"
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "destructive",
						onClick: handleDeleteContactConfirm,
						disabled: deleteContactMutation.isPending,
						children: deleteContactMutation.isPending ? "Eliminando..." : "Eliminar"
					})] })]
				})
			})
		]
	});
}
//#endregion
//#region src/pages/app/companies/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Id = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	const { id } = Astro.params;
	return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, {}, {
		"default": ($$result) => renderTemplate`${renderComponent($$result, "CompanyDetail", CompanyDetail, {
			"id": id,
			"client:load": true,
			"client:component-hydration": "load",
			"client:component-path": "@/features/companies/components/CompanyDetail",
			"client:component-export": "CompanyDetail"
		})}`,
		"head": ($$result) => renderTemplate`${renderComponent($$result, "Fragment", Fragment$2, { "slot": "head" }, { "default": ($$result) => renderTemplate`<title>Empresa — GurkCRM</title>` })}`
	})}`;
}, "D:/Astro/GurkCRM/frontend/src/pages/app/companies/[id].astro", void 0);
var $$file = "D:/Astro/GurkCRM/frontend/src/pages/app/companies/[id].astro";
var $$url = "/app/companies/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/app/companies/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
