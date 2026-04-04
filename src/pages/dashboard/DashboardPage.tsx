import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuthStore } from "../../store/authStore";
import { useOSStore } from "../../store/osStore";

export function DashboardPage() {
  const PAGE_SIZE = 5;
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const orders = useOSStore((state) => state.orders);
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | "aberta" | "andamento" | "concluida">(
    "todos"
  );
  const [tecnicoFilter, setTecnicoFilter] = useState("todos");
  const [clienteFilter, setClienteFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void loadLocalOrders(true);
  }, [loadLocalOrders]);

  const metricas = useMemo(() => {
    const abertas = orders.filter((item) => item.status === "aberta").length;
    const andamento = orders.filter((item) => item.status === "andamento").length;
    const concluidas = orders.filter((item) => item.status === "concluida").length;
    const tecnicosAtivos = new Set(
      orders
        .filter((item) => item.status === "aberta" || item.status === "andamento")
        .map((item) => item.tecnico)
    ).size;

    return {
      total: orders.length,
      abertas,
      andamento,
      concluidas,
      tecnicosAtivos
    };
  }, [orders]);

  const ordensRecentes = useMemo(() => {
    return [...orders]
      .sort((a, b) => (new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()))
      .slice(0, 10);
  }, [orders]);

  const tecnicosDisponiveis = useMemo(() => {
    return [...new Set(orders.map((item) => item.tecnico).filter((item) => item.trim()))].sort();
  }, [orders]);

  const clientesDisponiveis = useMemo(() => {
    return [...new Set(orders.map((item) => item.cliente).filter((item) => item.trim()))].sort();
  }, [orders]);

  const ordensFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ordensRecentes.filter((order) => {
      const statusOk = statusFilter === "todos" || order.status === statusFilter;
      const tecnicoOk = tecnicoFilter === "todos" || order.tecnico === tecnicoFilter;
      const clienteOk = clienteFilter === "todos" || order.cliente === clienteFilter;
      const searchOk =
        !term ||
        order.titulo.toLowerCase().includes(term) ||
        order.cliente.toLowerCase().includes(term) ||
        order.tecnico.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term);
      return statusOk && tecnicoOk && clienteOk && searchOk;
    });
  }, [clienteFilter, ordensRecentes, searchTerm, statusFilter, tecnicoFilter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(ordensFiltradas.length / PAGE_SIZE));
  }, [PAGE_SIZE, ordensFiltradas.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, tecnicoFilter, clienteFilter, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const ordensPaginadas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return ordensFiltradas.slice(start, start + PAGE_SIZE);
  }, [PAGE_SIZE, currentPage, ordensFiltradas]);

  const porTecnico = useMemo(() => {
    const agrupado = new Map<string, { total: number; andamento: number; concluidas: number }>();
    for (const order of orders) {
      const current = agrupado.get(order.tecnico) ?? { total: 0, andamento: 0, concluidas: 0 };
      current.total += 1;
      if (order.status === "andamento") current.andamento += 1;
      if (order.status === "concluida") current.concluidas += 1;
      agrupado.set(order.tecnico, current);
    }
    return [...agrupado.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [orders]);

  const atualizarPainel = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadLocalOrders(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportarCsv = () => {
    if (!ordensFiltradas.length) return;
    const escapeCsv = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;
    const linhas = [
      ["OS", "Título", "Cliente", "Técnico", "Status", "Prioridade", "Data agendada", "Criado em"],
      ...ordensFiltradas.map((order) => [
        order.id,
        order.titulo,
        order.cliente,
        order.tecnico,
        order.status,
        order.prioridade,
        order.dataAgendada || "",
        order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR", { hour12: false }) : ""
      ])
    ];
    const csvContent = linhas.map((linha) => linha.map((item) => escapeCsv(item)).join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `painel-os-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand-100">Painel do dono</p>
        <h1 className="mt-1 text-2xl font-bold">{user?.name ?? "Administrador"}</h1>
        <p className="mt-2 text-sm text-brand-100">
          Acompanhe todas as OS dos técnicos em campo. Ao cadastrar e finalizar, os dados já ficam
          salvos no banco e aparecem aqui.
        </p>
        <button
          type="button"
          onClick={() => void atualizarPainel()}
          disabled={isRefreshing}
          className="mt-4 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25 disabled:opacity-70"
        >
          {isRefreshing ? "Atualizando..." : "Atualizar painel"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total OS</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metricas.total}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Abertas</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{metricas.abertas}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Em Andamento</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{metricas.andamento}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Concluídas</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{metricas.concluidas}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Técnicos ativos</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metricas.tecnicosAtivos}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">OS por técnico</h2>
        <div className="mt-3 space-y-2">
          {porTecnico.length ? (
            porTecnico.map(([tecnico, info]) => (
              <div
                key={tecnico}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <strong className="text-slate-800">{tecnico}</strong>
                <span className="text-slate-600">
                  {info.total} OS · {info.andamento} em andamento · {info.concluidas} concluídas
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sem ordens para exibir.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Últimas OS em campo</h2>
          <button
            type="button"
            onClick={exportarCsv}
            disabled={!ordensFiltradas.length}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar CSV
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "todos" | "aberta" | "andamento" | "concluida")
            }
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
          >
            <option value="todos">Status: Todos</option>
            <option value="aberta">Status: Aberta</option>
            <option value="andamento">Status: Em andamento</option>
            <option value="concluida">Status: Concluída</option>
          </select>

          <select
            value={tecnicoFilter}
            onChange={(event) => setTecnicoFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
          >
            <option value="todos">Técnico: Todos</option>
            {tecnicosDisponiveis.map((tecnico) => (
              <option key={tecnico} value={tecnico}>
                Técnico: {tecnico}
              </option>
            ))}
          </select>

          <select
            value={clienteFilter}
            onChange={(event) => setClienteFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:bg-white sm:col-span-2"
          >
            <option value="todos">Cliente: Todos</option>
            {clientesDisponiveis.map((cliente) => (
              <option key={cliente} value={cliente}>
                Cliente: {cliente}
              </option>
            ))}
          </select>

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:bg-white sm:col-span-2"
            placeholder="Buscar por OS, título, cliente ou técnico"
          />
        </div>

        <div className="mt-3 space-y-2">
          {ordensPaginadas.length ? (
            ordensPaginadas.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/os/${order.id}`)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{order.titulo}</p>
                    <p className="text-xs text-slate-500">
                      {order.cliente} · {order.tecnico}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">OS #{order.id}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500">Nenhuma OS encontrada com os filtros selecionados.</p>
          )}
        </div>

        {ordensFiltradas.length ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-600">
              Página {currentPage} de {totalPages} · {ordensFiltradas.length} resultado(s)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
