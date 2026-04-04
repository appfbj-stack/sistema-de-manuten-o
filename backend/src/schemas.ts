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

export const createBillingCustomerSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional(),
  cpfCnpj: z.string().min(11).max(18).optional(),
  phone: z.string().min(8).max(20).optional()
});

export const createBillingChargeSchema = z.object({
  companyId: z.string().min(1),
  customerId: z.string().optional(),
  value: z.number().positive(),
  dueDate: z.string().min(8),
  description: z.string().min(3).optional(),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "UNDEFINED"]).default("PIX"),
  externalReference: z.string().min(3).optional()
});

export const asaasWebhookSchema = z.object({
  id: z.string().optional(),
  event: z.string(),
  payment: z
    .object({
      id: z.string(),
      customer: z.string().optional(),
      value: z.number().optional(),
      status: z.string(),
      dueDate: z.string().optional(),
      billingType: z.string().optional(),
      externalReference: z.string().optional(),
      invoiceUrl: z.string().optional(),
      bankSlipUrl: z.string().optional()
    })
    .optional()
});
