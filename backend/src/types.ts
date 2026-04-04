export type EntityId = string;

export type OrdemServicoStatus = "aberta" | "andamento" | "concluida";

export type Cliente = {
  id: EntityId;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
};

export type Equipamento = {
  id: EntityId;
  nome: string;
  tipo: string;
  clienteId: EntityId;
  numeroSerie?: string;
};

export type Tecnico = {
  id: EntityId;
  nome: string;
  contato: string;
  especialidade: string;
};

export type ChecklistItem = {
  item: string;
  status: "ok" | "atencao" | "critico" | "pendente";
  note?: string;
};

export type AssinaturasOS = {
  cliente?: string;
  tecnico?: string;
};

export type OrdemServico = {
  id: EntityId;
  titulo: string;
  clienteId: EntityId;
  equipamentoId: EntityId;
  tecnicoId: EntityId;
  tipoServico: string;
  prioridade: string;
  dataAgendada: string;
  observacoes?: string;
  status: OrdemServicoStatus;
  createdAt: string;
  fotos: string[];
  checklist: ChecklistItem[];
  assinaturas: AssinaturasOS;
};

export type SyncQueueAction =
  | { type: "CREATE_OS"; payload: OrdemServico }
  | { type: "UPDATE_OS"; payload: { id: string; updates: Partial<OrdemServico> } };

export type BillingAccessStatus = "active" | "inactive";

export type CompanyBillingCustomer = {
  companyId: string;
  asaasCustomerId: string;
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  createdAt: string;
};

export type BillingChargeStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "AWAITING_RISK_ANALYSIS"
  | "CANCELLED";

export type CompanyBillingCharge = {
  id: string;
  companyId: string;
  asaasCustomerId: string;
  asaasPaymentId: string;
  value: number;
  dueDate: string;
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
  status: BillingChargeStatus;
  externalReference: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCode?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};
