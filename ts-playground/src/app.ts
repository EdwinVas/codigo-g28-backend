import express from "express";
import productRoutes from "./routes/product.routes";

const app = express();
const PORT = 3000;

app.use(express.json());

// definiendo que productRoutes sea parte de nuestra app
app.use("/api/products", productRoutes);

// creamos nuestra primera ruta:
app.get("/api/test", function (request, response) {
  response.json({ ok: true, message: "Mi API funciona!!!" });
});

app.listen(PORT, function () {
  console.log(`El servidor inicio en http://localhost:${PORT}`);
});
