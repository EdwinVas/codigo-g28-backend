import type { Request, Response } from "express";
import { ProductService } from "../services/product.service";

// instanciar ProductService
const service = new ProductService();

// req: request
// res: response

export class ProductController {
  // getAll
  async getAll(req: Request, res: Response) {
    try {
      const products = await service.getAll();
      res.json({ ok: true, data: products });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  // getByID
  // create
  // update
  // delete
}
