import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app: Application = express();
dotenv.config();

app.use(express.json());

//get all products with prisma
app.get("/products", async (req: Request, res: Response) => {
  try {
    const getProducts = (await prisma.products.findMany()) || [];
    res.status(200).json(getProducts);
  } catch (error) {
    res.status(500).json({ error: "Error Get Products" });
  }
});

//create a new products with prisma
app.post("/products", async (req: Request, res: Response) => {
  const { name_products, brand, stock } = req.body;
  try {
    const newProducts = await prisma.products.create({
      data: {
        name_products,
        brand,
        stock,
      },
    });
    res.status(201).json(newProducts);
  } catch (error) {
    res.status(500).json({ error: "error Creating Products" });
  }
});

//delete product by id with prisma
app.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const id_products = parseInt(req.params.id, 10);

    await prisma.products.delete({
      where: {
        id_products,
      },
    });

    res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error Deleting Products" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("hallo world!");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`);
});
