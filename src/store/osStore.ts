import { create } from "zustand";
import { getAllOSLocal, saveOSLocal } from "../lib/db/storage";
import { createOrderSupabase, fetchOrdersSupabase, updateOrderSupabase } from "../lib/supabaseOrders";
import { isSupabaseConfigured, supabaseCompanyId } from "../lib/supabaseClient";
import type { TechnicalType } from "../lib/technicalModules";

export type OSStatus = "aberta" | "andamento" | "concluida";

export type OrdemServico = {
  id: string;
  titulo: string;
  cliente: string;
  equipamento: string;
  tecnico: string;
  technicalType: TechnicalType;
  tipoServico: string;
  prioridade: string;
  dataAgendada: string;
  observacoes?: string;
  status: OSStatus;
  createdAt?: string;
  fotos?: string[];
  checklist?: {
    item: string;
    status: "ok" | "atencao" | "critico" | "pendente";
    note?: string;
  }[];
  assinaturas?: {
    cliente?: string;
    tecnico?: string;
  };
};

const seedOrders: OrdemServico[] = [
  {
    id: "101",
    titulo: "Inspeção de ponte rolante",
    cliente: "Metalúrgica Alfa",
    equipamento: "Ponte Rolante 10T",
    tecnico: "Fernando Borges",
    technicalType: "PONTE_ROLANTE",
    tipoServico: "Inspeção",
    prioridade: "Alta",
    dataAgendada: "2026-04-03",
    observacoes:
      "Realizar inspeção completa da ponte rolante, verificando cabo de aço, freio, painel elétrico, botoeira e fim de curso.",
    status: "aberta",
    createdAt: "2026-04-02T12:00:00.000Z"
  },
  {
    id: "102",
    titulo: "Troca de contator",
    cliente: "Usinagem Delta",
    equipamento: "Quadro Elétrico QDG-01",
    tecnico: "Técnico João",
    technicalType: "ELETRICA",
    tipoServico: "Corretiva",
    prioridade: "Média",
    dataAgendada: "2026-04-03",
    observacoes: "Substituir contator principal do circuito de acionamento.",
    status: "andamento",
    createdAt: "2026-04-02T13:00:00.000Z"
  },
  {
    id: "103",
    titulo: "Revisão de talha elétrica",
    cliente: "Galpão Norte",
    equipamento: "Talha Elétrica 3T",
    tecnico: "Fernando Borges",
    technicalType: "PONTE_ROLANTE",
    tipoServico: "Preventiva",
    prioridade: "Baixa",
    dataAgendada: "2026-04-04",
    observacoes: "Inspecionar freio, botoeira e lubrificação geral.",
    status: "concluida",
    createdAt: "2026-04-02T14:00:00.000Z"
  }
];

type CreateOSInput = Omit<OrdemServico, "status"> & {
  status?: OSStatus;
};

type OSState = {
  orders: OrdemServico[];
  hasLoadedLocal: boolean;
  loadLocalOrders: () => Promise<void>;
  createOrder: (order: CreateOSInput) => Promise<OrdemServico>;
  updateOrder: (id: string, updates: Partial<OrdemServico>) => Promise<void>;
  getOrderById: (id?: string) => OrdemServico | undefined;
};

export const useOSStore = create<OSState>((set, get) => ({
  orders: seedOrders,
  hasLoadedLocal: false,
  loadLocalOrders: async () => {
    if (get().hasLoadedLocal) return;

    if (isSupabaseConfigured && supabaseCompanyId) {
      try {
        const remoteOrders = await fetchOrdersSupabase();
        if (remoteOrders.length) {
          set({ orders: remoteOrders, hasLoadedLocal: true });
          return;
        }
      } catch {
      }
    }

    const localOrders = (await getAllOSLocal()) as OrdemServico[];
    if (!localOrders.length) {
      set({ hasLoadedLocal: true });
      return;
    }

    const merged = [...seedOrders];
    for (const localOrder of localOrders) {
      const index = merged.findIndex((item) => item.id === localOrder.id);
      if (index >= 0) {
        merged[index] = localOrder;
      } else {
        merged.unshift(localOrder);
      }
    }

    set({ orders: merged, hasLoadedLocal: true });
  },
  createOrder: async (order) => {
    const created: OrdemServico = {
      ...order,
      status: order.status ?? "aberta"
    };

    if (isSupabaseConfigured && supabaseCompanyId) {
      try {
        const createdRemote = await createOrderSupabase(created);
        set((state) => ({
          orders: [createdRemote, ...state.orders.filter((item) => item.id !== createdRemote.id)]
        }));
        return createdRemote;
      } catch {
      }
    }

    set((state) => ({
      orders: [created, ...state.orders.filter((item) => item.id !== created.id)]
    }));

    await saveOSLocal(created);
    return created;
  },
  updateOrder: async (id, updates) => {
    const current = get().orders.find((item) => item.id === id);
    if (!current) return;

    const updated = { ...current, ...updates };

    set((state) => ({
      orders: state.orders.map((item) => (item.id === id ? updated : item))
    }));

    if (isSupabaseConfigured && supabaseCompanyId) {
      try {
        await updateOrderSupabase(id, updates);
      } catch {
      }
    }

    await saveOSLocal(updated);
  },
  getOrderById: (id) => get().orders.find((item) => item.id === id)
}));
