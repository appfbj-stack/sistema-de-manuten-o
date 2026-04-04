type AsaasCustomerInput = {
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  externalReference?: string;
};

type AsaasChargeInput = {
  customer: string;
  value: number;
  dueDate: string;
  description?: string;
  billingType?: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
  externalReference?: string;
};

function getAsaasConfig() {
  const apiKey = process.env.ASAAS_API_KEY;
  const baseUrl = process.env.ASAAS_BASE_URL || "https://sandbox.asaas.com/api/v3";

  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada");
  }

  return { apiKey, baseUrl };
}

async function asaasRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { apiKey, baseUrl } = getAsaasConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...(init?.headers || {})
    }
  });

  const rawBody = await response.text();
  let parsedBody: unknown = {};

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = { message: rawBody };
    }
  }

  if (!response.ok) {
    throw new Error(`Asaas ${response.status}: ${JSON.stringify(parsedBody)}`);
  }

  return parsedBody as T;
}

export async function createAsaasCustomer(payload: AsaasCustomerInput) {
  return asaasRequest<{ id: string; name: string }>("/customers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function createAsaasCharge(payload: AsaasChargeInput) {
  return asaasRequest<{
    id: string;
    status: string;
    customer: string;
    value: number;
    dueDate: string;
    billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
    invoiceUrl?: string;
    bankSlipUrl?: string;
    externalReference?: string;
  }>("/payments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAsaasCharge(paymentId: string) {
  return asaasRequest<{
    id: string;
    status: string;
    customer: string;
    value: number;
    dueDate: string;
    billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
    invoiceUrl?: string;
    bankSlipUrl?: string;
    externalReference?: string;
  }>(`/payments/${paymentId}`);
}
