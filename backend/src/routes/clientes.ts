import { Router } from "express";
import { clientes } from "../data.js";

export const clientesRouter = Router();

clientesRouter.get("/", (_req, res) => {
  res.json(clientes);
});

clientesRouter.get("/:id", (req, res) => {
  const cliente = clientes.find((item) => item.id === req.params.id);

  if (!cliente) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  res.json(cliente);
});
