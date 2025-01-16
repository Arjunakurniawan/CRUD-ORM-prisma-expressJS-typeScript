import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app: Application = express();
dotenv.config();

app.use(express.json());

app.get("/products", async (req: Request, res: Response) => {
  try {
    const getProducts = (await prisma.products.findFirst()) || [];
    res.status(200).send(getProducts);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("hallo world!");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`);
});
