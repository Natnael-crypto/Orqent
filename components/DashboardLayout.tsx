"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard, MessageSquare, MessagesSquare, BarChart3,
    Activity, Puzzle, CreditCard, Settings, ChevronDown, ChevronLeft, ChevronRight, Plus, Menu, Palette
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const mainNav = [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Chat Widgets", path: "/dashboard/widgets", icon: MessageSquare },
    { label: "Conversations", path: "/dashboard/conversations", icon: MessagesSquare },
];

const analyticsNav = [
    { label: "Weekly Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { label: "Usage", path: "/dashboard/usage", icon: Activity },
];

const settingsNav = [
    { label: "Integrations", path: "/dashboard/integrations", icon: Puzzle },
    { label: "UI Customizations", path: "/dashboard/ui", icon: Palette },
    { label: "Billing", path: "/dashboard/billing", icon: CreditCard },
    { label: "Account Settings", path: "/dashboard/settings", icon: Settings },
];

const NavItem = ({ item, pathname, collapsed }: { item: { label: string; path: string; icon: any }; pathname: string; collapsed: boolean }) => {
    const isActive = pathname === item.path;
    const Icon = item.icon;
    return (
        <Link
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 ${isActive
                ? "font-medium text-sidebar-primary bg-sidebar-accent"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
                } ${collapsed ? "justify-center px-2" : ""}`}
            title={collapsed ? item.label : ""}
        >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
    );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const location = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user in layout:", error);
            }
        };
        fetchUser();
    }, []);

    const allItems = [...mainNav, ...analyticsNav, ...settingsNav];
    const currentLabel = allItems.find((i) => location.startsWith(i.path) && i.path !== "/dashboard")?.label
        || (location === "/dashboard" ? "Overview" : "Dashboard");

    const renderSidebarContent = (isCollapsed: boolean) => (
        <>
            <div className={`h-14 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-4"} border-b border-sidebar-border overflow-hidden`}>
                {!isCollapsed ? (
                    <Link href="/" className="text-base font-medium tracking-tight text-sidebar-primary">Orqent</Link>
                ) : (
                    <Link href="/" className="text-xl font-bold text-sidebar-primary">O</Link>
                )}
                {!isCollapsed && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>

            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6 scrollbar-none">
                {/* Main */}
                <div className="space-y-0.5">
                    {mainNav.map((item) => (
                        <NavItem key={item.path} item={item} pathname={location} collapsed={isCollapsed} />
                    ))}
                </div>

                {/* Analytics */}
                <div className="space-y-1">
                    {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Analytics</p>}
                    <div className="space-y-0.5">
                        {analyticsNav.map((item) => (
                            <NavItem key={item.path} item={item} pathname={location} collapsed={isCollapsed} />
                        ))}
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-1">
                    {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Settings</p>}
                    <div className="space-y-0.5">
                        {settingsNav.map((item) => (
                            <NavItem key={item.path} item={item} pathname={location} collapsed={isCollapsed} />
                        ))}
                    </div>
                </div>
            </div>

            <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? "flex flex-col items-center px-2" : ""}`}>
                <button
                    onClick={() => router.push("/dashboard/widgets/new")}
                    className={`flex items-center justify-center gap-2 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 ${isCollapsed ? "w-10 h-10 p-0" : "w-full px-4 py-2"
                        }`}
                    title={isCollapsed ? "Create Widget" : ""}
                >
                    <Plus className="w-4 h-4" />
                    {!isCollapsed && <span>Create Widget</span>}
                </button>
                <div className={`flex items-center gap-3 mt-4 ${isCollapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "..."}
                    </div>
                    {!isCollapsed && (
                        <div className="text-sm truncate">
                            <p className="font-medium text-sidebar-primary truncate">{user?.name || "Loading..."}</p>
                            <p className="text-xs text-muted-foreground truncate font-medium">Pro Plan</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar - desktop */}
            <div className="relative hidden md:block group">
                <aside
                    className={`h-full ${collapsed ? "w-[72px]" : "w-64"} shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out flex flex-col`}
                >
                    {renderSidebarContent(collapsed)}
                </aside>

                {/* Stripe-style toggle button */}
                <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 z-50 flex items-center">
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setCollapsed(!collapsed)}
                                    className="group/toggle relative flex h-12 w-4 items-center justify-center transition-all duration-200 outline-none"
                                >
                                    {/* The vertical bar line */}
                                    <div className="absolute h-6 w-[4px]  bg-gray-800 rounded-full group-hover/toggle:opacity-0 transition-opacity duration-200" />

                                    {/* The chevron icon (visible on hover) */}
                                    <div className="flex h-6 w-6 items-center justify-center text-sidebar-foreground opacity-0 group-hover/toggle:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 translate-x-[-2px]">
                                        {collapsed ? (
                                            <ChevronRight className="h-6 w-6" />
                                        ) : (
                                            <ChevronLeft className="h-6 w-6" />
                                        )}
                                    </div>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="right"
                                sideOffset={10}
                                className="bg-slate-800 text-white border-none text-[12px] font-medium px-2.5 py-1"
                            >
                                {collapsed ? "Expand" : "Collapse"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Sidebar - mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {renderSidebarContent(false)}
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 border-b border-border flex items-center px-4 md:px-6 justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 768) setMobileOpen(!mobileOpen);
                                // No longer toggling collapse from here for desktop, 
                                // using the edge button instead, but keeping accessibility
                            }}
                            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{currentLabel}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-8 w-56 text-sm bg-secondary rounded-md pl-8 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring border-none"
                            />
                            <svg className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f9fafb]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
