import { Router } from "express";
import { billingCharges, billingCustomers, processedBillingWebhookEvents } from "../data.js";
import { createAsaasCharge, createAsaasCustomer, getAsaasCharge } from "../lib/asaas.js";
import { asaasWebhookSchema, createBillingChargeSchema, createBillingCustomerSchema } from "../schemas.js";
import type { BillingAccessStatus, BillingChargeStatus } from "../types.js";
import { createId } from "../utils.js";

export const billingRouter = Router();

const ACTIVE_STATUSES: BillingChargeStatus[] = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];

function normalizeChargeStatus(status: string): BillingChargeStatus {
  const allowedStatuses: BillingChargeStatus[] = [
    "PENDING",
    "RECEIVED",
    "CONFIRMED",
    "OVERDUE",
    "REFUNDED",
    "RECEIVED_IN_CASH",
    "AWAITING_RISK_ANALYSIS",
    "CANCELLED"
  ];

  if (allowedStatuses.includes(status as BillingChargeStatus)) {
    return status as BillingChargeStatus;
  }

  return "PENDING";
}

function resolveAccessStatus(companyId: string): BillingAccessStatus {
  const companyRelatedCharges = billingCharges
    .filter((item) => item.companyId === companyId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (companyRelatedCharges.length === 0) {
    return "inactive";
  }

  return ACTIVE_STATUSES.includes(companyRelatedCharges[0].status) ? "active" : "inactive";
}

billingRouter.get("/access/:companyId", (req, res) => {
  const companyId = req.params.companyId.trim();
  const latestCharge = billingCharges
    .filter((item) => item.companyId === companyId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  return res.json({
    companyId,
    accessStatus: resolveAccessStatus(companyId),
    latestCharge: latestCharge || null
  });
});

billingRouter.post("/customers", async (req, res) => {
  const parsed = createBillingCustomerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados de cliente de cobrança inválidos",
      issues: parsed.error.flatten()
    });
  }

  const existing = billingCustomers.find((item) => item.companyId === parsed.data.companyId);
  if (existing) {
    return res.json(existing);
  }

  try {
    const createdOnAsaas = await createAsaasCustomer({
      name: parsed.data.name,
      email: parsed.data.email,
      cpfCnpj: parsed.data.cpfCnpj,
      phone: parsed.data.phone,
      externalReference: parsed.data.companyId
    });

    const created = {
      companyId: parsed.data.companyId,
      asaasCustomerId: createdOnAsaas.id,
      name: parsed.data.name,
      email: parsed.data.email,
      cpfCnpj: parsed.data.cpfCnpj,
      phone: parsed.data.phone,
      createdAt: new Date().toISOString()
    };

    billingCustomers.push(created);

    return res.status(201).json(created);
  } catch (error) {
    return res.status(502).json({
      error: "Falha ao criar cliente no Asaas",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

billingRouter.post("/charges", async (req, res) => {
  const parsed = createBillingChargeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados de cobrança inválidos",
      issues: parsed.error.flatten()
    });
  }

  const customer = parsed.data.customerId
    ? billingCustomers.find((item) => item.asaasCustomerId === parsed.data.customerId)
    : billingCustomers.find((item) => item.companyId === parsed.data.companyId);

  if (!customer) {
    return res.status(404).json({
      error: "Cliente de cobrança não encontrado para a empresa"
    });
  }

  const externalReference = parsed.data.externalReference || `${parsed.data.companyId}-${Date.now()}`;
  const duplicated = billingCharges.find(
    (item) =>
      item.companyId === parsed.data.companyId && item.externalReference === externalReference
  );

  if (duplicated) {
    return res.json({
      ...duplicated,
      accessStatus: resolveAccessStatus(duplicated.companyId)
    });
  }

  try {
    const createdOnAsaas = await createAsaasCharge({
      customer: customer.asaasCustomerId,
      value: parsed.data.value,
      dueDate: parsed.data.dueDate,
      description: parsed.data.description,
      billingType: parsed.data.billingType,
      externalReference
    });

    const now = new Date().toISOString();
    const created = {
      id: createId(),
      companyId: parsed.data.companyId,
      asaasCustomerId: customer.asaasCustomerId,
      asaasPaymentId: createdOnAsaas.id,
      value: createdOnAsaas.value,
      dueDate: createdOnAsaas.dueDate,
      billingType: createdOnAsaas.billingType,
      status: normalizeChargeStatus(createdOnAsaas.status),
      externalReference,
      description: parsed.data.description,
      invoiceUrl: createdOnAsaas.invoiceUrl,
      bankSlipUrl: createdOnAsaas.bankSlipUrl,
      createdAt: now,
      updatedAt: now
    };

    billingCharges.unshift(created);

    return res.status(201).json({
      ...created,
      accessStatus: resolveAccessStatus(created.companyId)
    });
  } catch (error) {
    return res.status(502).json({
      error: "Falha ao criar cobrança no Asaas",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

billingRouter.get("/charges/:id", async (req, res) => {
  const charge = billingCharges.find(
    (item) => item.id === req.params.id || item.asaasPaymentId === req.params.id
  );

  if (!charge) {
    return res.status(404).json({ error: "Cobrança não encontrada" });
  }

  try {
    const refreshed = await getAsaasCharge(charge.asaasPaymentId);
    const nextStatus = normalizeChargeStatus(refreshed.status);

    const updated = {
      ...charge,
      status: nextStatus,
      value: refreshed.value,
      dueDate: refreshed.dueDate,
      billingType: refreshed.billingType,
      externalReference: refreshed.externalReference || charge.externalReference,
      invoiceUrl: refreshed.invoiceUrl,
      bankSlipUrl: refreshed.bankSlipUrl,
      updatedAt: new Date().toISOString()
    };

    const index = billingCharges.findIndex((item) => item.id === charge.id);
    billingCharges[index] = updated;

    return res.json({
      ...updated,
      accessStatus: resolveAccessStatus(updated.companyId)
    });
  } catch (error) {
    return res.status(502).json({
      error: "Falha ao consultar cobrança no Asaas",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

billingRouter.post("/webhooks/asaas", (req, res) => {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (expectedToken) {
    const receivedToken =
      req.header("asaas-access-token") ||
      req.header("x-asaas-access-token") ||
      req.header("authorization");

    if (receivedToken !== expectedToken) {
      return res.status(401).json({ error: "Webhook não autorizado" });
    }
  }

  const parsed = asaasWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Webhook inválido",
      issues: parsed.error.flatten()
    });
  }

  const eventKey =
    parsed.data.id ||
    `${parsed.data.event}:${parsed.data.payment?.id || "without-payment"}:${parsed.data.payment?.status || "unknown"}`;

  if (processedBillingWebhookEvents.has(eventKey)) {
    return res.json({
      ok: true,
      duplicate: true
    });
  }

  if (parsed.data.payment?.id) {
    const charge = billingCharges.find((item) => item.asaasPaymentId === parsed.data.payment?.id);
    if (charge) {
      charge.status = normalizeChargeStatus(parsed.data.payment.status);
      charge.value = parsed.data.payment.value ?? charge.value;
      charge.dueDate = parsed.data.payment.dueDate ?? charge.dueDate;
      charge.invoiceUrl = parsed.data.payment.invoiceUrl ?? charge.invoiceUrl;
      charge.bankSlipUrl = parsed.data.payment.bankSlipUrl ?? charge.bankSlipUrl;
      charge.updatedAt = new Date().toISOString();
    }
  }

  processedBillingWebhookEvents.add(eventKey);

  return res.json({
    ok: true,
    event: parsed.data.event
  });
});
