import type { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pendiente", variant: "outline" },
  COMPLETED: { label: "Completada", variant: "default" },
  CANCELLED: { label: "Cancelada", variant: "destructive" },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
