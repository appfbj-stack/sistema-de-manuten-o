import type { Cliente, Equipamento, OrdemServico, Tecnico } from "./types.js";

export const clientes: Cliente[] = [
  {
    id: "1",
    nome: "Metalúrgica Alfa",
    telefone: "(15) 99999-0001",
    email: "contato@metalurgicaalfa.com.br",
    endereco: "Sorocaba, SP"
  },
  {
    id: "2",
    nome: "Usinagem Delta",
    telefone: "(15) 99999-0002",
    email: "manutencao@usinagemdelta.com.br",
    endereco: "Boituva, SP"
  }
];

export const equipamentos: Equipamento[] = [
  {
    id: "1",
    nome: "Ponte Rolante 10T",
    tipo: "Ponte rolante",
    clienteId: "1",
    numeroSerie: "PR10T-2026"
  },
  {
    id: "2",
    nome: "Talha Elétrica 3T",
    tipo: "Talha",
    clienteId: "1",
    numeroSerie: "TE3T-2026"
  },
  {
    id: "3",
    nome: "Quadro Elétrico QDG-01",
    tipo: "Elétrica",
    clienteId: "2",
    numeroSerie: "QDG01-2026"
  }
];

export const tecnicos: Tecnico[] = [
  {
    id: "1",
    nome: "Fernando Borges",
    contato: "(15) 99999-1001",
    especialidade: "Ponte rolante e elétrica"
  },
  {
    id: "2",
    nome: "Técnico João",
    contato: "(15) 99999-1002",
    especialidade: "Elétrica industrial"
  }
];

export const ordensServico: OrdemServico[] = [
  {
    id: "101",
    titulo: "Inspeção de ponte rolante",
    clienteId: "1",
    equipamentoId: "1",
    tecnicoId: "1",
    tipoServico: "Inspeção",
    prioridade: "Alta",
    dataAgendada: "2026-04-03",
    observacoes:
      "Realizar inspeção completa da ponte rolante, verificando cabo de aço, freio e painel.",
    status: "aberta",
    createdAt: "2026-04-02T12:00:00.000Z",
    fotos: [],
    checklist: [],
    assinaturas: {}
  },
  {
    id: "102",
    titulo: "Troca de contator",
    clienteId: "2",
    equipamentoId: "3",
    tecnicoId: "2",
    tipoServico: "Corretiva",
    prioridade: "Média",
    dataAgendada: "2026-04-03",
    observacoes: "Substituir contator principal do circuito de acionamento.",
    status: "andamento",
    createdAt: "2026-04-02T13:00:00.000Z",
    fotos: [],
    checklist: [],
    assinaturas: {}
  }
];
