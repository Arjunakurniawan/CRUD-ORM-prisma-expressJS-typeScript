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
      (await prisma.products.findMany({
        include: {
          category: true,
          transaction: {
            select: {
              amount: true,
            },
          },
        },
      })) || [];
    res.status(200).json(getProducts);
  } catch (error) {
    res.status(500).json({ error: "Error Get Products" });
  }
});

interface PrismaData {
  name_product: string;
  brand: string;
  price: string;
  category: { name: string };
  transaction: { amount: string };
}

//create a new products with prisma
app.post("/products", async (req: Request, res: Response) => {
  try {
    const { name_product, brand, price, category, transaction }: PrismaData =
      req.body;

    const transactionData = await prisma.transactions.findFirst({
      where: {
        amount: transaction.amount,
      },
    });

    const categoryData = await prisma.categories.findUnique({
      where: { name: category.name },
    });

    await prisma.products.create({
      data: {
        name_product,
        brand,
        price,
        category: categoryData
          ? {
              connect: { id: categoryData.id },
            }
          : { create: { name: category.name } },
        transaction: transactionData
          ? {
              connect: { id: transactionData.id },
            }
          : {
              create: {
                amount: transaction.amount,
              },
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
    await prisma.products.delete({
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

  const categoryData = await prisma.categories.findUnique({
    where: { name: req.body.category.name },
  });

  try {
    await prisma.products.update({
      where: { id },
      data: {
        name_product,
        brand,
        price,
        category: categoryData
          ? {
              connect: { id: categoryData.id },
            }
          : { create: { name: req.body.category.name } },
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
