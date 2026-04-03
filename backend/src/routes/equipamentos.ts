import { Router } from "express";
import { equipamentos } from "../data.js";

export const equipamentosRouter = Router();

equipamentosRouter.get("/", (req, res) => {
  const clienteId = req.query.clienteId?.toString();

  if (clienteId) {
    return res.json(equipamentos.filter((item) => item.clienteId === clienteId));
  }

  res.json(equipamentos);
});

equipamentosRouter.get("/:id", (req, res) => {
  const equipamento = equipamentos.find((item) => item.id === req.params.id);

  if (!equipamento) {
    return res.status(404).json({ error: "Equipamento não encontrado" });
  }

  res.json(equipamento);
});
