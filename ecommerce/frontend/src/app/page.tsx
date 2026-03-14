"use client";

import { useEffect, useState } from "react";
import { productsApi, categoriesApi } from "@/lib/api";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Package, Search, Tag, Zap } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([productsApi.getAll(), categoriesApi.getAll()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data);
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === null || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBanners = [
    {
      title: "Colección Tech 2026",
      desc: "Descubre lo último en tecnología con descuentos especiales",
      gradient: "from-blue-600 to-indigo-900",
    },
    {
      title: "Ofertas Relámpago",
      desc: "Hasta 50% de descuento en periféricos seleccionados por tiempo limitado",
      gradient: "from-purple-600 to-fuchsia-900",
    },
    {
      title: "Renueva tu Setup",
      desc: "Accesorios premium para llevar tu productividad al siguiente nivel",
      gradient: "from-emerald-600 to-teal-900",
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Hero Carousel Segment */}
      <section className="w-full bg-background border-b border-border/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Carousel
            opts={{ loop: true, align: "start" }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {featuredBanners.map((banner, index) => (
                <CarouselItem key={index}>
                  <div className={`p-8 md:p-16 rounded-2xl bg-linear-to-r ${banner.gradient} text-white shadow-xl min-h-[300px] flex flex-col justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl">
                      <Badge variant="secondary" className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                        <Zap className="w-3 h-3 mr-1 text-yellow-300 fill-yellow-300" /> Nuevo
                      </Badge>
                      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {banner.title}
                      </h1>
                      <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
                        {banner.desc}
                      </p>
                      <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
                        Ver Colección
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-4 bg-black/50 border-none hover:bg-black/80 text-white" />
              <CarouselNext className="right-4 bg-black/50 border-none hover:bg-black/80 text-white" />
            </div>
          </Carousel>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-10">
        {/* Categories & Search Segment */}
        <section className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="w-full md:w-1/3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-products"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-border/50 text-base"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto overflow-hidden">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
              <Tag className="w-4 h-4" /> Categorías:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full remove-scrollbar mask-edges">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="shrink-0 rounded-full px-5"
              >
                Todas
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className="shrink-0 rounded-full px-5 bg-background/50 backdrop-blur-sm"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid Segment */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {selectedCategory === null ? "Catálogo Completo" : "Productos Filtrados"}
            </h2>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {filtered.length} resultados
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 glass p-3 rounded-xl">
                  <Skeleton className="aspect-square rounded-lg bg-card" />
                  <Skeleton className="h-5 w-3/4 bg-card" />
                  <Skeleton className="h-4 w-1/2 bg-card" />
                  <Skeleton className="h-10 w-full mt-2 bg-card" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-24 text-center rounded-2xl">
              <div className="bg-muted/50 p-6 rounded-full mb-6">
                <Search className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                No encontramos productos
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Intenta ajustando tus filtros de categoría o usando un término de búsqueda diferente.
              </p>
              <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(null); }}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
