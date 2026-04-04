import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useOSStore } from "../../store/osStore";

export function OrdensPage() {
  const navigate = useNavigate();
  const ordens = useOSStore((state) => state.orders);
  const loadLocalOrders = useOSStore((state) => state.loadLocalOrders);

  useEffect(() => {
    void loadLocalOrders();
  }, [loadLocalOrders]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand-100">Ordens de Serviço</p>
        <h1 className="mt-1 text-2xl font-bold">Painel de OS</h1>
        <p className="mt-2 text-sm text-brand-100">
          Acompanhe andamento, acesse detalhes e abra novas ordens rapidamente.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Lista de ordens</h2>
        <button
          onClick={() => navigate("/os/nova")}
          className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          Nova OS
        </button>
      </div>

      {ordens.map((os) => (
        <button
          key={os.id}
          onClick={() => navigate(`/os/${os.id}`)}
          className="block w-full rounded-2xl text-left transition hover:-translate-y-0.5"
        >
          <Card className="hover:ring-brand-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800">{os.titulo}</h3>
                <p className="text-sm text-slate-500">{os.cliente}</p>
              </div>
              <StatusBadge status={os.status} />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
