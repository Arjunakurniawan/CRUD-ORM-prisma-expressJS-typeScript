import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";

const prisma = new PrismaClient();
const app: Application = express();

app.use(bodyParser.json());
dotenv.config();

//get all products with prisma
app.get("/products", async (req: Request, res: Response) => {
  try {
    const getProducts =
      (await prisma.products.findMany({
        include: {
          product_detail: true,
          category: true,
        },
      })) || [];
    res.status(200).json(getProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Get Products" });
  }
});

interface ProductRequest {
  product_name: string;
  product_brand: string;
  product_price: string;
  category: { name: string };
  image: string;
  description: string;
}

//create a new products with prisma
app.post(
  "/products",
  async (req: Request<{}, {}, ProductRequest>, res: Response) => {
    try {
      const {
        product_name,
        product_brand,
        product_price,
        image,
        description,
        category,
      } = req.body;
      console.log("request body", req.body);

      const categoryData = await prisma.categories.findUnique({
        where: { name: category.name },
      });

      if (
        !product_name ||
        !product_brand ||
        !product_price ||
        !image ||
        !description
      ) {
        res.status(400).json({ error: "All fields are required." });
      }

      const productCreate = await prisma.products.create({
        data: {
          product_name,
          product_brand,
          product_price,
          category: categoryData
            ? {
                connect: { id: categoryData.id },
              }
            : {
                create: {
                  name: category.name,
                },
              },
          product_detail: {
            create: {
              image,
              description,
            },
          },
        },
      });

      res.status(201).json(productCreate);
      console.log("success created product");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "error Creating Products" });
    }
  }
);

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

  const { product_name, product_brand, product_price } = req.body;

  const categoryData = await prisma.categories.findUnique({
    where: { name: req.body.category.name },
  });

  try {
    await prisma.products.update({
      where: { id },
      data: {
        product_name,
        product_brand,
        product_price,
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
