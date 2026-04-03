import { Router } from "express";
import { clientes, equipamentos, ordensServico, tecnicos } from "../data.js";
import { createOrdemServicoSchema, syncSchema, updateOrdemServicoSchema } from "../schemas.js";
import { createId } from "../utils.js";

export const osRouter = Router();

function expandOrder(orderId: string) {
  const order = ordensServico.find((item) => item.id === orderId);
  if (!order) return null;

  return {
    ...order,
    cliente: clientes.find((item) => item.id === order.clienteId) ?? null,
    equipamento: equipamentos.find((item) => item.id === order.equipamentoId) ?? null,
    tecnico: tecnicos.find((item) => item.id === order.tecnicoId) ?? null
  };
}

osRouter.get("/", (_req, res) => {
  res.json(ordensServico.map((item) => expandOrder(item.id)));
});

osRouter.get("/:id", (req, res) => {
  const order = expandOrder(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "OS não encontrada" });
  }

  res.json(order);
});

osRouter.post("/", (req, res) => {
  const parsed = createOrdemServicoSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados da OS inválidos",
      issues: parsed.error.flatten()
    });
  }

  const created = {
    id: createId(),
    ...parsed.data,
    status: "aberta" as const,
    createdAt: new Date().toISOString(),
    fotos: [],
    checklist: [],
    assinaturas: {}
  };

  ordensServico.unshift(created);

  res.status(201).json(created);
});

osRouter.patch("/:id", (req, res) => {
  const parsed = updateOrdemServicoSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Atualização inválida",
      issues: parsed.error.flatten()
    });
  }

  const index = ordensServico.findIndex((item) => item.id === req.params.id);
  if (index < 0) {
    return res.status(404).json({ error: "OS não encontrada" });
  }

  ordensServico[index] = {
    ...ordensServico[index],
    ...parsed.data
  };

  res.json(ordensServico[index]);
});

osRouter.post("/sync", (req, res) => {
  const parsed = syncSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Payload de sync inválido",
      issues: parsed.error.flatten()
    });
  }

  for (const action of parsed.data.actions) {
    if (action.type === "CREATE_OS") {
      const existingIndex = ordensServico.findIndex((item) => item.id === action.payload.id);
      if (existingIndex >= 0) {
        ordensServico[existingIndex] = action.payload;
      } else {
        ordensServico.unshift(action.payload);
      }
      continue;
    }

    const index = ordensServico.findIndex((item) => item.id === action.payload.id);
    if (index >= 0) {
      ordensServico[index] = {
        ...ordensServico[index],
        ...action.payload.updates
      };
    }
  }

  res.json({
    synced: parsed.data.actions.length,
    timestamp: new Date().toISOString()
  });
});
