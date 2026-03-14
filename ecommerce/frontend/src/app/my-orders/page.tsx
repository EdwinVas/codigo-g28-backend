"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ordersApi } from "@/lib/api";
import type { Order } from "@/types";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ClipboardList, XCircle, Package } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!session?.user?.accessToken) return;
    setLoading(true);
    try {
      const res = await ordersApi.getAll(session.user.accessToken);
      setOrders(res.data);
    } catch (err) {
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const handleCancel = async (orderId: number) => {
    if (!session?.user?.accessToken) return;
    try {
      await ordersApi.cancel(orderId, session.user.accessToken);
      toast.success("Orden cancelada");
      fetchOrders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cancelar";
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Mis Órdenes</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes órdenes aún</h3>
          <p className="text-muted-foreground text-sm">
            Tus pedidos aparecerán aquí una vez que realices tu primera compra
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Orden #{order.id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {format(new Date(order.createdAt), "d 'de' MMMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    {order.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleCancel(order.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.products.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
