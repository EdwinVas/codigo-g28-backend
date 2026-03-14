"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ordersApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  Archive,
  Search,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const columnHelper = createColumnHelper<Order>();

function OrdersTable({
  data,
  loading,
  isArchived,
  onArchive,
  onStatusChange,
  onViewDetail,
}: {
  data: Order[];
  loading: boolean;
  isArchived: boolean;
  onArchive?: (id: number) => void;
  onStatusChange?: (id: number, status: OrderStatus) => void;
  onViewDetail: (order: Order) => void;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    columnHelper.accessor("id", {
      header: "# Orden",
      cell: (info) => <span className="font-mono font-semibold">#{info.getValue()}</span>,
    }),
    columnHelper.accessor("users", {
      header: "Cliente",
      cell: (info) => (
        <div>
          <p className="font-medium text-sm">{info.getValue().username}</p>
          <p className="text-xs text-muted-foreground">{info.getValue().email}</p>
        </div>
      ),
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => <span className="font-bold text-primary">${Number(info.getValue()).toFixed(2)}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Estado",
      cell: (info) => <OrderStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("createdAt", {
      header: "Fecha",
      cell: (info) => format(new Date(info.getValue()), "dd/MM/yyyy HH:mm", { locale: es }),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onViewDetail(order)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {!isArchived && onStatusChange && (
              <Select
                defaultValue={order.status}
                onValueChange={(val) => onStatusChange(order.id, val as OrderStatus)}
              >
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            )}
            {!isArchived && onArchive && (
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => onArchive(order.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="orders-search"
          placeholder="Buscar por cliente, email..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40">
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No hay órdenes para mostrar
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || "";

  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [actRes, arcRes] = await Promise.all([
        ordersApi.getAll(token),
        ordersApi.getArchived(token),
      ]);
      setActiveOrders(actRes.data);
      setArchivedOrders(arcRes.data);
    } catch {
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleArchive = async (id: number) => {
    try {
      await ordersApi.archive(id, token);
      toast.success("Orden archivada");
      fetchOrders();
    } catch {
      toast.error("Error al archivar");
    }
  };

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      await ordersApi.updateStatus(id, status, token);
      toast.success("Estado actualizado");
      fetchOrders();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const filteredActive = statusFilter === "ALL"
    ? activeOrders
    : activeOrders.filter((o) => o.status === statusFilter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Órdenes</h1>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="gap-2" size="sm">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Activas
            <Badge variant="secondary" className="ml-1">{activeOrders.length}</Badge>
          </span>
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "archived"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archivadas
            <Badge variant="outline" className="ml-1">{archivedOrders.length}</Badge>
          </span>
        </button>
      </div>

      {/* Status filter (only for active) */}
      {activeTab === "active" && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted-foreground">Filtrar por estado:</span>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "PENDING", "COMPLETED", "CANCELLED"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "Todas" : s === "PENDING" ? "Pendientes" : s === "COMPLETED" ? "Completadas" : "Canceladas"}
              </Button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "active" ? (
        <OrdersTable
          data={filteredActive}
          loading={loading}
          isArchived={false}
          onArchive={handleArchive}
          onStatusChange={handleStatusChange}
          onViewDetail={setDetailOrder}
        />
      ) : (
        <OrdersTable
          data={archivedOrders}
          loading={loading}
          isArchived={true}
          onViewDetail={setDetailOrder}
        />
      )}

      {/* Order Detail Dialog */}
      {detailOrder && (
        <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Orden #{detailOrder.id}
                <OrderStatusBadge status={detailOrder.status} />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{detailOrder.users.username}</p>
                  <p className="text-xs text-muted-foreground">{detailOrder.users.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(detailOrder.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Ítems</p>
                {detailOrder.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.products.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${Number(detailOrder.total).toFixed(2)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailOrder(null)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
