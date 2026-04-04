import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChecklistTemplateByTechnicalType, getTechnicalTypeLabel } from "../../lib/technicalModules";
import { useOSStore } from "../../store/osStore";

type ChecklistStatus = "ok" | "atencao" | "critico" | "pendente";

type ChecklistEntry = {
  item: string;
  status: ChecklistStatus;
  note?: string;
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

    const template = getChecklistTemplateByTechnicalType(os.technicalType);
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
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand-100">OS #{os.id}</p>
        <h1 className="mt-1 text-2xl font-bold">Checklist dinâmico</h1>
        <p className="mt-2 text-sm text-brand-100">
          {os.titulo} · {getTechnicalTypeLabel(os.technicalType)}
        </p>
      </div>

      {entries.map((entry, index) => (
        <div key={`${entry.item}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
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
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
            className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
            placeholder="Observações do item"
          />
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(`/os/${os.id}`)}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800"
        >
          Salvar checklist
        </button>
      </div>
    </div>
  );
}
