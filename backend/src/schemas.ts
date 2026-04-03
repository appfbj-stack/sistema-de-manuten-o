import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export const createOrdemServicoSchema = z.object({
  titulo: z.string().min(3),
  clienteId: z.string().min(1),
  equipamentoId: z.string().min(1),
  tecnicoId: z.string().min(1),
  tipoServico: z.string().min(1),
  prioridade: z.string().min(1),
  dataAgendada: z.string().min(1),
  observacoes: z.string().optional()
});

export const updateOrdemServicoSchema = createOrdemServicoSchema
  .partial()
  .extend({
    status: z.enum(["aberta", "andamento", "concluida"]).optional(),
    fotos: z.array(z.string()).optional(),
    checklist: z
      .array(
        z.object({
          item: z.string(),
          status: z.enum(["ok", "atencao", "critico", "pendente"]),
          note: z.string().optional()
        })
      )
      .optional(),
    assinaturas: z
      .object({
        cliente: z.string().optional(),
        tecnico: z.string().optional()
      })
      .optional()
  });

export const syncSchema = z.object({
  actions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("CREATE_OS"),
        payload: createOrdemServicoSchema.extend({
          id: z.string(),
          status: z.enum(["aberta", "andamento", "concluida"]),
          createdAt: z.string(),
          fotos: z.array(z.string()).default([]),
          checklist: z.array(
            z.object({
              item: z.string(),
              status: z.enum(["ok", "atencao", "critico", "pendente"]),
              note: z.string().optional()
            })
          ).default([]),
          assinaturas: z
            .object({
              cliente: z.string().optional(),
              tecnico: z.string().optional()
            })
            .default({})
        })
      }),
      z.object({
        type: z.literal("UPDATE_OS"),
        payload: z.object({
          id: z.string(),
          updates: updateOrdemServicoSchema
        })
      })
    ])
  )
});
