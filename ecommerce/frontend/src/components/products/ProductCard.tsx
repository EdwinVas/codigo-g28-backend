"use client";

import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Product Image Placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <ShoppingCart className="h-10 w-10 text-primary/40" />
          </div>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive">Sin stock</Badge>
          </div>
        )}
        {product.categories && (
          <Badge className="absolute top-3 left-3" variant="secondary">
            {product.categories.name}
          </Badge>
        )}
      </div>

      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">
            {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <span className="text-lg font-bold text-primary">
          ${Number(product.price).toFixed(2)}
        </span>
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="gap-1.5"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}
