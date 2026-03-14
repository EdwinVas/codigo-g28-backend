"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Menu,
  Package,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  User,
  Tag,
  ShoppingBag,
  Home,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount)();
  const [open, setOpen] = useState(false);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const isLoggedIn = !!session;

  const navLinks = isAdmin
    ? [{ href: "/", label: "Home", icon: Home }]
    : isLoggedIn
    ? [
        { href: "/", label: "Productos", icon: Home },
        { href: "/my-orders", label: "Mis Órdenes", icon: ClipboardList },
      ]
    : [{ href: "/", label: "Productos", icon: Home }];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            G28 Shop
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Panel
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/admin/products")} className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-4 w-4" />
                    Productos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/admin/categories")} className="flex items-center gap-2 cursor-pointer">
                    <Tag className="h-4 w-4" />
                    Categorías
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/admin/orders")} className="flex items-center gap-2 cursor-pointer">
                    <ClipboardList className="h-4 w-4" />
                    Órdenes
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {!isAdmin && isLoggedIn && (
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Carrito</span>
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {session.user?.name}
                  </span>
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{session.user?.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => router.push("/my-orders")} className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Mis Órdenes
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-destructive cursor-pointer"
                    data-variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            } />
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Navegación
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium hover:bg-accent"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 mt-2">
                      Admin
                    </p>
                    <button
                      onClick={() => { router.push("/admin/products"); setOpen(false); }}
                      className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium hover:bg-accent text-left"
                    >
                      <Package className="h-4 w-4" />
                      Productos
                    </button>
                    <button
                      onClick={() => { router.push("/admin/categories"); setOpen(false); }}
                      className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium hover:bg-accent text-left"
                    >
                      <Tag className="h-4 w-4" />
                      Categorías
                    </button>
                    <button
                      onClick={() => { router.push("/admin/orders"); setOpen(false); }}
                      className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium hover:bg-accent text-left"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Órdenes
                    </button>
                  </>
                )}
                {!isLoggedIn && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Iniciar sesión
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="w-full">Registrarse</Button>
                    </Link>
                  </div>
                )}
                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-destructive hover:text-destructive mt-4"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
