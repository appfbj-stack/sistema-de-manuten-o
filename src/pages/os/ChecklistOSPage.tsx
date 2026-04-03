import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOSStore } from "../../store/osStore";

type ChecklistStatus = "ok" | "atencao" | "critico" | "pendente";

type ChecklistEntry = {
  item: string;
  status: ChecklistStatus;
  note?: string;
};

const templates: Record<string, string[]> = {
  Inspeção: ["Cabo de aço", "Freio", "Gancho", "Botoeira", "Fim de curso", "Painel elétrico"],
  Preventiva: ["Lubrificação", "Fixações", "Painel elétrico", "Contatores", "Proteções"],
  Corretiva: ["Diagnóstico", "Peça danificada", "Substituição", "Teste funcional"],
  Instalação: ["Base", "Alinhamento", "Ligação elétrica", "Teste de operação"]
};

export function ChecklistOSPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);
  const updateOrder = useOSStore((state) => state.updateOrder);
  const os = useOSStore((state) => state.getOrderById(id));

  const baseChecklist = useMemo<ChecklistEntry[]>(() => {
    if (!os) return [];
    if (os.checklist?.length) return os.checklist;

    const template = templates[os.tipoServico] ?? templates.Inspeção;
    return template.map((item) => ({
      item,
      status: "pendente"
    }));
  }, [os]);

  const [entries, setEntries] = useState<ChecklistEntry[]>([]);

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  useEffect(() => {
    setEntries(baseChecklist);
  }, [baseChecklist]);

  if (!os) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Checklist OS #{id}</p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Ordem de serviço não encontrada.</p>
        </div>
      </div>
    );
  }

  const updateEntry = (index: number, patch: Partial<ChecklistEntry>) => {
    setEntries((current) => current.map((entry, idx) => (idx === index ? { ...entry, ...patch } : entry)));
  };

  const handleSave = async () => {
    await updateOrder(os.id, {
      checklist: entries,
      status: "andamento"
    });

    alert("Checklist salvo com sucesso.");
    navigate(`/os/${os.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">OS #{os.id}</p>
        <h1 className="text-2xl font-bold text-slate-900">Checklist dinâmico</h1>
        <p className="mt-1 text-sm text-slate-500">{os.titulo}</p>
      </div>

      {entries.map((entry, index) => (
        <div key={`${entry.item}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">{entry.item}</h2>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["ok", "atencao", "critico", "pendente"] as ChecklistStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateEntry(index, { status })}
                className={`rounded-xl px-3 py-2 text-sm font-medium capitalize ${
                  entry.status === status
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <textarea
            value={entry.note ?? ""}
            onChange={(event) => updateEntry(index, { note: event.target.value })}
            rows={3}
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Observações do item"
          />
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(`/os/${os.id}`)}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-brand-700 px-4 py-3 font-medium text-white"
        >
          Salvar checklist
        </button>
      </div>
    </div>
  );
}
