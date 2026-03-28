import { Request, Response } from "express";
import { S3Service } from "../services/s3.service";
import { prisma } from "../lib/prisma";

const s3Service = new S3Service();

export class UploadController {
  async uploadProductImage(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const file = req.file;

      if (!file) {
        res.status(400).json({ ok: false, message: "Archivo requerido" });
        return;
      }

      const product = await prisma.products.findUnique({ where: { id } });

      if (!product) {
        res.status(400).json({ ok: false, message: "El producto no existe" });
        return;
      }

      if (product.imageKey) {
        await s3Service.destroy(product.imageKey);
      }

      const key = await s3Service.upload(file, "products");

      const updated = await prisma.products.update({
        where: { id },
        data: { imageKey: key },
        include: { categories: true },
      });

      res.json({ ok: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getProductImage(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const product = await prisma.products.findUnique({ where: { id } });

      if (!product || !product.imageKey) {
        res.status(400).json({ ok: false, message: "Archivo requerido" });
        return;
      }

      const url = await s3Service.getSignerUrl(product.imageKey);

      res.json({
        ok: true,
        data: {
          imageUrl: url,
        },
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }
}
