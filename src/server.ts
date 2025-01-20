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
    const getProducts =
      (await prisma.product.findMany({
        include: {
          category: true,
        },
      })) || [];
    res.status(200).json(getProducts);
  } catch (error) {
    res.status(500).json({ error: "Error Get Products" });
  }
});

interface ProductInput {
  name_product: string;
  brand: string;
  price: string;
  category: { name: string };
}
//create a new products with prisma
app.post("/products", async (req: Request, res: Response) => {
  const { name_product, brand, price, category }: ProductInput = req.body;
  try {
    await prisma.product.create({
      data: {
        name_product,
        brand,
        price,
        category: {
          create: { name: category.name },
        },
      },
    });
    res.status(201).json({ message: "products created successfully" });
  } catch (error) {
    res.status(500).json({ error: "error Creating Products" });
  }
});

//delete product by id with prisma
app.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.product.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error Deleting Products" });
  }
});

//update product by id with prisma
app.put("/products/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name_product, brand, price } = req.body;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name_product,
        brand,
        price,
        category: {
          create: {
            name: req.body.category.name,
          },
        },
      },
    });

    res.status(200).json({ message: "Products updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "error Updating Products" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("hallo world!");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`);
});
