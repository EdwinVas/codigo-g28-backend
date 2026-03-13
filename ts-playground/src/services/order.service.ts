import { prisma } from "../lib/prisma";

interface OrderItemInput {
  productId: number;
  quantity: number;
}

export class OrderService {
  async getAll() {
    return await prisma.orders.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order_items: {
          include: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: number) {
    return await prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order_items: {
          include: { products: true },
        },
      },
    });
  }

  async create(userId: number, items: OrderItemInput[]) {
    const products = await prisma.products.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
      },
    });

    let total = 0;

    for (let item of items) {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} no existe.`);
      }

      total += Number(product.price) * item.quantity;
    }

    return await prisma.orders.create({
      data: {
        userId,
        total,
        order_items: {
          create: items.map((item) => {
            const product = products.find(
              (product) => product.id === item.productId,
            );

            return {
              quantity: item.quantity,
              unitPrice: product?.price ?? 0,
              products: {
                connect: { id: item.productId },
              },
            };
          }),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order_items: {
          include: { products: true },
        },
      },
    });
  }

  async updateStatus(
    id: number,
    status: "PENDING" | "COMPLETED" | "CANCELLED",
  ) {
    return await prisma.orders.update({
      where: { id },
      data: { status },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        order_items: {
          include: { products: true },
        },
      },
    });
  }

  async destroy(id: number) {
    await prisma.order_items.deleteMany({ where: { orderId: id } });
    return await prisma.orders.delete({ where: { id } });
  }
}
