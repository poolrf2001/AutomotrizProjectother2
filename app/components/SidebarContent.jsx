"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronLeft, User } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { NAV_TREE, HOME_ITEM } from "@/config/navTree";
import { filterNavTree } from "@/lib/navFilter";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import NotificacionesBell from "./NotificacionesBell";

export default function SidebarContent({ onNavigate, isMobile = false }) {
  const pathname = usePathname();
  const { permissions, user } = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // ✅ Evitar hidratación
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  // ✅ OCULTAR AL CAMBIAR DE RUTA (solo en desktop)
  useEffect(() => {
    if (!isMobile && window.innerWidth >= 768) {
      setCollapsed(true);
      localStorage.setItem("sidebarCollapsed", JSON.stringify(true));
    }
  }, [pathname, isMobile]);

  const toggleCollapsed = (value) => {
    setCollapsed(value);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(value));
  };

  const canHome = hasPermission(permissions, HOME_ITEM.perm[0], HOME_ITEM.perm[1]);
  const menu = filterNavTree(NAV_TREE, permissions);

  const openGroups = useMemo(() => {
    return menu
      .filter((section) => section.items.some((item) => pathname.startsWith(item.to)))
      .map((section) => section.key);
  }, [menu, pathname]);

  const initials = user?.fullname
    ?.split(" ")
    ?.map((n) => n[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase();

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("sidebarCollapsed");
    document.cookie = "token=; path=/;";
    window.location.href = "/login";
  }

  if (!isClient) return null;

  // =========================
  // MOBILE (siempre expandido)
  // =========================
  if (isMobile) {
    return (
      <aside className="h-full w-72 bg-slate-900 text-slate-100 flex flex-col min-h-0 transition-all duration-300">
        <div className="p-5 border-b border-white/10">
          <div>
            <h2 className="font-bold text-lg">Dashboard</h2>
            <p className="text-xs text-slate-400">Hub CRM</p>
            <p className="text-xs text-slate-400">Panel administrativo</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* ✅ HOME fuera del acordeón */}
          <div className="p-3">
            {canHome && (
              <Link
                href={HOME_ITEM.to}
                onClick={onNavigate}
                className={[
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  pathname === HOME_ITEM.to || pathname.startsWith(HOME_ITEM.to + "/")
                    ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                    : "hover:bg-white/5 text-slate-200",
                ].join(" ")}
              >
                {HOME_ITEM.icon ? <HOME_ITEM.icon className="w-4 h-4" /> : null}
                <span>{HOME_ITEM.label}</span>
              </Link>
            )}
          </div>

          {/* ✅ Resto en acordeón */}
          <Accordion type="multiple" defaultValue={openGroups} className="px-2 pb-4">
            {menu.map((section) => (
              <AccordionItem key={section.key} value={section.key} className="border-white/10">
                <AccordionTrigger className="px-3 py-2 text-slate-300 hover:text-white">
                  {section.label}
                </AccordionTrigger>

                <AccordionContent className="space-y-1 px-1 pb-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.to || pathname.startsWith(item.to + "/");

                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        onClick={onNavigate}
                        className={[
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                          active
                            ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                            : "hover:bg-white/5 text-slate-200",
                        ].join(" ")}
                      >
                        {Icon ? <Icon className="w-4 h-4" /> : null}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* ✅ User menu al final del sidebar */}
        {user && (
          <div className="border-t border-white/10 p-4 space-y-3">
            {/* ✅ Notificaciones */}
            {user?.id && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex-1">Notificaciones</span>
                <NotificacionesBell usuarioId={user.id} />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-left hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{user.fullname}</p>
                    <p className="text-xs text-slate-400">{user.correo}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="z-[999] w-56" side="top">
                {/* ✅ PERFIL */}
                <DropdownMenuItem asChild>
                  <Link href="/perfil" onClick={onNavigate} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <a
                    href="https://onesolutionhubcrm.atlassian.net/servicedesk/customer/portal/2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    Soporte Técnico
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    );
  }

  // =========================
  // DESKTOP (colapsado)
  // =========================
  if (collapsed) {
    return (
      <aside className="h-full w-20 bg-slate-900 text-slate-100 flex flex-col min-h-0 border-r border-white/10 transition-all duration-300">
        <div className="p-3 border-b border-white/10 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleCollapsed(false)}
            className="text-slate-400 hover:text-white hover:bg-white/10"
            title="Abrir sidebar"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 p-2">
          {canHome && (
            <Link
              href={HOME_ITEM.to}
              onClick={onNavigate}
              title={HOME_ITEM.label}
              className={[
                "flex items-center justify-center p-3 rounded-lg text-sm transition",
                pathname === HOME_ITEM.to || pathname.startsWith(HOME_ITEM.to + "/")
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                  : "hover:bg-white/5 text-slate-200",
              ].join(" ")}
            >
              {HOME_ITEM.icon ? <HOME_ITEM.icon className="w-5 h-5" /> : null}
            </Link>
          )}

          {menu.map((section) =>
            section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to || pathname.startsWith(item.to + "/");

              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={onNavigate}
                  title={item.label}
                  className={[
                    "flex items-center justify-center p-3 rounded-lg text-sm transition",
                    active
                      ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                      : "hover:bg-white/5 text-slate-200",
                  ].join(" ")}
                >
                  {Icon ? <Icon className="w-5 h-5" /> : null}
                </Link>
              );
            })
          )}
        </div>

        {user?.id && (
          <div className="border-t border-white/10 p-2">
            <NotificacionesBell usuarioId={user.id} />
          </div>
        )}

        {user && (
          <div className="border-t border-white/10 p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full hover:bg-white/10"
                  title={user.fullname}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-600 text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="z-[999] w-56" side="right">
                <DropdownMenuLabel>{user.fullname}</DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>{user.role_name}</DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* ✅ PERFIL */}
                <DropdownMenuItem asChild>
                  <Link href="/perfil" onClick={onNavigate} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <a
                    href="https://onesolutionhubcrm.atlassian.net/servicedesk/customer/portal/2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    Soporte Técnico
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    );
  }

  // =========================
  // DESKTOP (expandido)
  // =========================
  return (
    <aside className="h-full w-72 bg-slate-900 text-slate-100 flex flex-col min-h-0 transition-all duration-300">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Dashboard</h2>
          <p className="text-xs text-slate-400">Hub CRM</p>
          <p className="text-xs text-slate-400">Panel administrativo</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleCollapsed(true)}
          className="text-slate-400 hover:text-white hover:bg-white/10 flex-shrink-0"
          title="Cerrar sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3">
          {canHome && (
            <Link
              href={HOME_ITEM.to}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                pathname === HOME_ITEM.to || pathname.startsWith(HOME_ITEM.to + "/")
                  ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                  : "hover:bg-white/5 text-slate-200",
              ].join(" ")}
            >
              {HOME_ITEM.icon ? <HOME_ITEM.icon className="w-4 h-4" /> : null}
              <span>{HOME_ITEM.label}</span>
            </Link>
          )}
        </div>

        <Accordion type="multiple" defaultValue={openGroups} className="px-2 pb-4">
          {menu.map((section) => (
            <AccordionItem key={section.key} value={section.key} className="border-white/10">
              <AccordionTrigger className="px-3 py-2 text-slate-300 hover:text-white">
                {section.label}
              </AccordionTrigger>

              <AccordionContent className="space-y-1 px-1 pb-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");

                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={onNavigate}
                      className={[
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                        active
                          ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                          : "hover:bg-white/5 text-slate-200",
                      ].join(" ")}
                    >
                      {Icon ? <Icon className="w-4 h-4" /> : null}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {user && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {user?.id && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex-1">Notificaciones</span>
              <NotificacionesBell usuarioId={user.id} />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-left hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{user.fullname}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="z-[999] w-56" side="top">
              {/* ✅ PERFIL */}
              <DropdownMenuItem asChild>
                <Link href="/perfil" onClick={onNavigate} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a
                  href="https://onesolutionhubcrm.atlassian.net/servicedesk/customer/portal/2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  Soporte Técnico
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}