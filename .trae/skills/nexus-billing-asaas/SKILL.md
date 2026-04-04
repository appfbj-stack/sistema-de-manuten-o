---
name: "nexus-billing-asaas"
description: "Integrates Asaas billing (customers, charges, webhooks) and access checks. Invoke when configuring billing, creating charges, or auditing access status."
---

# Nexus Billing (Asaas)

## Objective
- Create customers and charges in Asaas (sandbox/production).
- Validate webhooks and reflect payment status into backend access (active/inactive).
- Audit access status per company.

## Prerequisites
- Backend running and reachable.
- Backend .env configured:
  - `ASAAS_API_KEY`
  - `ASAAS_BASE_URL` (e.g. `https://sandbox.asaas.com/api/v3`)
  - `ASAAS_ENV` (`sandbox` or `production`)
  - `ASAAS_WEBHOOK_TOKEN`

## Usage
1) Create customer
   - `POST /billing/customers`
   - Body: `{ companyId, name, email, cpfCnpj }`
2) Create charge
   - `POST /billing/charges`
   - Body: `{ companyId, value, dueDate, description, billingType, externalReference }`
3) Check access
   - `GET /billing/access/:companyId`
4) Webhook
   - Expose a secure endpoint and validate `ASAAS_WEBHOOK_TOKEN`
   - Update company access status when payment is confirmed

## Troubleshooting
- `401 invalid_access_token` → set a valid `ASAAS_API_KEY`.
- `404 cliente não encontrado` → create a customer before creating a charge.
- Access remains `inactive` until payment is settled by Asaas (webhook event).

## Security
- Never commit API keys. Use `.env` and secrets in deploy.
