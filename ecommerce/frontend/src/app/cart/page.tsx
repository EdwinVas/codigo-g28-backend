"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cart.store";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();
  const [checking, setChecking] = useState(false);

  const totalAmount = total();
  const count = itemCount();

  const handleCheckout = async () => {
    if (!session?.user?.accessToken) {
      router.push("/login");
      return;
    }
    if (items.length === 0) return;

    setChecking(true);
    try {
      await ordersApi.create(
        items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        session.user.accessToken
      );
      clearCart();
      toast.success("¡Orden creada exitosamente!");
      router.push("/my-orders");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear la orden";
      toast.error(msg);
    } finally {
      setChecking(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">
          Agrega productos para continuar con tu compra
        </p>
        <Link href="/">
          <Button className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Ver productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Carrito de compras
        <Badge variant="secondary" className="ml-3 text-base">
          {count} {count === 1 ? "ítem" : "ítems"}
        </Badge>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Product Image placeholder */}
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-7 w-7 text-muted-foreground/40" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.product.price).toFixed(2)} c/u
                    </p>
                    {item.product.categories && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {item.product.categories.name}
                      </Badge>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Subtotal + delete */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive mt-1"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive gap-2"
            onClick={() => clearCart()}
          >
            <Trash2 className="h-4 w-4" />
            Vaciar carrito
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${totalAmount.toFixed(2)}</span>
              </div>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                disabled={checking}
              >
                {checking ? "Procesando..." : "Confirmar orden"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full" size="sm">
                  Seguir comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
